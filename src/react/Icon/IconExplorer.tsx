import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';
import { Button } from '../Button/Button';
import { ICON_ENTRIES, ICON_REGISTRY, ICON_CATEGORIES, ICON_COUNTS, FIGMA_ICON_NAMES, filterIcons, iconCode } from '../../components/icons/icon-library';
import type { FigmaIconName } from './Icon';
import '../../docs/button-docs.css';
import '../../docs/icons-docs.css';

export async function copyIconText(text: string) {
  // The fallback handles Storybook opened without a secure Clipboard API context.
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Try the document clipboard below. */ }
  }
  const previous = document.activeElement as HTMLElement | null;
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('aria-label', 'Copy icon text');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.append(field);
  try {
    field.select();
    if (!document.execCommand('copy')) throw new Error('Clipboard is unavailable. Select and copy the code shown in the inspector.');
  } finally { field.remove(); previous?.focus({ preventScroll: true }); }
}

export function IconGallery() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<FigmaIconName>('icon/search');
  const [feedback, setFeedback] = useState('');
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const entries = filterIcons(query, category);
  const entry = ICON_REGISTRY[selected];
  useEffect(() => () => clearTimeout(feedbackTimer.current), []);
  async function copy(text: string, kind: string) {
    clearTimeout(feedbackTimer.current);
    try { await copyIconText(text); setFeedback(`${kind} copied: ${text}`); }
    catch (error) { setFeedback(error instanceof Error ? error.message : 'Copy failed. Select the code and copy it manually.'); }
    feedbackTimer.current = setTimeout(() => setFeedback(''), 3000);
  }
  return <div className="ds-icons-explorer">
    <div className="ds-icons-toolbar">
      <label htmlFor={`${id}-search`}>Search icons<input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, Figma name, or node ID" /></label>
      <label htmlFor={`${id}-category`}>Figma group<select id={`${id}-category`} value={category} onChange={event => setCategory(event.target.value)}><option value="">All groups</option>{ICON_CATEGORIES.map(group => <option key={group} value={group}>{group} /</option>)}</select></label>
      <Button variant="Stroke" size={36} onClick={() => { setQuery(''); setCategory(''); }}>Clear filters</Button>
    </div>
    <div className="ds-icons-results" role="status">{entries.length} of {ICON_COUNTS.entries} entries</div>
    <div className="ds-icons-inspector" aria-label="Selected icon">
      <div className="ds-icons-inspector__preview"><Icon name={selected} label={entry.figmaName} /></div>
      <div className="ds-icons-inspector__content"><strong>{entry.figmaName}</strong><code>{iconCode(selected)}</code><span>{entry.width} × {entry.height} · viewBox {entry.viewBox} · {entry.rendering} · {entry.defaultColor}</span><a href={`https://www.figma.com/design/spBZF1HWrU83CHRMF8q3mU/?node-id=${entry.nodeId.replace(':', '-')}`} target="_blank" rel="noreferrer">Inspect Figma node {entry.nodeId}</a></div>
      <div className="ds-icons-copy"><Button variant="Stroke" size={36} onClick={() => copy(selected, 'Name')}>Copy name</Button><Button variant="Stroke" size={36} onClick={() => copy(iconCode(selected), 'Code')}>Copy code</Button></div>
    </div>
    <div className="ds-icons-feedback" role="status" aria-live="polite">{feedback}</div>
    <div className="ds-icons-grid">
      {entries.map(icon => <article key={icon.name} className={`ds-icons-tile${selected === icon.name ? ' is-selected' : ''}`}>
        <button type="button" className="ds-icons-tile__inspect" aria-label={`Inspect ${icon.name}`} aria-pressed={selected === icon.name} onClick={() => setSelected(icon.name)}>
          <span className="ds-icons-tile__preview"><Icon name={icon.name} /></span><code>{icon.name}</code>
        </button>
        <div className="ds-icons-tile__actions"><button type="button" onClick={() => copy(icon.name, 'Name')} aria-label={`Copy name ${icon.name}`}>Copy name</button><button type="button" onClick={() => copy(iconCode(icon.name), 'Code')} aria-label={`Copy code ${icon.name}`}>Copy code</button></div>
      </article>)}
    </div>
    {entries.length === 0 && <p className="ds-icons-empty">No matching icons. Clear the filters to see the full collection.</p>}
  </div>;
}

