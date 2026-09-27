import { cp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceDir = path.join(workspaceRoot, 'artifacts/samar-x-modes-store/dist/public');
const docsDir = path.join(workspaceRoot, 'docs');

execFileSync(
  'pnpm',
  ['--filter', '@workspace/samar-x-modes-store', 'run', 'build'],
  {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      BASE_PATH: './',
      VITE_GITHUB_PAGES: 'true',
      PORT: process.env.PORT ?? '23603',
    },
  },
);

await rm(docsDir, { recursive: true, force: true });
await cp(sourceDir, docsDir, { recursive: true });
await cp(path.join(docsDir, 'index.html'), path.join(docsDir, '404.html'));
await writeFile(path.join(docsDir, '.nojekyll'), '');

console.info('GitHub Pages output written to docs/.');