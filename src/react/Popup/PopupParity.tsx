import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { popupHTML } from '../../components/popup/popup.js';
import { PopupView } from './Popup';
import type { PopupViewProps } from './Popup';

/*
  Documentation-only check. For a matrix of props it renders the React PopupView and the HTML builder `popupHTML()` and
  compares the resulting DOM (tag, attributes, class names, children), in the three modes (fixed, contained, static).
  Both use the same CSS, so an identical DOM means an identical look. Generated ids differ by design, so ids are
  compared by position, not by value. An empty `class=""` is treated as no class, and the preload links React's server renderer adds are ignored.
*/

const ID_ATTRS = new Set(['id', 'aria-labelledby', 'aria-describedby']);

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  // React 19's server renderer adds <link rel="preload"> for images; it is not part of the component's markup.
  template.content.querySelectorAll('link[rel="preload"]').forEach((el) => el.remove());
  const ids = new Map<string, string>();
  const mapId = (value: string) => {
    const [, base, suffix = ''] = /^(.*?)(-title|-subtitle|-body)?$/.exec(value) ?? [];
    if (!ids.has(base)) ids.set(base, `ID${ids.size + 1}`);
    return ids.get(base) + suffix;
  };
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
      .filter((a) => !(a.name === 'class' && a.value === ''))
      .map((a) => {
        if (a.name === 'class') return `class="${a.value.split(/\s+/).sort().join(' ')}"`;
        if (ID_ATTRS.has(a.name)) return `${a.name}="${mapId(a.value)}"`;
        return `${a.name}="${a.value}"`;
      })
      .sort()
      .join(' ');
    return `<${tag} ${attrs}>${[...el.childNodes].map(walk).join('')}</${tag}>`;
  };
  return [...template.content.childNodes].map(walk).join('');
};

interface Case {
  name: string;
  react: PopupViewProps;
  html: Record<string, unknown>;
}

const buildHtml = popupHTML as (props: Record<string, unknown>) => string;
const FRAME = { width: 1000, height: 520 };
const MODES = ['static', 'fixed', 'contained'] as const;
const TYPES = ['default', 'successfully', 'negative', 'nope'] as const; // 'nope' falls back to default in both
const WIDTHS = [600, 480, 500] as const; // 500 falls back to 600 in both
const SUBTITLES: Array<[string, string | undefined]> = [
  ['no subtitle', undefined],
  ['subtitle', 'A short description.'],
  ['special subtitle', 'A & <B> "C"'],
];

function buildCases(): Case[] {
  const cases: Case[] = [];
  for (const mode of MODES)
    for (const type of TYPES)
      for (const width of WIDTHS)
        for (const [subName, subtitle] of SUBTITLES)
          for (const showCancel of [true, false])
            for (const scrolling of [false, true]) {
              const frame = mode === 'static' ? FRAME : undefined;
              cases.push({
                name: `${mode} / ${type} / ${width} / ${subName} / cancel ${showCancel} / scrolling ${scrolling}`,
                react: { mode, type: type as PopupViewProps['type'], width: width as PopupViewProps['width'], title: 'Premium subscription required', subtitle, showCancel, scrolling, frame, children: 'Body text.' },
                html: { mode, type, width: String(width), title: 'Premium subscription required', subtitle: subtitle ?? '', showCancel, scrolling, frame, body: 'Body text.' },
              });
            }
  for (const mode of MODES) {
    const frame = mode === 'static' ? FRAME : undefined;
    cases.push({
      name: `${mode} / special characters in title, body and labels`,
      react: { mode, frame, title: 'A & <B> "C"', primaryLabel: 'Save & go', cancelLabel: '"Back"', children: 'Text & <b>markup</b> "quoted"' },
      html: { mode, frame, title: 'A & <B> "C"', primaryLabel: 'Save & go', cancelLabel: '"Back"', body: 'Text & <b>markup</b> "quoted"' },
    });
    cases.push({
      name: `${mode} / empty body`,
      react: { mode, frame, title: 'Title', children: '' },
      html: { mode, frame, title: 'Title', body: '' },
    });
  }
  return cases;
}

export function PopupParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<PopupView {...c.react} />)), html: normalize(buildHtml(c.html)) }))
      .filter((r) => r.react !== r.html);
    return { total: cases.length, failures };
  }, []);

  const ok = result.failures.length === 0;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status">
      <strong>{ok ? 'Identical' : 'Differences found'}</strong>
      <span>
        {result.total - result.failures.length} of {result.total} combinations render the same DOM in React and in the HTML builder.
      </span>
      {result.failures.slice(0, 5).map(({ c, react, html }) => (
        <pre key={c.name} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {c.name}
          {'\n'}React: {react}
          {'\n'}HTML:  {html}
        </pre>
      ))}
    </div>
  );
}
