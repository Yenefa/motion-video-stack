# Skills

这套栈把“导演判断”与“渲染执行”拆开。技能不是装饰性的提示词合集，而是每一层
必须交付的中间产物：方向包 → 运动语言 → 镜头卡 → 时间线 → 成片 → 逐时码验收。

## 已入库（可直接读/改）

| Skill | 作用 | 上游 | 许可 |
| --- | --- | --- | --- |
| `motion-video-director`（`director-workflow/`） | 六阶段导演流程、beat graph、验收 rubric；本仓库原创 | 本仓库 | MIT |
| `motion-art-direction` | 运动语言、语气/能量、节奏、克制与一致性 | [iart-ai/motion-design-skills](https://github.com/iart-ai/motion-design-skills) @ `3c129f7` | MIT |
| `video-shotcraft` | 124 张镜头配方卡、参考实现、动效词汇 | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) @ `43bd349` | Apache-2.0 |

## 固定 commit 安装（上游未附许可证，故不再分发）

| Skill | 作用 | 上游 | 许可状态 |
| --- | --- | --- | --- |
| `ai-motion-director` | 运动论题、anti-PPT 门禁、镜头结构 | [Pluviobyte/video-production-skills](https://github.com/Pluviobyte/video-production-skills) @ `e19f1f3` | 上游无 LICENSE，权利归作者 |
| `remotion-best-practices` | Remotion 技能路由与最佳实践 | [remotion-dev/skills](https://github.com/remotion-dev/skills) @ `30d4553` | 上游无 LICENSE，权利归 Remotion |
| `remotion-create` | 新建 Remotion 工程/合成 | 同上 | 同上 |
| `remotion-render` | 导出、编码、透明视频 | 同上 | 同上 |
| `remotion-studio` | Studio 预览与迭代 | 同上 | 同上 |
| `motion-director` | 早期本地导演编排版 | 无公开上游 / 无许可证 | 不随仓库分发；本仓库用 `motion-video-director` 覆盖同一层 |

安装：

```bash
python scripts/install_skills.py            # 到 skills/upstream/
python scripts/install_skills.py --global   # 同时复制到 ~/.qoder-cn/skills
```

安装脚本只从上游公开仓库按 manifest 中的 commit 拉取，不在本仓库再分发。
使用前请自行核对上游许可证；如果上游补上了许可证，以许可证为准。

## 推荐调用顺序

1. `motion-video-director` — 先写 brief、运动论题、beat graph，不动代码。
2. `motion-art-direction` — 定运动语言、节奏、缓动与转场家族。
3. `ai-motion-director` — 做 anti-PPT 检查，决定哪些 beat 必须换状态。
4. `video-shotcraft` — 为每个 beat 找镜头配方，不整段照搬模板。
5. `remotion-*` — 只在 Remotion 作为执行器时加载。
6. 回到 `motion-video-director` 的 rubric 做逐时码验收。

## 技能之间的边界

- 导演层只决定“为什么动、动什么、何时停”，不写组件。
- 美术层只决定“怎么动才像同一个人的作品”，不改时间线。
- 镜头卡是词汇表，不是成片模板；每条配方都要按当前 brief 重新排。
- 渲染层只读 `public/timeline.json`，不在组件里硬编码时间。

## 许可证

各 skill 目录保留自己的 `LICENSE` 与 `SOURCE.md`。根目录的 MIT 只覆盖本仓库原创
代码与文档；`video-shotcraft` 的 Apache-2.0 条款以其目录内 `LICENSE` 为准。
