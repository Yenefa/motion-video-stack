"""Build public/timeline.json, public/cues.json and public/subtitles.srt.

Inputs:
  content/project.json    project-level fps/size/music/loudness target
  content/scenes.json     ordered scene list (seconds)
  content/narration.json  optional narration placements
  content/cues.json       optional caption cues

The script is intentionally content-agnostic: it never reads images or videos,
only durations and metadata. If a narration duration is omitted, ffprobe is
used to measure the file. Set FFPROBE=/path/to/ffprobe if it is not on PATH.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
PUBLIC = ROOT / "public"


def find_tool(binary: str, env_name: str) -> str:
    explicit = os.environ.get(env_name)
    if explicit:
        path = Path(explicit)
        if path.exists():
            return str(path)
        raise SystemExit(f"{env_name} points to a missing file: {explicit}")
    found = shutil.which(binary)
    if found:
        return found
    raise SystemExit(
        f"{binary} not found. Install FFmpeg and add it to PATH, "
        f"or set {env_name}=/path/to/{binary}."
    )


def probe_duration(path: Path) -> float:
    ffprobe = find_tool("ffprobe", "FFPROBE")
    out = subprocess.check_output(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
    )
    return float(out.strip())


def srt_time(x: float) -> str:
    ms = round(x * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> None:
    project = json.loads((CONTENT / "project.json").read_text(encoding="utf-8"))
    scene_config = json.loads((CONTENT / "scenes.json").read_text(encoding="utf-8"))
    narration_config = json.loads((CONTENT / "narration.json").read_text(encoding="utf-8"))
    cue_config = json.loads((CONTENT / "cues.json").read_text(encoding="utf-8"))

    fps = int(project["fps"])
    width = int(project["width"])
    height = int(project["height"])
    expected = float(project["expected_seconds"])

    scenes = []
    t = 0.0
    for item in scene_config:
        seconds = float(item["seconds"])
        frames = round(seconds * fps)
        if frames < 1:
            raise SystemExit(f"scene {item.get('id')} is shorter than one frame")
        scenes.append(
            {
                "id": item["id"],
                "kind": item["kind"],
                "start": round(t, 3),
                "seconds": seconds,
                "frames": frames,
                "title": item.get("title", ""),
                "chapter": item.get("chapter", ""),
                "details": item.get("details", []),
            }
        )
        t += frames / fps

    total = round(t, 3)
    if abs(total - expected) > 0.011:
        raise SystemExit(f"scene total {total}s does not match expected_seconds {expected}s")
    total_frames = round(total * fps)

    narration = []
    for item in narration_config:
        audio_path = ROOT / "audio" / item["file"]
        if not audio_path.exists():
            raise SystemExit(f"missing narration file: {audio_path}")
        duration = item.get("duration")
        if duration is None:
            duration = probe_duration(audio_path)
        start = float(item["start"])
        narration.append(
            {
                "id": item["id"],
                "file": item["file"],
                "start": round(start, 3),
                "duration": round(float(duration), 3),
                "end": round(start + float(duration), 3),
            }
        )
    narration.sort(key=lambda x: x["start"])
    for a, b in zip(narration, narration[1:]):
        if a["end"] > b["start"] + 0.001:
            raise SystemExit(f"narration overlap: {a['id']} ends {a['end']} > {b['start']}")
    if narration and narration[-1]["end"] > total:
        raise SystemExit("last narration ends after the film")

    music = project.get("music")
    if music:
        if not (ROOT / music).exists():
            raise SystemExit(f"missing music file: {music}")

    cues = cue_config.get("cues", [])
    for cue in cues:
        if not (0 <= cue["start"] < cue["end"] <= total):
            raise SystemExit(f"cue out of range: {cue}")
        if len(cue.get("lines", [])) > 2:
            print(f"warning: cue has more than 2 lines: {cue}", file=sys.stderr)
        for line in cue.get("lines", []):
            if len(line) > 22:
                print(f"warning: cue line longer than 22 chars: {line}", file=sys.stderr)
    cues.sort(key=lambda c: c["start"])

    timeline = {
        "fps": fps,
        "width": width,
        "height": height,
        "seconds": total,
        "frames": total_frames,
        "music": music,
        "target_lufs": float(project.get("target_lufs", -17.0)),
        "scenes": scenes,
        "narration": narration,
        "native_audio": None,
    }
    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (PUBLIC / "cues.json").write_text(
        json.dumps({"cues": cues}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    srt = []
    for i, cue in enumerate(cues, 1):
        srt.append(
            f"{i}\n{srt_time(cue['start'])} --> {srt_time(cue['end'])}\n"
            + "\n".join(cue["lines"])
            + "\n"
        )
    (PUBLIC / "subtitles.srt").write_text("\n".join(srt), encoding="utf-8")

    print(
        json.dumps(
            {
                "seconds": total,
                "frames": total_frames,
                "scenes": len(scenes),
                "narration": len(narration),
                "cues": len(cues),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
