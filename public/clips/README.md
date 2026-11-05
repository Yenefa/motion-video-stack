# public/clips/

真实录屏、截图序列等**内容资产**放这里，但不提交到本仓库。`.gitignore` 只保留本
说明文件。

在 `src/index.tsx` 里用 `@remotion/media` 的 `Video` 挂载：

```tsx
import {Video} from '@remotion/media';
import {staticFile} from 'remotion';

<Video src={staticFile(`clips/${scene.clip}.mp4`)} />
```

并在时间线场景里加 `clip` 字段。素材的版权、人物隐私、客户数据由接入者负责。
