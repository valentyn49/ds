import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { checkboxHTML } from '../../components/checkbox/checkbox.js';
import { CHECKBOX_STATES, STATE_PROPS } from '../../components/checkbox/checkbox.spec.js';
import { Checkbox } from './Checkbox';
import type { CheckboxProps } from './Checkbox';

/*
  Documentation-only check. For a matrix of props it renders the React Checkbox and the HTML builder `checkboxHTML()`
  and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an identical DOM
  means an identical look. Generated ids differ by design, so ids are compared by position, not by value.
*/

const ID_ATTRS = new Set(['id', 'aria-labelledby', 'aria-describedby', 'for']);

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const ids = new Map<string, string>();
  const mapId = (value: string) => {
    const [, base, suffix = ''] = /^(.*?)(-title|-caption)?$/.exec(value) ?? [];
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

interface Case {
  name: string;
  react: CheckboxProps;
  hover?: boolean;
  html: Record<string, unknown>;
}

// The JS builder's destructured parameter does not list `id`, `name` and `value` in its inferred type.
const buildHtml = checkboxHTML as (props: Record<string, unknown>) => string;

const TITLES = [
  ['default title', undefined],
  ['long title', 'A longer label that does not fit on one line wraps inside the text column'],
  ['special characters', 'A & <B> "C"'],
] as const;

function buildCases(): Case[] {
  const cases: Case[] = [];
  const captions: Array<[string, { showCaption: boolean; subtitle?: string }]> = [
    ['caption off', { showCaption: false }],
    ['caption default', { showCaption: true }],
    ['caption custom', { showCaption: true, subtitle: 'Supporting text & more' }],
  ];
  for (const [titleName, title] of TITLES) {
    for (const [captionName, caption] of captions) {
      for (const checked of [false, true]) {
        for (const disabled of [false, true]) {
          for (const withId of [false, true]) {
            for (const withName of [false, true]) {
              const id = withId ? 'cb-test' : undefined;
              const field = withName ? { name: 'agree', value: 'yes' } : {};
              cases.push({
                name: [titleName, captionName, checked ? 'checked' : 'unchecked', disabled ? 'disabled' : 'enabled', withId ? 'id' : 'generated id', withName ? 'name+value' : 'no name'].join(' / '),
                react: { title, ...caption, id, defaultChecked: checked, disabled, ...field },
                html: { title, ...caption, id, checked, disabled, ...field },
              });
            }
          }
        }
      }
    }
  }
  // The four Figma states, with the documentation-only hover preview.
  for (const state of CHECKBOX_STATES as string[]) {
    const props = (STATE_PROPS as Record<string, { checked: boolean; disabled?: boolean }>)[state];
    cases.push({
      name: `Figma state=${state}`,
      hover: state === 'hover',
      react: { defaultChecked: props.checked, disabled: props.disabled },
      html: { checked: props.checked, disabled: props.disabled },
    });
  }
  return cases;
}

const forceHover = (html: string) => html.replace('<label class="ds-checkbox"', '<label data-preview-state="hover" class="ds-checkbox"');

export function CheckboxParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => {
        const react = normalize(renderToStaticMarkup(<Checkbox {...c.react} rootProps={c.hover ? { 'data-preview-state': 'hover' } : undefined} />));
        const htmlRaw = buildHtml(c.html);
        return { c, react, html: normalize(c.hover ? forceHover(htmlRaw) : htmlRaw) };
      })
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
