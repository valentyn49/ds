import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { stepperHTML } from '../../components/stepper/stepper.js';
import { STEPPER_STATES } from '../../components/stepper/stepper.spec.js';
import { Stepper } from './Stepper';
import type { StepperProps } from './Stepper';

/*
  Documentation-only check. For a matrix of props it renders the React Stepper and the HTML builder `stepperHTML()`
  and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so an identical DOM
  means an identical look. The HTML builder writes an empty `class=""` on the check icon, which React does not; an
  empty class attribute has no effect, so it is ignored.
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

interface Case {
  name: string;
  react: StepperProps;
  html: Parameters<typeof stepperHTML>[0];
}

const TITLES = [
  ['default title', undefined],
  ['long title', 'A very long step title that is wider than the step'],
  ['special characters', 'A & <B> "C"'],
] as const;

function buildCases(): Case[] {
  const cases: Case[] = [];
  for (const state of STEPPER_STATES as StepperProps['state'][]) {
    for (const [titleName, title] of TITLES) {
      for (const showDescription of [true, false]) {
        for (const number of ['1', '12', undefined]) {
          const subtitle = showDescription ? 'Short & sweet' : undefined;
          cases.push({
            name: [state, titleName, showDescription ? 'description' : 'no description', `number ${number ?? 'default'}`].join(' / '),
            react: { state, title, showDescription, subtitle, number },
            html: { state, title, showDescription, subtitle, number },
          });
        }
      }
    }
  }
  // Defaults, and the fallback shared by both builders: an unknown state is shown as the default `active`.
  cases.push({ name: 'all defaults', react: {}, html: {} });
  cases.push({ name: 'unknown state falls back to active', react: { state: 'nope' as StepperProps['state'] }, html: { state: 'nope' } });
  return cases;
}

export function StepperParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<Stepper {...c.react} />)), html: normalize(stepperHTML(c.html)) }))
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
