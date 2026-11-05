import React from 'react';
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  registerRoot,
  useCurrentFrame,
} from 'remotion';
import planJson from '../public/timeline.json';
import cuesJson from '../public/cues.json';
import {
  Body,
  CaptionBar,
  ChapterCard,
  Cue,
  Paper,
  PhoneFrame,
  RiverLine,
  Scene,
  StatChip,
  Title,
  TopBar,
} from './components';
import {C, EASE, SANS, SERIF, clamp, fade} from './theme';

const plan = planJson as unknown as {
  fps: number;
  width: number;
  height: number;
  frames: number;
  seconds: number;
  scenes: Scene[];
};
const cues = (cuesJson as unknown as {cues: Cue[]}).cues;

const TimelineMotif: React.FC<{start?: number}> = ({start = 0}) => {
  const f = useCurrentFrame();
  const W = 760;
  const segments = [
    {label: 'OPEN', w: 4, color: C.bronze},
    {label: 'CHAPTER', w: 3, color: C.gold},
    {label: 'DEVICE', w: 6, color: C.red},
    {label: 'CLOSE', w: 3, color: C.bronze},
  ];
  const total = segments.reduce((s, x) => s + x.w, 0);
  const p = interpolate(f, [start, start + 60], [0, 1], {...clamp, easing: EASE});
  const headX = 40 + p * (W - 80);
  let cursor = 40;
  return (
    <div style={{position: 'absolute', left: 1030, top: 300, width: W + 80, height: 340}}>
      <div style={{fontFamily: SANS, fontSize: 18, letterSpacing: 3, color: C.soft}}>
        TIMELINE / {plan.seconds.toFixed(1)}s
      </div>
      <div style={{position: 'relative', height: 120, marginTop: 34}}>
        {segments.map((s) => {
          const w = (s.w / total) * (W - 80);
          const left = cursor;
          cursor += w + 6;
          return (
            <div key={s.label} style={{position: 'absolute', left, top: 26, width: w}}>
              <div style={{height: 12, background: s.color, opacity: fade(f, start + 8, 14)}} />
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 15,
                  letterSpacing: 2,
                  color: C.soft,
                  marginTop: 10,
                  opacity: fade(f, start + 12, 14),
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: headX,
            top: 10,
            width: 2,
            height: 58,
            background: C.ink,
            boxShadow: '0 0 0 4px rgba(31,38,34,.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: headX - 44,
            top: -6,
            width: 90,
            textAlign: 'center',
            fontFamily: SERIF,
            fontSize: 24,
            color: C.ink,
          }}
        >
          {(plan.seconds * p).toFixed(1)}s
        </div>
      </div>
      <div style={{fontFamily: SANS, fontSize: 20, color: C.soft, marginTop: 16}}>
        场景 / 字幕 / 音频 · 共用一条时间线
      </div>
    </div>
  );
};

const Opening: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper />
      <TopBar />
      <div
        style={{
          position: 'absolute',
          left: 132,
          top: 128,
          fontFamily: SANS,
          fontSize: 20,
          letterSpacing: 4,
          color: C.red,
          opacity: fade(f, 2, 14),
        }}
      >
        A REPRODUCIBLE PIPELINE / 2026
      </div>
      <Title lines={['MOTION VIDEO', 'STACK']} x={120} y={190} size={128} width={1200} />
      <Body
        text="Remotion 4 · JSON Timeline · Python Audio Pipeline"
        x={132}
        y={530}
        size={34}
        color={C.red}
        start={22}
        width={1150}
      />
      <Body
        text="把场景、字幕、旁白与混音收进一条数据时间线；代码渲染，逐帧可复核。"
        x={132}
        y={600}
        size={24}
        color={C.soft}
        start={30}
        width={900}
        lineHeight={1.8}
      />
      <StatChip text="1920×1080" x={132} y={705} start={38} />
      <StatChip text="30 fps" x={362} y={705} start={44} />
      <StatChip text="H.264 / AAC" x={520} y={705} start={50} />
      <TimelineMotif start={18} />
      <RiverLine y={880} start={24} />
    </AbsoluteFill>
  );
};

