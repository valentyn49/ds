import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { textAreaForState, textAreaStateConfig } from '../../docs/text-area-docs.js';
import { TEXT_AREA_STATES } from '../../components/text-area/text-area.spec.js';
import { TextArea } from './TextArea';
import type { TextAreaProps } from './TextArea';

/*
  Documentation-only check. For every state and configuration it renders the React TextArea and the HTML builder
  `textAreaHTML()` and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so
  an identical DOM means an identical look.
*/

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
      .filter((a) => !(a.name === 'class' && a.value.trim() === ''))
      .map((a) => (a.name === 'class' ? `class="${a.value.split(/\s+/).sort().join(' ')}"` : `${a.name}="${a.value}"`))
      .sort()
      .join(' ');
    return `<${tag} ${attrs}>${[...el.childNodes].map(walk).join('')}</${tag}>`;
  };
  return [...template.content.childNodes].map(walk).join('');
};

interface Config {
  name: string;
  html: Record<string, unknown>;
  react: Partial<TextAreaProps>;
}

const CONFIGURATIONS: Config[] = [
  { name: 'default', html: {}, react: {} },
  { name: 'info', html: { info: true }, react: { info: true } },
  { name: 'left icon', html: { showLeftIcon: true }, react: { leftIcon: 'info' } },
  { name: 'right icon', html: { showRightIcon: true }, react: { rightIcon: 'info' } },
  { name: 'both icons', html: { showLeftIcon: true, showRightIcon: true }, react: { leftIcon: 'info', rightIcon: 'info' } },
  { name: 'other icons', html: { showLeftIcon: true, leftIcon: 'search', showRightIcon: true, rightIcon: 'chevron' }, react: { leftIcon: 'search', rightIcon: 'chevron' } },
  { name: 'label off', html: { showLabel: false }, react: { showLabel: false } },
  { name: 'label off + info (ignored)', html: { showLabel: false, info: true }, react: { showLabel: false, info: true } },
  { name: 'footnote off', html: { showFootnote: false }, react: { showFootnote: false } },
  { name: 'label and footnote off', html: { showLabel: false, showFootnote: false }, react: { showLabel: false, showFootnote: false } },
  { name: 'custom texts', html: { label: 'Comment', placeholder: 'Write here', footnote: 'Max 200 characters' }, react: { label: 'Comment', placeholder: 'Write here', footnote: 'Max 200 characters' } },
  { name: 'escaped texts', html: { label: 'A & <B> "C"', placeholder: 'x & <y>', footnote: '1 < 2 & "3"' }, react: { label: 'A & <B> "C"', placeholder: 'x & <y>', footnote: '1 < 2 & "3"' } },
  { name: 'empty placeholder', html: { placeholder: '' }, react: { placeholder: '' } },
  { name: 'name attribute', html: { name: 'comment' }, react: { name: 'comment' } },
];

const VALUES: Array<{ name: string; value: string }> = [
  { name: 'value', value: 'Entered text' },
  { name: 'multiline value', value: 'First line\nSecond line\nThird line' },
  { name: 'value with special characters', value: 'A & <B> "C" it\'s' },
];

interface Case {
  name: string;
  html: string;
  react: TextAreaProps;
}

function buildCases(): Case[] {
  const cases: Case[] = [];
  const id = 'parity';
  for (const state of TEXT_AREA_STATES as string[]) {
    for (const config of CONFIGURATIONS) {
      const { props, forceFocus } = textAreaStateConfig(state, config.html.placeholder as string | undefined) as { props: { value?: string; disabled?: boolean; validation?: 'valid' | 'error' }; forceFocus?: boolean };
      const reactProps: TextAreaProps = { id, ...config.react };
      if (props.value !== undefined) reactProps.defaultValue = props.value;
      if (props.disabled) reactProps.disabled = true;
      if (props.validation) reactProps.validation = props.validation;
      if (forceFocus) reactProps['data-preview-state'] = 'focus';
      cases.push({
        name: `state=${state} / ${config.name}`,
        html: textAreaForState(state, { id, ...config.html }),
        react: reactProps,
      });
    }
  }
  for (const { name, value } of VALUES) {
    cases.push({ name, html: textAreaForState('filled', { id, value, placeholder: value }), react: { id, defaultValue: value, placeholder: value } });
  }
  // The validation prop on its own, and an unknown validation value that both builders ignore.
  cases.push({ name: 'validation=valid without value', html: textAreaForState('default', { id, validation: 'valid' }), react: { id, validation: 'valid' } });
  cases.push({ name: 'validation=error without value', html: textAreaForState('default', { id, validation: 'error' }), react: { id, validation: 'error' } });
  cases.push({ name: 'unknown validation is ignored', html: textAreaForState('default', { id, validation: 'nope' }), react: { id, validation: 'nope' as TextAreaProps['validation'] } });
  cases.push({ name: 'disabled + error', html: textAreaForState('default', { id, disabled: true, validation: 'error' }), react: { id, disabled: true, validation: 'error' } });
  return cases;
}

export function TextAreaParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<TextArea {...c.react} />)), html: normalize(c.html) }))
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
