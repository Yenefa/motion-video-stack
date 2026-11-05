import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {C, EASE, SANS, SERIF, clamp, fade, rise} from './theme';

export type Scene = {
  id: string;
  kind: string;
  start: number;
  seconds: number;
  frames: number;
  title: string;
  chapter: string;
  details: string[];
};

export type Cue = {
  start: number;
  end: number;
  lines: string[];
  speaker?: string;
};

export const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(1200px 700px at 18% 8%, #FBF6EA 0%, #F3ECDD 48%, #E8DCC4 100%)',
    }}
  >
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      <path
        d="M-40 900 C 320 860, 560 930, 820 890 S 1320 830, 1960 880"
        fill="none"
        stroke="rgba(139,101,54,.18)"
        strokeWidth="2"
      />
      <path
        d="M-40 950 C 360 910, 620 980, 900 940 S 1420 880, 1960 930"
        fill="none"
        stroke="rgba(139,101,54,.12)"
        strokeWidth="2"
      />
      <path
        d="M-40 150 C 300 110, 520 190, 780 150 S 1300 90, 1960 140"
        fill="none"
        stroke="rgba(139,101,54,.08)"
        strokeWidth="2"
      />
    </svg>
  </AbsoluteFill>
);

export const TopBar: React.FC<{dark?: boolean; chapter?: string}> = ({dark, chapter}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: 42,
        fontFamily: SANS,
        fontSize: 22,
        letterSpacing: 4,
        color: dark ? 'rgba(243,236,221,.78)' : C.soft,
      }}
    >
      MOTION VIDEO STACK
    </div>
    {chapter ? (
      <div
        style={{
          position: 'absolute',
          right: 90,
          top: 42,
          fontFamily: SANS,
          fontSize: 22,
          letterSpacing: 3,
          color: dark ? 'rgba(243,236,221,.72)' : C.soft,
        }}
      >
        {chapter}
      </div>
    ) : null}
  </>
);

