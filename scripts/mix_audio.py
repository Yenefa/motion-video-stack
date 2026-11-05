"""Mix narration + optional music into audio/mix-final.m4a.

Reads public/timeline.json:
  seconds, narration[], native_audio?, music?

Strategy:
  1. place every narration segment at its timeline start with adelay;
  2. mix voices with normalize=0 (no auto gain);
  3. optionally duck the music to a fixed low level and mute it during the
     native-audio segment with 0.3s ramps;
  4. measure integrated loudness, then apply one static gain (not loudnorm,
     which behaves like an AGC), and limit the true peak.

Environment:
  FFMPEG=/path/to/ffmpeg   (defaults to ffmpeg on PATH)
  MUSIC_LEVEL=0.12         linear music gain
  TARGET_I=-17.0           integrated loudness target
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TIMELINE = ROOT / "public" / "timeline.json"
MUSIC_LEVEL = float(os.environ.get("MUSIC_LEVEL", "0.12"))


def find_ffmpeg() -> str:
    explicit = os.environ.get("FFMPEG")
    if explicit:
        if Path(explicit).exists():
            return explicit
        raise SystemExit(f"FFMPEG points to a missing file: {explicit}")
    found = shutil.which("ffmpeg")
    if found:
        return found
    raise SystemExit("ffmpeg not found. Install FFmpeg or set FFMPEG=/path/to/ffmpeg.")


FF = find_ffmpeg()


def measure_i(path: Path) -> float:
    proc = subprocess.run(
        [FF, "-hide_banner", "-nostdin", "-i", str(path), "-filter_complex",
         "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    match = re.findall(r"I:\s+(-?\d+(?:\.\d+)?) LUFS", proc.stderr)
    if not match:
        raise RuntimeError("no loudness measurement\n" + proc.stderr[-2000:])
    return float(match[-1])


def main() -> None:
    plan = json.loads(TIMELINE.read_text(encoding="utf-8"))
    total = float(plan["seconds"])
    target_i = float(os.environ.get("TARGET_I", plan.get("target_lufs", -17.0)))
    placements = plan.get("narration", [])
    native = plan.get("native_audio")
    music = plan.get("music")

    if not placements and not native and not music:
        print("no narration/music in timeline; skip audio mix")
        return

    inputs: list[str] = []
    input_count = 0
    music_index = None
    if music:
        music_path = ROOT / music
        if not music_path.exists():
            raise SystemExit(f"missing music file: {music_path}")
        music_index = input_count
        input_count += 1
        inputs += ["-stream_loop", "-1", "-i", str(music_path)]

    voice_entries = []
    for p in placements:
        idx = input_count
        input_count += 1
        inputs += ["-i", str(ROOT / "audio" / p["file"])]
        voice_entries.append((idx, float(p["start"])))
    if native:
        if "file" not in native:
            raise SystemExit("timeline.native_audio must contain a file")
        idx = input_count
        input_count += 1
        inputs += ["-i", str(ROOT / "audio" / native["file"])]
        voice_entries.append((idx, float(native["start"])))

    def build(gain_db: float, out_name: str) -> None:
        filters = []
        labels = []
        for i, (idx, start) in enumerate(voice_entries):
            ms = round(start * 1000)
            vol = 0.50 if native and i == len(voice_entries) - 1 else 1.0
            filters.append(
                f"[{idx}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
                f"adelay={ms}|{ms},volume={vol}[v{i}]"
            )
            labels.append(f"[v{i}]")
        if labels:
            filters.append(
                "".join(labels)
                + f"amix=inputs={len(labels)}:duration=longest:normalize=0,"
                + f"apad=whole_dur={total},atrim=0:{total}[voice]"
            )

        if music_index is not None:
            if native:
                mute_start = float(native["start"]) - 0.30
                mute_end = float(native["end"])
                expr = (
                    f"if(lt(t,{mute_start:.3f}),1,"
                    f"if(lt(t,{mute_start + 0.3:.3f}),1-(t-{mute_start:.3f})/0.3,"
                    f"if(lt(t,{mute_end:.3f}),0,"
                    f"if(lt(t,{mute_end + 0.3:.3f}),(t-{mute_end:.3f})/0.3,1))))"
                )
                mute = f",volume=volume='{expr}':eval=frame"
            else:
                mute = ""
            filters.append(
                f"[{music_index}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
                f"atrim=0:{total},asetpts=PTS-STARTPTS,volume={MUSIC_LEVEL}{mute},"
                f"afade=t=out:st={total - 3.0:.3f}:d=3.0[music]"
            )
            if labels:
                filters.append(
                    f"[voice][music]amix=inputs=2:duration=first:normalize=0,"
                    f"volume={gain_db:.2f}dB,alimiter=limit=0.80:level=0[aout]"
                )
            else:
                filters.append(
                    f"[music]volume={gain_db:.2f}dB,alimiter=limit=0.80:level=0[aout]"
                )
        else:
            filters.append(f"[voice]volume={gain_db:.2f}dB,alimiter=limit=0.80:level=0[aout]")

        out = ROOT / "audio" / out_name
        cmd = [
            FF, "-hide_banner", "-nostdin", "-y", *inputs,
            "-filter_complex", ";".join(filters),
            "-map", "[aout]", "-t", str(total),
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
            "-movflags", "+faststart", str(out),
        ]
        print("RUN", out.name, "gain", round(gain_db, 2), flush=True)
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    build(0.0, "mix-raw.m4a")
    measured = measure_i(ROOT / "audio" / "mix-raw.m4a")
    gain = target_i - measured
    print(f"mix raw I {measured:.2f} LUFS; static gain {gain:+.2f} dB")
    build(gain, "mix-final.m4a")
    final = measure_i(ROOT / "audio" / "mix-final.m4a")
    print(f"mix-final.m4a {final:.2f} LUFS")
    if final < target_i - 1.0:
        print("warning: final loudness is far below target", file=sys.stderr)


if __name__ == "__main__":
    main()
