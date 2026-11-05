# 工作流

目标不是“把稿子排成页面”，而是让每一秒都有可见的状态变化。流程分六段，每段都有
可检查的产物；上一段没写完，不进入下一段。

## 1. Brief

产物：`docs/direction/01-brief.md`

写清受众、平台、时长、帧率、画幅、音频策略、事实标准、交付限制。把“看完要记住
什么”写成一句话。没有这句话，后面的镜头会散。

## 2. 运动论题

产物：写入 `01-brief.md` 的 Motion thesis

```text
这部片子通过让 <一个视觉隐喻> 从 <开始状态> 变成 <结束状态>，证明 <主张>。
```

隐喻必须能用现有素材和代码画出来。示例：一条时间线从散点收束成一条河，证明
“所有场景可以共用一条时间线”。

## 3. Beat graph

产物：`docs/direction/02-beat-graph.md`

一条连续时间轴，不是页列表。每个 beat 写明：时间、叙事任务、主角、状态变化、
镜头/图层运动、文字角色、素材需求、PPT 风险。标出 1–3 个 impact beat 和其后的
真实停顿。

门禁：如果一个 beat 删掉不影响理解，删掉；如果只能靠淡入淡出，重做。

## 4. 运动语言

产物：`docs/direction/04-motion-language.md`

定义一套小系统：三个语气形容词及其禁令、一条签名缓动、快/中/慢三档时长、入场
语法、转场家族、标题与画面的关系。新元素不合语法时，改元素，不改语法。

## 5. Shot list 与实现

产物：`docs/direction/03-shot-list.md`、`content/*.json`、`src/`

每个镜头写意图、构图、起止状态、镜头运动、转场、素材、缺素材时的替代方案。
然后：

```bash
npm run timeline
npm run studio
python scripts/assemble.py
```

## 6. 逐时码验收

产物：`docs/direction/05-acceptance.md` + 抽帧

用 `docs/qc.md` 的命令抽帧、测响度、解码；按
`skills/director-workflow/references/acceptance-rubric.md` 逐条留证。失败就回到
第 2/3 段重导，不要用更多特效遮盖。

## 技能映射

| 阶段 | 技能 |
| --- | --- |
| 1–3 | `motion-video-director`、`ai-motion-director` |
| 4 | `motion-art-direction` |
| 5 | `video-shotcraft`、`remotion-*` |
| 6 | `motion-video-director` rubric |

所有技能都可以单独使用；这套栈只约定它们的交接物，不强制绑定某个 agent。
