import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reactDir = resolve(root, 'storybook-react-static');
const htmlDir = resolve(root, 'storybook-html-static');
const pagesDir = resolve(root, 'pages-dist');

for (const [label, dir] of [['React Storybook', reactDir], ['HTML Storybook', htmlDir]]) {
  if (!existsSync(dir)) throw new Error(`${label} build is missing: ${dir}`);
}

rmSync(pagesDir, { recursive: true, force: true });
mkdirSync(pagesDir, { recursive: true });
cpSync(reactDir, pagesDir, { recursive: true });
cpSync(htmlDir, resolve(pagesDir, 'html'), { recursive: true });

console.log(`pages-dist assembled:\n- root: ${reactDir}\n- html/: ${htmlDir}`);
