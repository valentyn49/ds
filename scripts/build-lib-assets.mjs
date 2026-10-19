import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// Post-build step of `npm run build:lib`.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

// 1. dist/fonts.css, from src/tokens/fonts.css (the single source of the @font-face rules).
//    Only the url() paths change: from src/tokens/ ("../../fonts/") to dist/ ("../fonts/").
//    The font files themselves are not copied: Proxima Nova is a commercial font, and its distribution license has
//    to be confirmed before the files go into a package. The package `files` list does not include the fonts folder.
const fontsCss = readFileSync(resolve(root, 'src/tokens/fonts.css'), 'utf8').replaceAll('../../fonts/', '../fonts/');
mkdirSync(dist, { recursive: true });
writeFileSync(resolve(dist, 'fonts.css'), fontsCss);
console.log(`dist/fonts.css written (${(fontsCss.match(/@font-face/g) ?? []).length} @font-face rules, fonts referenced from ../fonts/)`);

// 2. The declaration files keep the components' side-effect CSS imports, which point into src and do not exist for
//    consumers. The CSS is delivered by dist/styles.css, so those lines are removed.
let stripped = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (file.endsWith('.d.ts')) {
      const before = readFileSync(file, 'utf8');
      const after = before.replace(/^import ['"][^'"]+\.css['"];?\r?\n/gm, '');
      if (after !== before) {
        writeFileSync(file, after);
        stripped++;
      }
    }
  }
};
walk(resolve(dist, 'types'));
console.log(`CSS side-effect imports removed from ${stripped} declaration file(s)`);
