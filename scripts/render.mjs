import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';

mkdirSync('out', {recursive: true});

const cli = 'node_modules/@remotion/cli/remotion-cli.js';
const args = [
  'render',
  'src/index.tsx',
  'MotionStackTemplate',
  'out/demo-silent.mp4',
  '--codec=h264',
  '--pixel-format=yuv420p',
  '--concurrency=4',
  '--crf=18',
  '--muted',
  ...process.argv.slice(2),
];

if (process.env.REMOTION_BROWSER) {
  args.push(`--browser-executable=${process.env.REMOTION_BROWSER}`);
}

const result = spawnSync(process.execPath, [cli, ...args], {stdio: 'inherit'});
process.exit(result.status ?? 1);
