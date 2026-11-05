---
name: motion-video-director
description: Plan and review code-driven motion videos before implementation. Use when a brief, topic, script, product page, or dataset must become a real animated piece rather than a slideshow; when defining a motion thesis, beat graph, motion language, shot list, or timecoded acceptance review.
version: 0.1.0
---

# Motion Video Director

Own the decisions that happen **before** animation code: what the audience
should feel, what moves, what holds, and how every shot proves the same idea.
Implementation belongs to the renderer layer (Remotion in this stack).

## Operating contract

- Duration, aspect ratio, and fps come from the brief; never silently change them.
- Direction first: write the five artifacts below, then build.
- Every beat must change state, not only fade/slide. Text is an anchor, not the carrier.
- One hero per frame. Density comes from contrast, not constant motion.
- A segment that fails review is re-directed, not covered with more effects.
- A piece is not done until it has a rendered file and a timecoded review.

## Phase 1 — Brief

Capture: audience, platform, exact duration, fps, ratio, audio policy
(voice/music/SFX), factual standard, delivery constraints, and what the viewer
should do or remember afterwards.

## Phase 2 — Motion thesis

Write one sentence:

> This piece moves by showing **<one visual metaphor>** changing from
> **<start state>** to **<end state>**, proving **<claim>**.

If the sentence is weak, invent a stronger metaphor before writing shots.
The metaphor must be drawable with the available assets and code.

## Phase 3 — Emotional / beat graph

Lay out a single continuous timeline, not pages. For each beat record:

| field | meaning |
| --- | --- |
| time | start–end in seconds |
| job | what the audience should understand or feel |
| hero | the one object that owns the frame |
| state change | before → after, visible without text |
| camera / layer | how the frame moves or re-composes |
| text role | none / anchor / caption / data |
| asset need | code-drawn, image, recording, audio |
| PPT risk | what would make this feel like a slide |

Mark 1–3 impact beats and the real holds after them. Silence is part of rhythm.

## Phase 4 — Motion language

Define a small, repeatable system:

- **Tone & energy**: three adjectives, then what they forbid.
- **Easing vocabulary**: one signature ease plus one impact ease.
- **Timing scale**: quick / standard / slow durations in frames.
- **Entry / exit grammar**: how objects arrive and leave (mask, draw, rise, cut).
- **Transition family**: match cuts, same-object transforms, or hard cuts.
- **Type behavior**: how titles and captions enter relative to the visuals.

If a new element cannot fit the language, change the element, not the language.

## Phase 5 — Shot list

For each shot: intent, composition (where the hero sits), start/end state,
camera move, transition logic, asset list, and fallback if an asset is missing.
Prefer one strong motion over three decorative ones.

## Phase 6 — Timecoded review

Render, then inspect frames at every scene boundary and every claim. Check:

- the motion thesis is visible within the first 10 seconds;
- no beat is a static slide with a fade;
- titles do not wrap into orphan characters;
- captions do not cover the evidence;
- audio and captions share the same timeline;
- the end state is legible and held.

Record each check with timecode, frame path, verdict, and the fix. Do not
substitute code review for looking at frames.

## Handoff to production

- `content/scenes.json` + `content/narration.json` + `content/cues.json` are the
  editable sources.
- `scripts/build_timeline.py` compiles them into `public/timeline.json`.
- The Remotion layer reads only that timeline; it does not invent timings.
- `scripts/assemble.py` renders, mixes (if audio exists), and muxes.

See `references/beat-graph-template.md` and `references/acceptance-rubric.md`.
