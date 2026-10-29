import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// GHSA-gcqx-w48m-w2h4 has no upstream patched release. Keep PWA support,
// but forbid __proto__ setter access in this build and every child process.
export function secureBuildEnv(env = process.env) {
  return { ...env, NODE_OPTIONS: `${env.NODE_OPTIONS ?? ''} --disable-proto=throw`.trim() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'build', '--workspaces', '--if-present'],
    { stdio: 'inherit', env: secureBuildEnv(), shell: process.platform === 'win32' });
  if (result.error) process.stderr.write(`${result.error.message}\n`);
  process.exit(result.status ?? 1);
}