export const Title: React.FC<{
  lines: string[];
  x: number;
  y: number;
  size: number;
  start?: number;
  color?: string;
  width?: number;
}> = ({lines, x, y, size, start = 0, color = C.ink, width = 1000}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, width, zIndex: 20}}>
      {lines.map((line, i) => {
        const at = start + i * 7;
        const enter = interpolate(f, [at, at + 18], [1, 0], {...clamp, easing: EASE});
        const op = fade(f, at, 14);
        return (
          <div
            key={line}
            style={{
              overflow: 'hidden',
              lineHeight: 1.18,
              height: size * 1.22,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: size,
                fontWeight: 700,
                color,
                whiteSpace: 'nowrap',
                transform: `translateY(${enter * 105}%)`,
                opacity: op,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Body: React.FC<{
  text: string;
  x: number;
  y: number;
  size: number;
  color?: string;
  start?: number;
  width?: number;
  lineHeight?: number;
}> = ({text, x, y, size, color = C.soft, start = 0, width = 900, lineHeight = 1.7}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        fontFamily: SANS,
        fontSize: size,
        lineHeight,
        color,
        opacity: fade(f, start, 14),
        transform: rise(f, start, 16, 12),
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );
};

export const RiverLine: React.FC<{
  y: number;
  start?: number;
  width?: number;
  color?: string;
}> = ({y, start = 0, width = 1.8, color = C.gold}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + 42], [0, 1], {...clamp, easing: EASE});
  return (
    <svg width="1920" height="220" style={{position: 'absolute', left: 0, top: y - 110}}>
      <path
        d={`M-60 ${y + 18} C 520 ${y - 60}, 820 ${y + 54}, 1180 ${y - 10} S 1620 ${y - 60}, 1980 ${y + 22}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray="1"
        strokeDashoffset={1 - p}
        pathLength={1}
      />
    </svg>
  );
};

export const CaptionBar: React.FC<{cues: Cue[]; fps: number}> = ({cues, fps}) => {
  const f = useCurrentFrame();
  const t = f / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) {
    return null;
  }
  const op = interpolate(t, [cue.start, cue.start + 0.12, cue.end - 0.12, cue.end], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 118,
        background: 'rgba(20,23,20,.93)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        opacity: op,
        zIndex: 40,
      }}
    >
      {cue.speaker === 'native' ? (
        <span
          style={{
            fontFamily: SANS,
            fontSize: 18,
            color: '#F3ECDD',
            background: C.red,
            padding: '4px 9px',
            letterSpacing: 1,
          }}
        >
          原声
        </span>
      ) : null}
      <div
        style={{
          fontFamily: SANS,
          fontSize: 31,
          lineHeight: 1.55,
          color: '#F3ECDD',
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {cue.lines.join('\n')}
      </div>
    </div>
  );
};

export const ChapterCard: React.FC<{scene: Scene}> = ({scene}) => {
  const f = useCurrentFrame();
  const number = scene.chapter.split(' ')[0] || '01';
  const tag = scene.chapter.split(' ').slice(1).join(' ');
  return (
    <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px 700px at 30% 35%, rgba(56,62,52,.55) 0%, rgba(27,30,26,0) 70%)',
        }}
      />
      <TopBar dark chapter={scene.chapter} />
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 300,
          width: 840,
          height: 380,
          border: '1px solid rgba(201,161,92,.5)',
          background: 'rgba(27,30,26,.36)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 52,
            top: 38,
            fontFamily: SERIF,
            fontSize: 132,
            lineHeight: 1,
            color: C.gold,
            opacity: fade(f, 2, 14),
            transform: rise(f, 2, 16, 16),
          }}
        >
          {number}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 196,
            fontFamily: SERIF,
            fontSize: 62,
            fontWeight: 700,
            color: '#F3ECDD',
            whiteSpace: 'nowrap',
            opacity: fade(f, 9, 14),
            transform: rise(f, 9, 16, 14),
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 58,
            top: 292,
            fontFamily: SANS,
            fontSize: 24,
            letterSpacing: 1,
            color: 'rgba(243,236,221,.64)',
            opacity: fade(f, 16, 14),
          }}
        >
          {tag || scene.details[0]}
        </div>
      </div>

      <div style={{position: 'absolute', left: 1140, top: 350, width: 560, height: 380, opacity: fade(f, 12, 18)}}>
        <div
          style={{
            width: 156,
            height: 286,
            border: '2px solid rgba(201,161,92,.78)',
            borderRadius: 24,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 206,
            top: 62,
            width: 262,
            height: 188,
            border: '2px solid rgba(201,161,92,.62)',
            borderRadius: 14,
          }}
        />
        <svg width="230" height="80" style={{position: 'absolute', left: 150, top: 120}}>
          <path d="M8 40 H 62" stroke={C.gold} strokeWidth="2" />
          <circle cx="70" cy="40" r="5" fill={C.red} />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 44,
            top: 300,
            fontFamily: SANS,
            fontSize: 19,
            letterSpacing: 2,
            whiteSpace: 'nowrap',
            color: 'rgba(243,236,221,.55)',
          }}
        >
          手机
        </div>
        <div
          style={{
            position: 'absolute',
            left: 288,
            top: 264,
            fontFamily: SANS,
            fontSize: 19,
            letterSpacing: 2,
            whiteSpace: 'nowrap',
            color: 'rgba(243,236,221,.55)',
          }}
        >
          平板
        </div>
      </div>
      <RiverLine y={900} start={20} width={1.2} />
    </AbsoluteFill>
  );
};

export const PhoneFrame: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  start?: number;
}> = ({x, y, w = 430, h = 840, start = 0}) => {
  const f = useCurrentFrame();
  const rows = ['场景 / SCENES', '字幕 / CAPTIONS', '音频 / AUDIO', '成片 / RENDER'];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 40,
        border: '2px solid rgba(139,101,54,.55)',
        background: '#FBF7EE',
        boxShadow: '0 24px 60px rgba(31,38,34,.16)',
        padding: 18,
        boxSizing: 'border-box',
        opacity: fade(f, start, 16),
        transform: rise(f, start, 18, 22),
        zIndex: 15,
      }}
    >
      <div
        style={{
          height: 34,
          borderRadius: 18,
          background: '#F0E7D5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontFamily: SANS,
          fontSize: 13,
          color: C.soft,
        }}
      >
        <span>9:41</span>
        <span>STACK</span>
      </div>
      <div style={{padding: '24px 14px 0'}}>
        <div style={{fontFamily: SANS, fontSize: 16, letterSpacing: 2, color: C.red}}>
          TEMPLATE / 01
        </div>
        <div style={{fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: C.ink, marginTop: 8}}>
          时间线
        </div>
        <div style={{fontFamily: SANS, fontSize: 15, color: C.soft, marginTop: 8, lineHeight: 1.6}}>
          每个场景、每条字幕、每段音频都从同一份 JSON 读取。
        </div>
        <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12}}>
          {rows.map((row, i) => {
            const at = start + 14 + i * 6;
            return (
              <div
                key={row}
                style={{
                  height: 64,
                  borderRadius: 12,
                  border: '1px solid rgba(139,101,54,.22)',
                  background: '#FFFDF7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0 16px',
                  opacity: fade(f, at, 12),
                  transform: rise(f, at, 14, 10),
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: i === 0 ? C.red : i === 1 ? C.bronze : C.gold,
                  }}
                />
                <span style={{fontFamily: SANS, fontSize: 18, color: C.ink}}>{row}</span>
                <span style={{marginLeft: 'auto', fontFamily: SANS, fontSize: 14, color: C.soft}}>
                  0{i + 1}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 28}}>
          <div style={{height: 6, borderRadius: 3, background: '#E6DCC8'}}>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                width: `${interpolate(f, [start + 30, start + 90], [8, 100], clamp)}%`,
                background: C.bronze,
              }}
            />
          </div>
          <div style={{fontFamily: SANS, fontSize: 13, color: C.soft, marginTop: 8}}>
            build → mix → mux
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatChip: React.FC<{text: string; x: number; y: number; start: number}> = ({
  text,
  x,
  y,
  start,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        padding: '10px 18px',
        border: '1px solid rgba(139,101,54,.36)',
        fontFamily: SANS,
        fontSize: 22,
        color: C.soft,
        background: 'rgba(255,255,255,.3)',
        opacity: fade(f, start, 14),
        transform: rise(f, start, 16, 10),
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );
};
