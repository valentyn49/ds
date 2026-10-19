import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { radiobuttonHTML } from '../../components/radiobutton/radiobutton.js';
import { RadioButton } from './RadioButton';

/*
  Documentation-only check. It renders the React RadioButton and the HTML builder `radiobuttonHTML()` for a matrix of
  props and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an identical
  DOM means an identical look. Generated ids are renamed in order of appearance, so the case without an explicit id
  can be compared too.
*/

const ID_ATTRS = ['id', 'aria-labelledby', 'aria-describedby', 'for'];

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const ids = new Map<string, string>();
  const rename = (value: string) => {
    if (!ids.has(value)) ids.set(value, `#${ids.size + 1}`);
    return ids.get(value) as string;
  };
  // Own ids and the references to them are renamed together; every id is first seen as an `id` or as a reference.
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes]
      .map((a) => {
        if (a.name === 'class') return `class="${a.value.split(/\s+/).sort().join(' ')}"`;
        if (ID_ATTRS.includes(a.name)) return `${a.name}="${a.value.split(/\s+/).map((v) => rename(v.replace(/-(title|caption)$/, '')) + (v.match(/-(title|caption)$/)?.[0] ?? '')).join(' ')}"`;
        return `${a.name}="${a.value}"`;
      })
      .sort()
      .join(' ');
    return `<${tag} ${attrs}>${[...el.childNodes].map(walk).join('')}</${tag}>`;
  };
  return [...template.content.childNodes].map(walk).join('');
};

interface Props {
  id?: string;
  name?: string;
  value?: string;
  title?: string;
  showCaption?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeText?: string;
  checked?: boolean;
  disabled?: boolean;
}

interface Case {
  name: string;
  props: Props;
}

function buildCases(): Case[] {
  const cases: Case[] = [];
  const flags = [false, true];
  let n = 0;
  for (const showCaption of flags)
    for (const badge of flags)
      for (const checked of flags)
        for (const disabled of flags)
          for (const group of flags) {
            n += 1;
            cases.push({
              name: `caption ${showCaption ? 'on' : 'off'}, badge ${badge ? 'on' : 'off'}, ${checked ? 'selected' : 'unselected'}, ${disabled ? 'disabled' : 'enabled'}, ${group ? 'with name and value' : 'no name'}`,
              props: { id: `parity-${n}`, showCaption, badge, checked, disabled, ...(group ? { name: 'group', value: `option-${n}` } : {}) },
            });
          }
  cases.push({ name: 'custom texts', props: { id: 'parity-text', title: 'Plan', subtitle: 'Billed monthly', badge: true, badgeText: 'Pro' } });
  cases.push({ name: 'special characters', props: { id: 'parity-chars', title: 'A & <B> "C"', subtitle: 'x < y & z', badge: true, badgeText: '<new>' } });
  cases.push({ name: 'empty value', props: { id: 'parity-empty', name: 'g', value: '' } });
  cases.push({ name: 'generated id (ids renamed in order)', props: {} });
  return cases;
}

export function RadioButtonParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map(({ name, props }) => {
        const { checked, ...rest } = props;
        const react = normalize(renderToStaticMarkup(<RadioButton {...rest} defaultChecked={checked} />));
        const html = normalize(radiobuttonHTML(props));
        return { name, react, html };
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
      {result.failures.map(({ name, react, html }) => (
        <pre key={name} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {name}
          {'\n'}React: {react}
          {'\n'}HTML:  {html}
        </pre>
      ))}
    </div>
  );
}
