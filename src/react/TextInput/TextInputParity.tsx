import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { textInputHTML } from '../../components/text-input/text-input.js';
import { INPUT_ICON_NAMES, TextInput } from './TextInput';
import type { InputIconName, TextInputProps } from './TextInput';

/*
  Documentation-only check. It renders the React TextInput and the HTML builder `textInputHTML()` for a large matrix of
  properties and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an
  identical DOM means an identical look.
*/

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
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

// The JS builder's parameter type is inferred from its defaults and leaves out `id`, `name` and `validation`.
type HtmlProps = Record<string, unknown>;
interface Case {
  name: string;
  react: TextInputProps;
  html: HtmlProps;
}

const TEXT = { label: 'Your email', placeholder: 'Search for employee profile', footnote: 'We’ll never share your details.' };

interface Combo {
  showLabel: boolean;
  info: boolean;
  left?: InputIconName;
  right?: InputIconName;
  footnote: boolean;
  disabled: boolean;
  validation?: 'valid' | 'error';
  value: string;
}

function make(c: Combo, n: number, text = TEXT): Case {
  const id = `p-${n}`;
  const name = [
    c.showLabel ? 'label' : 'no label',
    c.info && 'info',
    c.left && `left ${c.left}`,
    c.right && `right ${c.right}`,
    c.footnote ? 'footnote' : 'no footnote',
    c.disabled && 'disabled',
    c.validation,
    c.value && 'value',
  ]
    .filter(Boolean)
    .join(', ');
  return {
    name,
    react: {
      id,
      label: text.label,
      showLabel: c.showLabel,
      info: c.info,
      placeholder: text.placeholder,
      leftIcon: c.left,
      rightIcon: c.right,
      footnote: c.footnote ? text.footnote : undefined,
      disabled: c.disabled,
      validation: c.validation,
      ...(c.value ? { defaultValue: c.value } : {}),
    },
    html: {
      id,
      label: text.label,
      showLabel: c.showLabel,
      info: c.info,
      placeholder: text.placeholder,
      showLeftIcon: Boolean(c.left),
      leftIcon: c.left ?? 'info',
      showRightIcon: Boolean(c.right),
      rightIcon: c.right ?? 'info',
      showFootnote: c.footnote,
      footnote: text.footnote,
      disabled: c.disabled,
      validation: c.validation,
      value: c.value,
    },
  };
}

function buildCases(): Case[] {
  const cases: Case[] = [];
  let n = 0;
  const icons: Array<InputIconName | undefined> = [undefined, 'info', 'search'];
  // Full factorial over every Figma property (864 combinations).
  for (const showLabel of [true, false])
    for (const info of [false, true])
      for (const left of icons)
        for (const right of icons)
          for (const footnote of [true, false])
            for (const disabled of [false, true])
              for (const validation of [undefined, 'valid', 'error'] as const)
                for (const value of ['', 'Jane Doe'])
                  cases.push(make({ showLabel, info, left, right, footnote, disabled, validation, value }, ++n));
  // Every icon name in both slots.
  for (const icon of INPUT_ICON_NAMES) {
    cases.push(make({ showLabel: true, info: false, left: icon, footnote: false, disabled: false, value: '' }, ++n));
    cases.push(make({ showLabel: true, info: false, right: icon, footnote: false, disabled: false, value: '' }, ++n));
  }
  // Text is escaped in both.
  cases.push(
    make(
      { showLabel: true, info: true, left: 'search', footnote: true, disabled: false, validation: 'error', value: 'A & <B> "C"' },
      ++n,
      { label: 'A & <B> "C"', placeholder: 'x & <y> "z"', footnote: 'f & <g> "h"' },
    ),
  );
  return cases;
}

export function TextInputParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<TextInput {...c.react} />)), html: normalize(textInputHTML(c.html as never)) }))
      .filter((r) => r.react !== r.html);
    return { total: cases.length, failures };
  }, []);

  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status">
      <strong>{result.failures.length === 0 ? 'Identical' : 'Differences found'}</strong>
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
