# 音频管线

音频是可选的。没有旁白/音乐时，`mix_audio.py` 直接退出，`assemble.py` 输出无声片。

## 输入

- `audio/<file>`：旁白，放在 `content/narration.json` 的 `file`；
- `content/project.json` 的 `music`：背景音乐，可为 `null`；
- 可选 `timeline.native_audio`：一段原生音频窗口（见下）。

## 混音步骤

1. 每条旁白 `aresample=48000 → aformat=fltp/stereo → adelay=start_ms → volume=1.0`；
2. 所有旁白 `amix=inputs=N:normalize=0`，`apad` 到片长后 `atrim`；
3. 音乐 `atrim` 到片长，线性增益 `MUSIC_LEVEL`（默认 0.12），最后 3 秒淡出；
4. 如果有 native_audio 窗口，音乐在该区间前 0.3s 淡出、后 0.3s 淡入，区间内音量为 0；
5. 旁白 + 音乐 `amix=normalize=0`，加一次静态增益，`alimiter=limit=0.80`；
6. 输出 AAC 192kbps / 48kHz / 立体声。

## 为什么不用 loudnorm

`loudnorm` 是动态归一化，会把长旁白与音乐的比例压平，听感像被 AGC 推过。这里用
两遍法：

```text
mix-raw (0 dB) → ebur128 测 I → gain = target - measured → mix-final (gain)
```

只整体平移，旁白与音乐的相对关系不变。默认目标 `-17.0 LUFS`，可在
`content/project.json` 的 `target_lufs` 改，或用 `TARGET_I` 覆盖。

## 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `FFMPEG` | PATH 中的 `ffmpeg` | FFmpeg 可执行文件 |
| `FFPROBE` | PATH 中的 `ffprobe` | 时间线构建测量时长 |
| `MUSIC_LEVEL` | `0.12` | 音乐线性增益 |
| `TARGET_I` | `-17.0` | 覆盖项目的目标响度 |
| `REMOTION_BROWSER` | 自动下载 | 指定本机 Chrome/Chromium |

## 原生音频窗口（可选）

如果片中某段要播放设备原声、并且音乐必须完全静音，在 `timeline.json` 里加：

```json
"native_audio": {
  "file": "device-audio.wav",
  "start": 79.6,
  "duration": 8.1,
  "end": 87.7
}
```

- `file` 相对 `audio/`；
- 音乐在 `start - 0.3` 开始淡出，在 `end` 后 0.3s 淡入；
- 该段原声按 0.5 增益混入，避免压过旁白；
- 用“成片 RMS == 仅旁白 RMS”验证音乐确实静音：

```bash
ffmpeg -hide_banner -nostats -ss 79.6 -t 8.1 -i audio/mix-final.m4a -af volumedetect -f null -
ffmpeg -hide_banner -nostats -ss 79.6 -t 8.1 -i audio/narration-only.m4a -af volumedetect -f null -
```

本项目模板的 `native_audio` 为 `null`，上述是扩展用法。

## 验收

```bash
# 成片音轨响度 / 真峰值
ffmpeg -hide_banner -nostats -i out/demo.mp4 -map 0:a:0 -af ebur128=peak=true -f null -

# 只看某个区间
ffmpeg -hide_banner -nostats -ss 10 -t 5 -i out/demo.mp4 -map 0:a:0 -af volumedetect -f null -
```

目标：约 `-17 LUFS`，true peak ≤ `-1.5 dBTP`，旁白段明显高于纯音乐段。
