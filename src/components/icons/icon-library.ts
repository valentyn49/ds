import { ICON_ENTRIES, ICON_REGISTRY } from './icon-registry';
import type { FigmaIconName } from './icon-registry';
export { ICON_ENTRIES, ICON_REGISTRY, FIGMA_ICON_NAMES } from './icon-registry';
export type { FigmaIconName, IconEntry } from './icon-registry';

export function filterIcons(query = '', category = '') {
  const term = query.trim().toLocaleLowerCase();
  return ICON_ENTRIES.filter(entry => (!category || entry.category === category) &&
    (!term || `${entry.name} ${entry.figmaName} ${entry.nodeId}`.toLocaleLowerCase().includes(term)));
}

export const ICON_CATEGORIES = [...new Set(ICON_ENTRIES.map(entry => entry.category))];
export const ICON_SIZES = [...new Set(ICON_ENTRIES.map(entry => entry.width))];
export const ICON_COUNTS = {
  entries: ICON_ENTRIES.length,
  uniqueSvgExports: new Set(ICON_ENTRIES.map(entry => entry.svg)).size,
  components: ICON_ENTRIES.filter(entry => entry.nodeType === 'COMPONENT').length,
  instances: ICON_ENTRIES.filter(entry => entry.nodeType === 'INSTANCE').length,
  originalNames: new Set(ICON_ENTRIES.map(entry => entry.figmaName)).size,
  variants: ICON_ENTRIES.filter(entry => Object.keys(entry.variants).length > 0).length,
};

export function iconCode(name: FigmaIconName) { return `<Icon name="${name}" />`; }

// Exported geometry is trusted repository content, never user-supplied SVG.
// Only a verified single visible paint is customizable; mask whites and "none" remain intact.
export function iconContent(name: FigmaIconName, color?: string, scope?: string) {
  const entry = ICON_REGISTRY[name];
  if (!entry) throw new Error(`Unknown Figma icon: ${name}`);
  let content = entry.svg.replace(/^<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  if (color && entry.colorCustomizable) {
    content = content.replace(/\b(fill|stroke)="(?:#030712|black|#000000)"/gi, '$1="currentColor"');
  }
  if (scope && /\bid="/.test(content)) {
    const prefix = scope.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    for (const id of ids) {
      content = content.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`)
        .replaceAll(`url(#${id})`, `url(#${prefix}-${id})`)
        .replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
    }
  }
  return content;
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let uid = 0;

/** The HTML Storybook uses the same assets and paint policy as the React component. */
export function libraryIconHTML(name: FigmaIconName, { label, color, className = '' }: { label?: string; color?: string; className?: string } = {}) {
  const entry = ICON_REGISTRY[name];
  if (!entry) throw new Error(`Unknown Figma icon: ${name}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${entry.width}" height="${entry.height}" viewBox="${entry.viewBox}" fill="none" focusable="false" class="${escape(className)}"${label ? ` role="img" aria-label="${escape(label)}"` : ' aria-hidden="true"'}${color ? ` style="color:${escape(color)}"` : ''}>${iconContent(name, color, `ds-html-icon-${++uid}`)}</svg>`;
}
