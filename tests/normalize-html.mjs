// Canonicalize the trusted, generated markup used by these tests; this is not a layout engine or HTML sanitizer.
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
  if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0' }[entity.toLowerCase()];
});
export function normalizeHtml(source) {
  const ids = new Map([...source.matchAll(/\bid="([^"]+)"/g)].map((match, index) => [decode(match[1]), `ID${index}`]));
  const tokens = [];
  for (const [part] of source.matchAll(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g)) {
    if (part.startsWith('<!--')) continue;
    if (!part.startsWith('<')) { tokens.push(['text', decode(part)]); continue; }
    const tag = /^<\/?([^\s/>]+)/.exec(part)[1].toLowerCase();
    if (part.startsWith('</')) { if (!voidTags.has(tag)) tokens.push(['end', tag]); continue; }
    const attrs = [...part.slice(part.indexOf(tag) + tag.length).replace(/\/?\s*>$/, '').matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g)]
      .map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4] ?? '')]);
    const values = Object.fromEntries(attrs);
    if (tag === 'link' && values.rel === 'preload') continue;
    const normalized = attrs.filter(([name, value]) => !(name === 'class' && !value.trim()) && !(name === 'tabindex' && values.class?.includes('ds-header__drawer')))
      .map(([name, value]) => {
        if (name === 'class') value = value.split(/\s+/).sort().join(' ');
        if (name === 'style') value = value.replace(/;$/, '');
        if (['id', 'for', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-activedescendant'].includes(name)) value = value.split(/\s+/).map(id => ids.get(id) ?? id).join(' ');
        return [name, value];
      }).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    tokens.push(['start', tag, normalized]);
    if (part.endsWith('/>') && !voidTags.has(tag)) tokens.push(['end', tag]);
  }
  return tokens;
}
