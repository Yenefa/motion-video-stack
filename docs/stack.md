# 技术栈说明

## 三层结构

```text
Direction layer   brief / motion thesis / beat graph / motion language / shot list
Production layer  content JSON → timeline → Remotion components → silent master
Audio & QC layer  narration placement → static-gain mix → mux / ffprobe / stills
```

导演层不写组件；渲染层不发明时间；音频层不改变叙事节奏。三层只通过
`public/timeline.json` 与 `content/*.json` 交换数据。

## 关键选择

### 1. 时间线用 JSON，而不是组件里的 magic number

每个场景的 `start`、`seconds`、`frames` 由 `build_timeline.py` 统一计算。组件只读
`scene.frames` 与当前帧，因此场景挪动、增删不会导致字幕与音频漂移。

### 2. 静音母版 + 独立终混

Remotion 用 `--muted` 渲染画面，音频由 FFmpeg 单独混合，再在最后一步 `-c:v copy`
封装。好处：

- 换配音/换音乐不用重渲染 1080p 画面；
- 音频可以用 `ebur128` 独立测量、独立修正；
- 视频流无损拼接，音频处理可重复。

### 3. 一次静态增益，而不是 loudnorm

`loudnorm` 是动态归一化，遇到长旁白与音乐会把整体动态压平。`mix_audio.py` 的流程是：

1. 以 0 dB 混一版 `mix-raw.m4a`；
2. 用 `ebur128` 测 integrated loudness；
3. 用 `target - measured` 得到一次静态增益；
4. 重新混一版 `mix-final.m4a`，并加 `alimiter=limit=0.80`。

这样旁白与音乐的比例保持不变，只整体平移。

### 4. 内容与代码分离

`src/` 只包含通用组件与四种示例场景（opening / chapter / device / closing）。
真实项目的录屏、旁白、音乐、成片不进入仓库；替换 `content/` 与 `public/clips/`
即可复用管线。

### 5. 字幕是数据

`content/cues.json` 定义时间与最多两行文本；`Captions` 在全局帧上查找当前 cue，
不依赖场景。SRT 由同一份数据生成，保证画面字幕与交付字幕一致。

## 版本与确定性

| 依赖 | 版本 | 确定性措施 |
| --- | --- | --- |
| Node.js | 20+ / 22 LTS | `.nvmrc` |
| Remotion | 4.0.540 | `package-lock.json` |
| React | 19.2.0 | lockfile |
| Python | 3.10+ | 仅标准库 |
| FFmpeg | 7+ | 命令只使用稳定滤镜 |

Remotion 渲染是确定性的：同一份代码、同一浏览器版本、同一字体，逐帧结果一致。
换字体或换 Chrome 版本会改变文字换行与抗锯齿，因此验收要重新抽帧。

## 性能基线

参考机器（Windows 11，Chrome headless，concurrency 4）：

- 16s / 480 帧 / 1080p：约 60–90 秒；
- 3 分钟 / 5400 帧：约 10–15 分钟；
- 静音母版 1080p H.264 CRF 18：约 2–4 Mbps（低动态画面）。

## 已知边界

- Remotion 不是 MIT；商用前读 [NOTICE.md](../NOTICE.md)。
- 系统字体不可打包，Linux 需要安装 Noto CJK；字体变化会改变换行。
- 模板不含音效设计；音乐/旁白需要自备并确认版权。
- `assemble.py` 默认 1080p / H.264 / AAC；4K、透明视频、ProRes 需要改参数。
