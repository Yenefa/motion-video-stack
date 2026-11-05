# 时间线

## 输入

### `content/project.json`

```json
{
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "expected_seconds": 16,
  "music": null,
  "target_lufs": -17.0
}
```

`music` 为相对仓库根目录的路径（例如 `"audio/music.wav"`），没有就写 `null`。
`expected_seconds` 是硬校验，防止场景增删后时长悄悄变化。

### `content/scenes.json`

```json
[
  {
    "id": "open",
    "kind": "opening",
    "seconds": 4,
    "title": "MOTION VIDEO STACK",
    "chapter": "",
    "details": ["Remotion 4", "JSON timeline"]
  }
]
```

- `seconds` 可以带小数；帧数按 `round(seconds * fps)` 计算。
- `start` 不需要手写，由脚本累计。
- `kind` 决定 `src/index.tsx` 的 `SceneView` 使用哪个组件。内置：
  `opening` / `chapter` / `device` / `closing`。

### `content/narration.json`

```json
[
  { "id": "line-1", "file": "voice-01.mp3", "start": 0.6 }
]
```

`duration` 可省略，脚本会用 `ffprobe` 测量；`file` 相对 `audio/`。脚本会检查
旁白是否重叠、最后一段是否超出片长。没有旁白就写 `[]`。

### `content/cues.json`

```json
{
  "cues": [
    { "start": 0.6, "end": 3.6, "lines": ["一句字幕。"], "speaker": "narration" }
  ]
}
```

`lines` 最多两行；每行建议 ≤ 22 个字符（超长只警告，不阻断）。`speaker` 为
`native` 时会显示“原声”标签，否则不显示。

## 编译

```bash
npm run timeline
# 或
python scripts/build_timeline.py
```

输出：

- `public/timeline.json`：渲染层唯一时间源；
- `public/cues.json`：字幕条数据；
- `public/subtitles.srt`：交付字幕。

编译时的硬校验：

1. 每个场景至少 1 帧；
2. 场景累计秒数与 `expected_seconds` 误差 ≤ 0.011s；
3. 旁白文件存在、时长可测、无重叠、不越界；
4. 音乐文件存在（如果配置）；
5. 字幕时间在片长内且 `start < end`。

## 渲染层如何消费

`src/index.tsx` 用 `plan.scenes` 生成 `Sequence`：

```tsx
<Sequence from={Math.round(scene.start * fps)} durationInFrames={scene.frames}>
  <SceneView scene={scene} />
</Sequence>
```

`CaptionBar` 在根层用全局帧查找当前 cue，因此字幕不随场景切换而丢失。

## 新增场景类型

1. 在 `content/scenes.json` 增加一项，写新的 `kind`；
2. 在 `src/index.tsx` 的 `SceneView` 加分支；
3. 新组件读 `useCurrentFrame()`，所有入场动画用局部帧；
4. `npm run timeline && npm run studio` 预览；
5. 在 `docs/direction/03-shot-list.md` 记录镜头意图。

## 接入真实录屏

真实素材不入库。把文件放到 `public/clips/`（本地），在时间线场景加 `clip` 字段：

```json
{ "id": "demo", "kind": "clip", "seconds": 8, "clip": "screen-01" }
```

在 `SceneView` 里用 `@remotion/media` 的 `Video` 挂载：

```tsx
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

<Video src={staticFile(`clips/${scene.clip}.mp4`)} />
```

注意：

- 录屏的时长必须 ≥ 场景时长；需要定格时用 `playbackRate` 或 `trimBefore`；
- `Video` 在 Remotion 预览中会真实播放，静音渲染时仍按帧取画面；
- 素材版权、隐私信息由接入者负责，不要提交到公开仓库。

## 帧号与秒数

- 片长帧数 = `round(total_seconds * fps)`；
- 场景起始帧 = `round(scene.start * fps)`；
- 音频起点 = 秒数 × 1000 的毫秒整数，`adelay` 不需要帧号。

改 fps 会同时改变渲染与验收，不要只改一处。
