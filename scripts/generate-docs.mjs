import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const structure = JSON.parse(readFileSync(resolve(root, 'src/figma/structure.json'), 'utf8'));

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const jsString = (s) => JSON.stringify(s);
const figmaUrl = (nodeId) => `${structure.source.url}?node-id=${nodeId.replace(':', '-')}`;

let created = 0;
let skipped = 0;

for (const group of structure.components) {
  const dir = resolve(root, 'src/stories/components', slug(group.category));
  mkdirSync(dir, { recursive: true });

  for (const item of group.items) {
    const file = resolve(dir, `${slug(item.name)}.mdx`);
    if (existsSync(file)) {
      skipped++;
      continue;
    }

    const title = `Components/${group.category}/${item.name}`;
    const facts = [
      `- **Figma page:** ${group.figmaPage.replace(/^---\s*/, '')}`,
      `- **Figma type:** ${item.kind}`,
    ];
    if (item.variants) facts.push(`- **Variants:** ${item.variants}`);
    if (item.axes) facts.push(`- **Variant properties:** ${item.axes.map((a) => `\`${a}\``).join(', ')}`);
    facts.push('- **Status:** Placeholder, not documented yet');

    const body = `{/* Generated placeholder. Edit freely: scripts/generate-docs.mjs never overwrites an existing file. */}
import { Meta } from '@storybook/addon-docs/blocks';

<Meta title=${jsString(title)} />

# ${item.name}

${facts.join('\n')}

${item.note ? `> ${item.note}\n\n` : ''}[Open the Figma page](${figmaUrl(group.nodeId)})
`;
    writeFileSync(file, body);
    created++;
  }
}

console.log(`component docs: ${created} created, ${skipped} already existed`);