const DeviceDemo: React.FC<{scene: Scene}> = ({scene}) => {
  const f = useCurrentFrame();
  const code = [
    '{',
    '  "fps": 30, "width": 1920, "height": 1080,',
    '  "scenes": [ { "kind": "device", "seconds": 6 }, ... ],',
    '  "narration": [ { "file": "voice.mp3", "start": 7.4 } ]',
    '}',
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper />
      <TopBar chapter={scene.chapter} />
      <div
        style={{
          position: 'absolute',
          left: 112,
          top: 150,
          fontFamily: SANS,
          fontSize: 22,
          letterSpacing: 3,
          color: C.red,
          opacity: fade(f, 2, 12),
        }}
      >
        {scene.chapter}
      </div>
      <Title lines={['代码驱动', '每一帧']} x={108} y={205} size={84} width={1000} />
      <Body
        text="场景用 JSON 描述，字幕与音频共用同一时间线；录制素材、纯代码画面或两者混排，都走同一套装配逻辑。"
        x={112}
        y={430}
        size={27}
        color={C.soft}
        start={28}
        width={980}
        lineHeight={1.8}
      />
      <div
        style={{
          position: 'absolute',
          left: 112,
          top: 590,
          width: 1000,
          padding: '28px 34px',
          background: 'rgba(27,30,26,.94)',
          borderLeft: `3px solid ${C.gold}`,
          boxShadow: '0 18px 40px rgba(31,38,34,.18)',
          opacity: fade(f, 44, 14),
          zIndex: 20,
        }}
      >
        {code.map((line, i) => (
          <div
            key={line}
            style={{
              fontFamily: 'Consolas, "SFMono-Regular", monospace',
              fontSize: 21,
              lineHeight: 1.75,
              color: i === 0 || i === code.length - 1 ? C.gold : 'rgba(243,236,221,.88)',
              whiteSpace: 'pre',
              opacity: fade(f, 44 + i * 5, 10),
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <Body
        text="渲染 → 混音 → 封装"
        x={112}
        y={900}
        size={24}
        color={C.bronze}
        start={80}
        width={600}
      />
      <PhoneFrame x={1270} y={140} w={430} h={820} start={12} />
    </AbsoluteFill>
  );
};

const Closing: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper />
      <TopBar />
      <div
        style={{
          position: 'absolute',
          left: 132,
          top: 150,
          fontFamily: SANS,
          fontSize: 22,
          letterSpacing: 3,
          color: C.red,
          opacity: fade(f, 2, 12),
        }}
      >
        03 REPRODUCE
      </div>
      <Title lines={['一条命令', '出片']} x={120} y={210} size={104} width={1100} />
      <div
        style={{
          position: 'absolute',
          left: 132,
          top: 500,
          fontFamily: 'Consolas, "SFMono-Regular", monospace',
          fontSize: 28,
          color: C.ink,
          background: 'rgba(255,255,255,.45)',
          border: '1px solid rgba(139,101,54,.32)',
          padding: '20px 26px',
          opacity: fade(f, 26, 14),
          zIndex: 20,
        }}
      >
        npm ci → npm run assemble
      </div>
      <Body
        text="替换内容资产，保留时间线、渲染与验收管线。"
        x={132}
        y={590}
        size={28}
        color={C.soft}
        start={34}
        width={900}
      />
      <StatChip text="MIT / code" x={132} y={700} start={46} />
      <StatChip text="CC BY 4.0 / docs" x={330} y={700} start={52} />
      <StatChip text="skills/ included" x={580} y={700} start={58} />
      <RiverLine y={880} start={22} />
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{scene: Scene}> = ({scene}) => {
  switch (scene.kind) {
    case 'opening':
      return <Opening />;
    case 'chapter':
      return <ChapterCard scene={scene} />;
    case 'device':
      return <DeviceDemo scene={scene} />;
    case 'closing':
      return <Closing />;
    default:
      return <Opening />;
  }
};

const Film: React.FC = () => {
  const {fps} = plan;
  return (
    <AbsoluteFill style={{background: C.night}}>
      {plan.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={Math.round(scene.start * fps)}
          durationInFrames={scene.frames}
        >
          <SceneView scene={scene} />
        </Sequence>
      ))}
      <CaptionBar cues={cues} fps={fps} />
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition
      id="MotionStackTemplate"
      component={Film}
      width={plan.width}
      height={plan.height}
      fps={plan.fps}
      durationInFrames={plan.frames}
    />
  </>
);

registerRoot(Root);
