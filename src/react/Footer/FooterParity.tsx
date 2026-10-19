import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { footerHTML } from '../../components/footer/footer.js';
import { FOOTER_SIZES, FOOTER_TYPES } from '../../components/footer/footer.spec.js';
import { Footer } from './Footer';
import type { FooterProps } from './Footer';
import { Logo } from './Logo';
import { logoSVG } from '../../components/footer/logo.js';

/*
  Documentation-only check. For every size and type (and the fallback for an unknown value) it renders the React
  Footer and the HTML builder `footerHTML()` and compares the resulting DOM (tag, attributes, class names, children).
  Both use the same CSS, so an identical DOM means an identical look. Generated ids differ by design, so ids are
  compared by position, not by value. The Logo is compared with `logoSVG()` the same way.
*/

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const bases = new Map<string, string>();
  const mapId = (value: string) => {
    const [, base, rest = ''] = /^(.*?)(-group-\d+-\d+)?$/.exec(value) ?? [];
    if (!bases.has(base)) bases.set(base, `ID${bases.size + 1}`);
    return bases.get(base) + rest;
  };
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
      .map((a) => {
        if (a.name === 'class') return `class="${a.value.split(/\s+/).sort().join(' ')}"`;
        if (a.name === 'id' || a.name === 'aria-labelledby') return `${a.name}="${mapId(a.value)}"`;
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
  react: FooterProps;
  html: Record<string, unknown>;
}

const buildHtml = footerHTML as (props: Record<string, unknown>) => string;

function buildCases(): Case[] {
  const cases: Case[] = [];
  for (const size of FOOTER_SIZES as string[]) {
    for (const type of FOOTER_TYPES as string[]) {
      cases.push({ name: `size=${size}, type=${type}`, react: { size, type } as FooterProps, html: { size, type } });
    }
  }
  cases.push({ name: 'defaults', react: {}, html: {} });
  cases.push({ name: 'unknown size falls back to big', react: { size: 'nope' } as unknown as FooterProps, html: { size: 'nope' } });
  cases.push({ name: 'unknown type falls back to standart', react: { type: 'nope' } as unknown as FooterProps, html: { type: 'nope' } });
  return cases;
}

export function FooterParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ name: c.name, react: normalize(renderToStaticMarkup(<Footer {...c.react} />)), html: normalize(buildHtml(c.html)) }))
      .filter((r) => r.react !== r.html);
    const logo = { name: 'Logo', react: normalize(renderToStaticMarkup(<Logo />)), html: normalize(logoSVG()) };
    const total = cases.length + 1;
    if (logo.react !== logo.html) failures.push(logo);
    return { total, failures };
  }, []);

  const ok = result.failures.length === 0;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status">
      <strong>{ok ? 'Identical' : 'Differences found'}</strong>
      <span>
        {result.total - result.failures.length} of {result.total} combinations render the same DOM in React and in the HTML builder (every size and type, the fallbacks for unknown values, and the Logo).
      </span>
      {result.failures.map((f) => (
        <pre key={f.name} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {f.name}
          {'\n'}React: {f.react}
          {'\n'}HTML:  {f.html}
        </pre>
      ))}
    </div>
  );
}
