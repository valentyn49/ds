import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDropdown, dropdownItemsHTML } from '../../components/dropdown/dropdown.js';
import { Dropdown, DropdownItems } from './Dropdown';
import type { DropdownOption, DropdownProps } from './Dropdown';

/*
  Documentation-only check. For a matrix of props it renders the React Dropdown (server-side, initial state) and the
  live HTML component `createDropdown()` (so the open state is the real one, with the first/selected option
  highlighted) and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an
  identical DOM means an identical look. The generated id base differs by design, so it is replaced by `BASE` on each
  side. An empty `class=""` (the HTML icon builder writes one) is treated as no class.
*/

const normalize = (html: string): string => {
  const base = /id="([^"]+)-trigger"/.exec(html)?.[1];
  const text = base ? html.split(base).join('BASE') : html;
  const template = document.createElement('template');
  template.innerHTML = text;
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
      .filter((a) => !(a.name === 'class' && a.value === ''))
      .map((a) => (a.name === 'class' ? `class="${a.value.split(/\s+/).sort().join(' ')}"` : `${a.name}="${a.value}"`))
      .sort()
      .join(' ');
    return `<${tag} ${attrs}>${[...el.childNodes].map(walk).join('')}</${tag}>`;
  };
  return [...template.content.childNodes].map(walk).join('');
};

type Shared = Omit<DropdownProps, 'open' | 'value' | 'defaultOpen' | 'defaultValue'> & { open?: boolean; value?: string };

interface Case {
  name: string;
  props: Shared;
}

const CUSTOM: DropdownOption[] = [
  { label: 'London' },
  { label: 'Paris', checkbox: true },
  { label: 'Berlin', color: 'var(--ds-color-alert-500)' },
  { label: 'Madrid', rightIcon: true },
  { label: 'Rome', pro: true },
  { label: 'Oslo', pro: 'New', value: 'oslo' },
];

function buildCases(): Case[] {
  const cases: Case[] = [];
  const add = (name: string, props: Shared) => cases.push({ name, props: { id: 'pd', ...props } });

  // Figma trigger states and the label / footnote / info switches
  add('default', {});
  add('selected', { value: 'London' });
  add('disabled', { disabled: true });
  add('disabled + selected', { disabled: true, value: 'Paris' });
  add('error', { validation: 'error' });
  add('error + selected', { validation: 'error', value: 'Berlin' });
  for (const showLabel of [true, false])
    for (const info of [true, false])
      for (const showFootnote of [true, false]) add(`label ${showLabel} / info ${info} / footnote ${showFootnote}`, { showLabel, info, showFootnote });
  add('custom texts', { label: 'Leave type', placeholder: 'Pick one', footnote: 'Choose carefully' });
  add('special characters', { label: 'A & <B> "C"', placeholder: '<x>', footnote: 'Q & A', options: ['A & B', '<i>', '"q"'], value: 'A & B' });
  add('name', { name: 'city' });
  add('no options', { options: [] });
  add('object options', { options: [{ label: 'One', value: '1' }, { label: 'Two', value: '2' }], value: '2' });
  add('value that matches nothing', { value: 'Nowhere' });

  // Optional parts of the menu items, closed and open
  for (const open of [false, true])
    for (const value of [undefined, 'Paris'])
      for (const flags of [{}, { showPro: true }, { showCheckbox: true }, { showRightIcon: true }, { showColor: true }, { showPro: true, showCheckbox: true, showRightIcon: true, showColor: true }, { showSearch: true }, { showSearch: true, showPro: true, showRightIcon: true }])
        add(`${open ? 'open' : 'closed'} / ${value ?? 'no value'} / ${Object.keys(flags).join('+') || 'plain'}`, { open, value, ...flags });
  add('open, per-item parts', { open: true, options: CUSTOM, value: 'Madrid' });
  add('open, per-item parts, selected Rome', { open: true, options: CUSTOM, value: 'Rome' });
  add('open, per-item parts + search', { open: true, options: CUSTOM, value: 'oslo', showSearch: true });
  add('open, pro badges', { open: true, showPro: true });
  add('open, disabled (stays closed)', { open: true, disabled: true });
  add('open, no options', { open: true, options: [], showSearch: true });
  add('open, error', { open: true, validation: 'error', value: 'Berlin' });
  add('open, title and footnote off', { open: true, showLabel: false, showFootnote: false });

  // Documentation preview attribute on the root
  add('forced hover look', { 'data-preview-state': 'hover' } as Shared);
  return cases;
}

const toReact = ({ open, value, ...props }: Shared): DropdownProps => ({ ...props, defaultOpen: open, defaultValue: value });

function render(props: Shared) {
  const reactHtml = renderToStaticMarkup(<Dropdown {...toReact(props)} />);
  const htmlRoot = (createDropdown as (props: Record<string, unknown>) => HTMLElement)(props as Record<string, unknown>);
  const preview = (props as Record<string, unknown>)['data-preview-state'];
  if (preview) htmlRoot.setAttribute('data-preview-state', String(preview));
  return { react: normalize(reactHtml), html: normalize(htmlRoot.outerHTML) };
}

function itemsCases() {
  const cases: Array<[string, DropdownOption[], Record<string, unknown>]> = [
    ['items plain', ['London', 'Paris'], {}],
    ['items selected + active', ['London', 'Paris', 'Berlin'], { selectedIndex: 1, activeIndex: 2 }],
    ['items all parts', CUSTOM, { selectedIndex: 3, showPro: true, showCheckbox: true, showRightIcon: true, showColor: true, proText: 'Premium' }],
    ['items per-item parts', CUSTOM, { selectedIndex: 3, activeIndex: 0 }],
  ];
  return cases.map(([name, options, ctx]) => {
    const { selectedIndex, activeIndex, ...flags } = ctx as Record<string, unknown>;
    const react = renderToStaticMarkup(<DropdownItems options={options} selectedIndex={selectedIndex as number | undefined} activeIndex={activeIndex as number | undefined} idPrefix="pd" {...(flags as object)} />);
    const html = (dropdownItemsHTML as (o: unknown, c: unknown) => string)(options, { idPrefix: 'pd', ...ctx });
    return { name, react: normalize(`<div>${react}</div>`), html: normalize(`<div>${html}</div>`) };
  });
}

export function DropdownParity() {
  const result = useMemo(() => {
    const rows = buildCases().map((c) => ({ name: c.name, ...render(c.props) }));
    const items = itemsCases();
    const all = [...rows, ...items];
    // The same props without an id: the generated id bases differ, the rest must not.
    const generated = render({});
    all.push({ name: 'generated ids', ...generated });
    return { total: all.length, failures: all.filter((r) => r.react !== r.html) };
  }, []);

  const ok = result.failures.length === 0;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status">
      <strong>{ok ? 'Identical' : 'Differences found'}</strong>
      <span>
        {result.total - result.failures.length} of {result.total} combinations render the same DOM in React and in the HTML component.
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
