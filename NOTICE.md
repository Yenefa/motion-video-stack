# Third-party notice

## Remotion

This project uses Remotion (`remotion`, `@remotion/cli`, `@remotion/media`).
Remotion is **not** MIT-licensed. It is free for individuals and companies with
up to three employees; larger companies need a company license. Review the
current terms before commercial use:

- https://www.remotion.dev/license
- https://github.com/remotion-dev/remotion

The MIT license in this repository covers the original code and does not
relicense Remotion.

## Skills

| Component | Copyright | License |
| --- | --- | --- |
| `skills/motion-art-direction` | iart.ai | MIT (see its `LICENSE`) |
| `skills/video-shotcraft` | Vincentwei1021 and contributors | Apache-2.0 (see its `LICENSE`) |
| `skills/director-workflow` | Yenefa | MIT (root `LICENSE`) |
| `ai-motion-director` | Pluviobyte | No license file upstream; not redistributed |
| `remotion-*` skills | Remotion | No license file upstream; not redistributed |

Upstream-only skills are fetched by `scripts/install_skills.py` from their
public repositories at pinned commits. If you use them, comply with their
upstream terms.

## Fonts

The template requests system fonts in this order:

- Serif: SimSun, Songti SC, Noto Serif CJK SC, Noto Serif SC
- Sans: Microsoft YaHei, PingFang SC, Noto Sans CJK SC, Noto Sans SC

SimSun and Microsoft YaHei are proprietary Microsoft fonts and are **not**
included. Songti SC and PingFang SC are Apple system fonts. For a fully open
font stack on Linux, install Noto Serif CJK / Noto Sans CJK (SIL Open Font
License). Different fonts produce different line breaks; check the stills.

## FFmpeg

FFmpeg is not bundled. Install your own build and comply with its license
(LGPL/GPL depending on configuration).

## Media

This repository contains **no** project footage, narration, music, or final
film from any production. The 16-second demo is generated entirely from the
code and generic text in this repository.
