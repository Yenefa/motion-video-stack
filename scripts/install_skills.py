"""Install upstream-only skills at pinned commits.

Some skills used by this workflow do not carry a license file upstream, so this
repository does not redistribute them. This script fetches them from their
public repositories at the exact commits listed in skills/manifest.json.

Usage:
  python scripts/install_skills.py            # into skills/upstream/
  python scripts/install_skills.py --global   # also copy into ~/.qoder-cn/skills
  python scripts/install_skills.py --force    # overwrite existing copies
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "skills" / "manifest.json").read_text(encoding="utf-8"))
DEST = ROOT / "skills" / "upstream"
GLOBAL_DEST = Path.home() / ".qoder-cn" / "skills"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--global", dest="global_install", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    git = shutil.which("git")
    if not git:
        raise SystemExit("git not found. Install Git first.")

    DEST.mkdir(parents=True, exist_ok=True)
    repos: dict[str, Path] = {}

    with tempfile.TemporaryDirectory(prefix="motion-skills-") as tmp:
        for item in MANIFEST["upstream_only"]:
            name = item["name"]
            target = DEST / name
            if target.exists() and not args.force:
                print(f"skip existing {target}")
            else:
                repo = item["repo"]
                checkout = repos.get(repo)
                if checkout is None:
                    checkout = Path(tmp) / name
                    print(f"clone {repo}")
                    subprocess.run(
                        [git, "clone", "--quiet", repo, str(checkout)], check=True
                    )
                    repos[repo] = checkout
                subprocess.run(
                    [git, "-C", str(checkout), "checkout", "--quiet", item["commit"]],
                    check=True,
                )
                src = checkout / item["subdir"]
                if not src.exists():
                    raise SystemExit(f"missing {item['subdir']} in {repo}")
                if target.exists():
                    shutil.rmtree(target)
                shutil.copytree(src, target)
                print(f"installed {name} -> {target}")

            if args.global_install:
                GLOBAL_DEST.mkdir(parents=True, exist_ok=True)
                global_target = GLOBAL_DEST / name
                if global_target.exists() and not args.force:
                    print(f"skip existing {global_target}")
                else:
                    if global_target.exists():
                        shutil.rmtree(global_target)
                    shutil.copytree(target, global_target)
                    print(f"installed {name} -> {global_target}")

    print("\nUpstream-only skills fetched. Check each upstream license before use.")
    print("Vendored skills (MIT/Apache-2.0) are already in skills/.")


if __name__ == "__main__":
    main()
