import {Easing, interpolate} from 'remotion';

export const C = {
  paper: '#F3ECDD',
  paper2: '#E8DCC4',
  ink: '#1F2622',
  soft: '#59635D',
  bronze: '#8B6536',
  gold: '#C9A15C',
  red: '#A23A2A',
  night: '#1B1E1A',
};

// Windows-first, with macOS and Linux fallbacks. Noto CJK is the recommended
// open font set for non-Windows machines; see README "字体".
export const SERIF = '"SimSun","Songti SC","Noto Serif CJK SC","Noto Serif SC",serif';
export const SANS = '"Microsoft YaHei","PingFang SC","Noto Sans CJK SC","Noto Sans SC",sans-serif';

export const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const lerp = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], {...clamp, easing: EASE});
export const fade = (f: number, start: number, dur = 12) =>
  interpolate(f, [start, start + dur], [0, 1], clamp);
export const rise = (f: number, start: number, dur = 14, dist = 14) =>
  `translateY(${interpolate(f, [start, start + dur], [dist, 0], {...clamp, easing: EASE})}px)`;
