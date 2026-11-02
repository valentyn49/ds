import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = resolve(root, 'pages-dist');
const rootIndex = resolve(pagesDir, 'index.html');
const htmlIndex = resolve(pagesDir, 'html/index.html');
const htmlIframe = resolve(pagesDir, 'html/iframe.html');
const reactIframe = resolve(pagesDir, 'iframe.html');

const mustExist = [rootIndex, htmlIndex, reactIframe, htmlIframe, resolve(pagesDir, 'html/index.json')];
for (const file of mustExist) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${relative(root, file)}`);
}

const inspectHtml = (file, label) => {
  const source = readFileSync(file, 'utf8');
  const badAbsolute = source.match(/(?:src|href)=['"]\/(?!\/)/g) || [];
  if (badAbsolute.length) throw new Error(`${label} contains absolute root-relative asset paths: ${badAbsolute[0]}`);

  const refs = [...source.matchAll(/(?:src|href)=['"]([^'"#?][^'"]*)['"]/g)]
    .map(([, ref]) => ref)
    .filter((ref) => !ref.startsWith('http://') && !ref.startsWith('https://') && !ref.startsWith('mailto:') && !ref.startsWith('data:'));

  for (const ref of refs) {
    if (!ref.startsWith('./')) continue;
    const target = resolve(dirname(file), ref);
    if (!existsSync(target)) throw new Error(`${label} references missing file: ${ref}`);
  }
};

inspectHtml(rootIndex, 'pages-dist/index.html');
inspectHtml(htmlIndex, 'pages-dist/html/index.html');
inspectHtml(reactIframe, 'pages-dist/iframe.html');
inspectHtml(htmlIframe, 'pages-dist/html/iframe.html');

const walk = (dir, files = []) => {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) walk(file, files);
    else files.push(file);
  }
  return files;
};

const allFiles = walk(pagesDir);
const fontFiles = allFiles.filter((file) => /proximanova/i.test(file));
if (fontFiles.length) {
  throw new Error(`Public pages build contains proprietary Proxima Nova font binaries:\n${fontFiles.map((file) => `- ${relative(root, file)}`).join('\n')}`);
}

const cssWithFontFaces = allFiles
  .filter((file) => file.endsWith('.css'))
  .filter((file) => /@font-face/i.test(readFileSync(file, 'utf8')));
if (cssWithFontFaces.length) {
  throw new Error(`Public pages CSS still embeds @font-face rules:\n${cssWithFontFaces.map((file) => `- ${relative(root, file)}`).join('\n')}`);
}

console.log('pages-dist verification passed: root and /html builds exist, use relative asset paths, and publish no Proxima Nova font binaries.');
