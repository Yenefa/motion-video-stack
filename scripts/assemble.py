"""Render the template, mix audio if present, and mux the final MP4.

Usage:
  python scripts/assemble.py               # full pipeline
  python scripts/assemble.py --skip-render # reuse out/demo-silent.mp4
  python scripts/assemble.py --skip-mix    # reuse audio/mix-final.m4a

Environment:
  FFMPEG, FFPROBE          tool paths (default: PATH)
  REMOTION_BROWSER         optional Chrome/Chromium executable for Remotion
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out"
SILENT = OUT / "demo-silent.mp4"
FINAL = OUT / "demo.mp4"
MIX = ROOT / "audio" / "mix-final.m4a"


def tool(name: str) -> str:
    env_name = name.upper()
    explicit = os.environ.get(env_name)
    if explicit:
        if Path(explicit).exists():
            return explicit
        raise SystemExit(f"{env_name} points to a missing file: {explicit}")
    found = shutil.which(name)
    if found:
        return found
    raise SystemExit(f"{name} not found. Install it or set {env_name}.")


def run(cmd: list[str], **kwargs) -> None:
    print("+", " ".join(str(x) for x in cmd), flush=True)
    subprocess.run(cmd, check=True, cwd=ROOT, **kwargs)


def render() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    node = shutil.which("node")
    if not node:
        raise SystemExit("node not found. Install Node.js 20+ first.")
    cli = ROOT / "node_modules" / "@remotion" / "cli" / "remotion-cli.js"
    if not cli.exists():
        raise SystemExit("dependencies missing; run npm ci first")
    cmd = [
        node, str(cli), "render", "src/index.tsx", "MotionStackTemplate",
        str(SILENT),
        "--codec=h264", "--pixel-format=yuv420p",
        "--concurrency=4", "--crf=18", "--muted",
    ]
    browser = os.environ.get("REMOTION_BROWSER")
    if browser:
        cmd.append(f"--browser-executable={browser}")
    run(cmd)


def mix() -> None:
    run([sys.executable, str(ROOT / "scripts" / "mix_audio.py")])


def mux() -> None:
    ffmpeg = tool("ffmpeg")
    if MIX.exists():
        run([
            ffmpeg, "-y", "-v", "error",
            "-i", str(SILENT), "-i", str(MIX),
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart", str(FINAL),
        ])
    else:
        print("no audio/mix-final.m4a; writing silent deliverable")
        shutil.copyfile(SILENT, FINAL)


def probe() -> None:
    ffprobe = tool("ffprobe")
    out = subprocess.check_output(
        [
            ffprobe, "-v", "error",
            "-show_entries", "stream=codec_type,width,height,r_frame_rate,nb_frames,duration",
            "-show_entries", "format=duration,size",
            "-of", "json", str(FINAL),
        ],
        text=True,
    )
    data = json.loads(out)
    print(json.dumps(data, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-render", action="store_true")
    parser.add_argument("--skip-mix", action="store_true")
    args = parser.parse_args()

    if not args.skip_render:
        render()
    if not SILENT.exists():
        raise SystemExit(f"missing {SILENT}; run without --skip-render")
    if not args.skip_mix:
        mix()
    mux()
    print(f"final: {FINAL} ({FINAL.stat().st_size / 1024 / 1024:.1f} MB)")
    probe()


if __name__ == "__main__":
    main()
