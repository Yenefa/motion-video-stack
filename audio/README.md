# audio/

把旁白与音乐源文件放在这里（不入库）：

```text
audio/
  voice-01.mp3
  voice-02.mp3
  music.wav
```

在 `content/narration.json` 写旁白文件名与起点，在 `content/project.json` 的
`music` 写音乐路径，然后：

```bash
npm run timeline
npm run assemble
```

生成的 `mix-raw.m4a`、`mix-final.m4a` 已被 `.gitignore` 忽略；它们可以从源文件
重新生成。音频版权与隐私由接入者负责。
