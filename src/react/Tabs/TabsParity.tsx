import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tabsHTML, sampleItems } from '../../components/tabs/tabs.js';
import { TABS_TYPES, ITEM_COUNT } from '../../components/tabs/tabs.spec.js';
import { Tabs } from './Tabs';
import type { TabsItem, TabsMode, TabsType } from './Tabs';

/*
  Documentation-only check. For a matrix of props it renders the React Tabs and the HTML builder `tabsHTML()` and
  compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an identical DOM means
  an identical look. Generated ids differ by design, so ids are compared by position, not by value.
*/

const ID_ATTRS = new Set(['id', 'aria-controls', 'aria-labelledby']);

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const ids = new Map<string, string>();
  const mapId = (value: string) => {
    const [, base, suffix = ''] = /^(.*?)(-tab-\d+|-panel-\d+)$/.exec(value) ?? [, value];
    if (!ids.has(base)) ids.set(base, `ID${ids.size + 1}`);
    return ids.get(base) + suffix;
  };
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
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

type HtmlItem = Record<string, unknown> & { label: string };

interface Case {
  name: string;
  type: string;
  mode?: TabsMode;
  items: HtmlItem[];
  selected: number | null;
}

// The JS builders' parameter types are inferred from their defaults, which are narrower than what they accept.
const buildHtml = tabsHTML as (props: Record<string, unknown>) => string;
const makeItems = sampleItems as (type: string, count: number, options?: Record<string, unknown>) => HtmlItem[];

const toReact = (item: HtmlItem): TabsItem => ({
  label: item.label,
  icon: item.icon as boolean | undefined,
  pro: item.pro as boolean | undefined,
  dividerBefore: item.dividerBefore as boolean | undefined,
  disabled: item.disabled as boolean | undefined,
  href: item.href as string | undefined,
  panel: item.panel as string | undefined,
  previewState: item.previewState as TabsItem['previewState'],
});

function buildCases(): Case[] {
  const cases: Case[] = [];
  const ranges = ITEM_COUNT as Record<string, { min: number; max: number; default: number }>;
  for (const type of TABS_TYPES as string[]) {
    const range = ranges[type];
    const modes: Array<TabsMode | undefined> = type === 'Small tab' ? ['light', 'dark'] : [undefined];
    for (const mode of modes) {
      for (const count of [range.min, range.default, range.max]) {
        for (const icon of [false, true]) {
          for (const withPanels of type === 'General tab' ? [false] : [false, true]) {
            for (const disabled of ['none', 'second', 'first'] as const) {
              for (const selectedKind of ['first', 'second', 'last', 'none'] as const) {
                const items = makeItems(type, count, { icon });
                if (withPanels) items.forEach((item, i) => (item.panel = `Panel ${i + 1}`));
                if (disabled === 'second') items[1].disabled = true;
                if (disabled === 'first') items[0].disabled = true;
                const selected = selectedKind === 'first' ? 0 : selectedKind === 'second' ? 1 : selectedKind === 'last' ? items.length - 1 : null;
                cases.push({
                  name: `${type}${mode ? ' ' + mode : ''}, ${count} tabs, icon ${icon}, panels ${withPanels}, disabled ${disabled}, selected ${selectedKind}`,
                  type,
                  mode,
                  items,
                  selected,
                });
              }
            }
          }
        }
      }
    }
  }
  // General tab options: badge, dividers, hrefs, forced preview states.
  for (const [pro, divider] of [[true, false], [false, true], [true, true]] as const) {
    const items = makeItems('General tab', 6, { icon: true, pro, divider });
    cases.push({ name: `General tab, pro ${pro}, divider ${divider}`, type: 'General tab', items, selected: 2 });
  }
  const links = makeItems('General tab', 4);
  links.forEach((item, i) => (item.href = i === 1 ? '/overview' : '#'));
  cases.push({ name: 'General tab, real href', type: 'General tab', items: links, selected: 1 });
  for (const type of TABS_TYPES as string[]) {
    for (const previewState of ['hover', 'pressed', 'focus']) {
      const items = makeItems(type, 4);
      items[2].previewState = previewState;
      cases.push({ name: `${type}, forced ${previewState}`, type, items, selected: 0 });
    }
  }
  cases.push({ name: 'unknown type falls back to tab', type: 'nope', items: makeItems('tab', 3), selected: 0 });
  cases.push({ name: 'selected beyond the end is clamped', type: 'tab', items: makeItems('tab', 3), selected: 9 });
  cases.push({ name: 'special characters', type: 'tab', items: [{ label: 'A & <B> "C"' }, { label: 'Plain' }], selected: 0 });
  return cases;
}

export function TabsParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({
        c,
        react: normalize(renderToStaticMarkup(<Tabs type={c.type as TabsType} mode={c.mode} items={c.items.map(toReact)} value={c.selected} />)),
        html: normalize(buildHtml({ type: c.type, mode: c.mode, items: c.items, selected: c.selected })),
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
