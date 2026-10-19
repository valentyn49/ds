import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { headerHTML } from '../../components/header/header.js';
import { Header } from './Header';
import type { HeaderProps } from './Header';

/*
  Documentation-only check. For a matrix of props it renders the React Header and the HTML builder `headerHTML()` and
  compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an identical DOM means
  an identical look. Generated ids differ by design (the HTML counter vs React's useId), so the id prefix is replaced
  by a fixed one before comparing. The HTML icon builder writes an empty `class=""` that React omits.
*/

const ID_ATTRS = new Set(['id', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'for']);
const mapId = (value: string) => value.replace(/^ds-header-.*?(?=-(?:panel|drawer))/, 'ds-header-BASE');

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
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

interface Open {
  panel?: string | null;
  flyout?: boolean;
  drawer?: boolean;
  expanded?: string[];
}

interface Case {
  name: string;
  props: { platform?: string; type?: string; warning?: boolean };
  open?: Open;
}

const buildHtml = headerHTML as (props: Record<string, unknown>) => string;

function buildCases(): Case[] {
  const cases: Case[] = [];
  const platforms = ['standart', 'enterprise'];
  const types = ['yes', 'first purchase', 'registration', 'log out'];
  for (const platform of platforms)
    for (const type of types)
      for (const warning of [false, true]) cases.push({ name: `${platform} / ${type}${warning ? ' / warning' : ''}`, props: { platform, type, warning } });

  cases.push({ name: 'defaults', props: {} });
  cases.push({ name: 'unknown platform falls back to standart', props: { platform: 'nope' } });
  cases.push({ name: 'unknown type falls back to yes', props: { type: 'nope' } });

  for (const platform of platforms) {
    const yes = { platform, type: 'yes' };
    for (const panel of ['markets', 'myMarkets', 'watchlist', 'help', 'profile', 'cart']) cases.push({ name: `${platform} / yes / ${panel} open`, props: yes, open: { panel } });
    for (const panel of ['markets', 'help']) cases.push({ name: `${platform} / yes / ${panel} open with flyout`, props: yes, open: { panel, flyout: true } });
    cases.push({ name: `${platform} / yes / warning + profile open`, props: { ...yes, warning: true }, open: { panel: 'profile' } });

    const first = { platform, type: 'first purchase' };
    cases.push({ name: `${platform} / first purchase / help open`, props: first, open: { panel: 'help' } });
    cases.push({ name: `${platform} / first purchase / help open with flyout`, props: first, open: { panel: 'help', flyout: true } });
    cases.push({ name: `${platform} / first purchase / profile open`, props: first, open: { panel: 'profile' } });
    cases.push({ name: `${platform} / log out / a panel open (no such panel)`, props: { platform, type: 'log out' }, open: { panel: 'markets' } });

    cases.push({ name: `${platform} / drawer open`, props: yes, open: { drawer: true } });
    for (const key of ['Socrates Markets', 'My Markets', 'Help', 'account']) cases.push({ name: `${platform} / drawer open, ${key} expanded`, props: yes, open: { drawer: true, expanded: [key] } });
    cases.push({
      name: `${platform} / drawer open, everything expanded`,
      props: yes,
      open: { drawer: true, expanded: ['Socrates Markets', 'My Markets', 'Help', 'account'] },
    });
  }
  return cases;
}

export function HeaderParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({
        c,
        react: normalize(renderToStaticMarkup(<Header {...(c.props as HeaderProps)} defaultOpen={c.open as HeaderProps['defaultOpen']} />)),
        html: normalize(buildHtml({ ...c.props, open: c.open ?? {} })),
      }))
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
      {result.failures.map(({ c, react, html }) => (
        <pre key={c.name} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {c.name}
          {'\n'}React: {react}
          {'\n'}HTML:  {html}
        </pre>
      ))}
    </div>
  );
}