/** Used in the HTML docs too, so both Storybooks demonstrate the real React Icon. */
export function IconPlayground() {
  const [name, setName] = useState<FigmaIconName>('icon/search');
  const [custom, setCustom] = useState(false);
  const [color, setColor] = useState('#179af5');
  const [label, setLabel] = useState('Search');
  const entry = ICON_REGISTRY[name];
  return <div className="ds-icons-playground">
    <div className="ds-icons-toolbar">
      <label>Icon<select value={name} onChange={event => setName(event.target.value as FigmaIconName)}>{FIGMA_ICON_NAMES.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Verified size<select value="24" disabled aria-label="Verified size: 24 pixels"><option>24</option></select></label>
      <label>Color mode<select value={custom ? 'custom' : 'original'} onChange={event => setCustom(event.target.value === 'custom')}><option value="original">Original Figma paint</option><option value="custom" disabled={!entry.colorCustomizable}>Custom monochrome paint</option></select></label>
      {custom && entry.colorCustomizable && <label>Icon color<input type="color" value={color} onChange={event => setColor(event.target.value)} /></label>}
      <label>Accessible label<input value={label} onChange={event => setLabel(event.target.value)} placeholder="Empty means decorative" /></label>
    </div>
    <div className="ds-icons-demo"><Icon name={name} size={24} color={custom ? color : undefined} label={label || undefined} /></div>
    <code>{`<Icon name="${name}" size={24}${custom ? ` color="${color}"` : ''}${label ? ` label=${JSON.stringify(label)}` : ''} />`}</code>
    <p>No Figma variant properties or alternate sizes are defined for these entries. Distinct drawings are selected by their own names.</p>
  </div>;
}

export function IconIntroduction() {
  return <p>{ICON_COUNTS.entries} exported entries: {ICON_COUNTS.components} components and {ICON_COUNTS.instances} displayed instances, with {ICON_COUNTS.originalNames} distinct original names. Source: <a href="https://www.figma.com/design/spBZF1HWrU83CHRMF8q3mU/-AEGL-AUG--Design-Library?node-id=6-5659">Figma / Icon Set</a>. Every preview uses the original vector export. Displayed names in the Figma tiles sometimes differ from their component names; this library maps the component names.</p>;
}

export function IconReference() {
  const duplicates = ICON_ENTRIES.filter(icon => ICON_ENTRIES.some(other => other.nodeId !== icon.nodeId && other.figmaName === icon.figmaName));
  return <div className="ds-icons-reference">
    <h2>Anatomy</h2>
    <div className="ds-bd-anatomy__stage ds-icons-anatomy"><div className="ds-bd-anatomy__figure"><div className="ds-icons-anatomy__viewport"><Icon name="icon/chart_tooltip_off" /></div><span className="ds-bd-marker ds-bd-marker--top ds-icons-marker-one"><b>1</b></span><span className="ds-bd-marker ds-bd-marker--bottom ds-icons-marker-two"><b>2</b></span></div></div>
    <ul className="ds-bd-anatomy__legend"><li><b>1</b><div><strong>SVG viewport</strong><span>All 81 entries use a 24 × 24 frame and viewBox 0 0 24 24. Geometry keeps its original internal alignment; no common padding rule is inferred.</span></div></li><li><b>2</b><div><strong>Original geometry and paint</strong><span>Most icons are filled paths. chart_tooltip_off includes a 1.5px source stroke with NONE cap and MITER join; its export also includes a mask. Mask white is preserved when visible paint is customized. Other icons are not given this stroke width.</span></div></li></ul>
    <h2>Sizes</h2><p>The only verified source size is 24 × 24. There is no 16/20/32 size-variant scale in this collection. These previews are displayed at their actual source size.</p>
    <div className="ds-icons-size-row">{(['icon/search', 'icon/star_filled', 'icon/visibility_off', 'icon/chart_tooltip_off'] as const).map(name => <div key={name}><Icon name={name} size={24} /><code>{name}</code><span>24 × 24</span></div>)}</div>
    <h2>Variants</h2><p>{ICON_COUNTS.variants} formal component-set variants. Filled, selected, off, and crossed drawings are separate named icons, not generated styles. Repeated component names are retained below with stable node-ID suffixes; none are silently overwritten.</p>
    <div className="ds-icons-variant-grid">{duplicates.map(entry => <div key={entry.name}><Icon name={entry.name} /><code>{entry.name}</code><span>{entry.figmaName} · {entry.nodeId}</span></div>)}</div>
    <h2>Usage</h2>
    <pre><code>{`import { Icon, type FigmaIconName } from '@socrates/design-system';\n\n// Original Figma paint; decorative by default.\n<Icon name="icon/search" />\n\n// The verified source size, with a meaningful accessible label.\n<Icon name="icon/search" size={24} label="Search" />\n\n// Opt into a token color for this verified monochrome drawing.\n<Icon name="icon/search" color="var(--ds-color-primary-600)" />\n\n// Native accessible naming is supported too.\n<Icon name="icon/notifications" aria-label="Notifications" />\n\nconst icon: FigmaIconName = 'icon/chart_tooltip_off';`}</code></pre>
    <p><code>icon/...</code> identifies an original Figma asset. Names use lowercase and retain original spelling such as <code>standart</code> and <code>check_box_cheked</code>. The Cyrillic <code>с</code> in the two <code>сondensed</code> names is mapped to ASCII <code>c</code>; the original names remain in the inventory. Duplicate names append <code>--node-id</code>.</p>
    <p>The existing short names such as <code>search</code>, <code>close</code>, and <code>chevron</code> remain compatibility names with their previous geometry and currentColor behavior. New code should use the canonical names. Unknown names fail explicitly instead of rendering an unrelated fallback icon.</p>
    <p>The source rendering model is monochrome: 80 entries bind their visible paint to <code>gray/900</code> (#030712); <code>icon/logoff</code> has an unbound black paint. Original paints are the default. Passing <code>color</code> opts into a replacement visible paint, preserving masks and transparent fills. No multicolor source icon was found in this node.</p>
    <h2>Icon Inventory</h2><p>{ICON_COUNTS.entries} unique identifiers · {ICON_COUNTS.uniqueSvgExports} distinct SVG exports · {ICON_COUNTS.originalNames} original names · {ICON_COUNTS.components} component definitions · {ICON_COUNTS.instances} displayed instances · {ICON_COUNTS.variants} formal variants · 0 missing assets.</p>
    <div className="ds-icons-table-scroll"><table className="ds-table"><thead><tr><th>Preview</th><th>Original Figma name</th><th>Developer identifier</th><th>Group</th><th>Size / variants</th><th>Node</th></tr></thead><tbody>{ICON_ENTRIES.map(entry => <tr key={entry.name}><td><Icon name={entry.name} /></td><td>{entry.figmaName}</td><td><code>{entry.name}</code></td><td>{entry.category} /</td><td>{entry.width} × {entry.height} / none</td><td>{entry.nodeId}<br />{entry.nodeType.toLowerCase()}</td></tr>)}</tbody></table></div>
  </div>;
}
