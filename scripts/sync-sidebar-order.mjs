import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const structure = JSON.parse(readFileSync(resolve(root, 'src/figma/structure.json'), 'utf8'));
const previewPath = resolve(root, '.storybook/preview.js');

// Storybook reads `storySort` statically, so the order has to be a literal in preview.js.
const order = [
  'Introduction',
  'Foundations',
  structure.foundations.map((f) => f.name),
  'Components',
  structure.components.flatMap((group) => [group.category, group.items.map((item) => item.name)]),
];

const start = '/* sidebar-order:start (generated from src/figma/structure.json by scripts/sync-sidebar-order.mjs) */';
const end = '/* sidebar-order:end */';
const literal = JSON.stringify(order, null, 2).replace(/\n/g, '\n      ');

const source = readFileSync(previewPath, 'utf8');
const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
if (!pattern.test(source)) throw new Error('sidebar-order markers not found in .storybook/preview.js');

writeFileSync(previewPath, source.replace(pattern, () => `${start}\n      ${literal}\n      ${end}`));
console.log('sidebar order synced into .storybook/preview.js');
