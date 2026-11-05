import {spawnSync} from 'node:child_process';

const candidates =
  process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];

let python = null;
for (const candidate of candidates) {
  const probe = spawnSync(candidate, ['--version'], {stdio: 'ignore'});
  if (probe.status === 0) {
    python = candidate;
    break;
  }
}

if (!python) {
  console.error('Python 3.10+ not found. Install Python or add it to PATH.');
  process.exit(1);
}

const result = spawnSync(python, process.argv.slice(2), {stdio: 'inherit'});
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
