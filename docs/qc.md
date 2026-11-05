# 逐时码验收

验收的对象是**成片**，不是代码或 Studio 预览。

## 1. 规格与帧数

```bash
ffprobe -v error \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,duration \
  -show_entries format=duration,size -of default=nw=1 out/demo.mp4
```

模板示例的期望值：

| 项 | 值 |
| --- | --- |
| 分辨率 | 1920×1080 |
| 帧率 | 30/1 |
| 帧数 | 480 |
| 时长 | 16.000s |
| 视频 | H.264，yuv420p |
| 音频 | 无（示例时间线没有音频） |

帧数必须等于 `round(duration * fps)`。不相等时先查时间线，不要先怀疑播放器。

## 2. 完整解码

```bash
ffmpeg -v error -i out/demo.mp4 -f null -
echo $?
```

无输出、退出码 0 才算通过。

## 3. 抽帧

用输出端 `-ss` 精确定位（放在 `-i` 之后），避免关键帧误差：

```bash
ffmpeg -y -v error -i out/demo.mp4 -ss 1.5  -frames:v 1 qa/t-1.5.png
ffmpeg -y -v error -i out/demo.mp4 -ss 5.2  -frames:v 1 qa/t-5.2.png
ffmpeg -y -v error -i out/demo.mp4 -ss 9.0  -frames:v 1 qa/t-9.0.png
ffmpeg -y -v error -i out/demo.mp4 -ss 14.5 -frames:v 1 qa/t-14.5.png
```

每个场景边界、每个 impact beat、每个数字/结论都要抽一帧。不要把“代码看起来对”
当成验收。

## 4. 字幕

- 单行 ≤ 20 字，两行 ≤ 36 字；
- 不遮挡证据区、按钮、关键数字；
- 断句在标点处；
- 与音频同起同落（有音频时对比波形或听感）。

字幕数据在 `public/cues.json`，SRT 在 `public/subtitles.srt`；两者必须同源。

## 5. 音频（有音频时）

```bash
ffmpeg -hide_banner -nostats -i out/demo.mp4 -map 0:a:0 -af ebur128=peak=true -f null -
```

目标：约 `-17 LUFS`，true peak ≤ `-1.5 dBTP`；纯音乐段明显低于旁白段；原生音频
窗口内音乐完全静音（见 `docs/audio.md`）。

## 6. 记录

按 `skills/director-workflow/references/acceptance-rubric.md` 建表，每条写：

- 时码；
- 抽帧路径；
- 判定（PASS / FAIL）；
- 失败时的修复动作。

没有抽帧证据的 PASS 不算通过。
