import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { inputTagHTML } from '../../components/input-tag/input-tag.js';
import { INPUT_TAG_DEFAULTS } from '../../components/input-tag/input-tag.spec.js';
import { INPUT_TAG_ICON_NAMES, InputTag } from './InputTag';
import type { InputTagIconName, InputTagProps } from './InputTag';

/*
  Documentation-only check. For every combination of the Figma properties it renders the React InputTag and the HTML
  builder `inputTagHTML()` and compares the resulting DOM (tag, attributes, class names, children). Both use the same
  CSS, so an identical DOM means an identical look. An explicit `id` is passed to both so the generated ids match.
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

// The builder is plain JavaScript, so its parameter type is inferred from its defaults; type it loosely here.
type HtmlProps = Record<string, unknown>;
const htmlBuilder = inputTagHTML as (props: HtmlProps) => string;
interface Case {
  name: string;
  react: InputTagProps;
  html: HtmlProps;
}

const TAG = INPUT_TAG_DEFAULTS.tagText;
const CONTENT: Array<{ name: string; react: InputTagProps; html: HtmlProps }> = [
  { name: 'empty', react: {}, html: {} },
  { name: 'tag + text', react: { tags: [TAG], defaultValue: 'Au' }, html: { tags: [TAG], value: 'Au' } },
  { name: 'two tags, finished', react: { tags: [TAG, `${TAG} 2`], finished: true }, html: { tags: [TAG, `${TAG} 2`], finished: true } },
  { name: 'four tags, no left icon', react: { tags: [TAG, `${TAG} 2`, `${TAG} 3`, `${TAG} 4`], finished: true, showLeftIcon: false }, html: { tags: [TAG, `${TAG} 2`, `${TAG} 3`, `${TAG} 4`], finished: true, showLeftIcon: false } },
];

function buildCases(): Case[] {
  const cases: Case[] = [];
  const bool = [true, false];
  for (const content of CONTENT) {
    for (const showLabel of bool) {
      for (const info of bool) {
        for (const showLeftIcon of bool) {
          for (const showRightIcon of bool) {
            for (const showDropdown of bool) {
              for (const showFootnote of bool) {
                const shared = { showLabel, info, showLeftIcon, showRightIcon, showDropdown, showFootnote };
                cases.push({
                  name: `${content.name}: label ${showLabel}, info ${info}, left ${showLeftIcon}, right ${showRightIcon}, dropdown ${showDropdown}, footnote ${showFootnote}`,
                  react: { id: 'p', ...content.react, ...shared },
                  html: { id: 'p', ...content.html, ...shared },
                });
              }
            }
          }
        }
      }
    }
  }
  // Every icon in both icon slots.
  for (const icon of INPUT_TAG_ICON_NAMES as InputTagIconName[]) {
    cases.push({
      name: `icons: left ${icon}, right ${icon}`,
      react: { id: 'p', leftIcon: icon, showRightIcon: true, rightIcon: icon },
      html: { id: 'p', leftIcon: icon, showRightIcon: true, rightIcon: icon },
    });
  }
  // Text properties and escaping.
  cases.push({
    name: 'custom texts with special characters',
    react: { id: 'p', label: 'A & <B> "C"', placeholder: 'x & <y> "z"', footnote: 'f & <g> "h"', tags: ['t & <u> "v"'], name: 'email' },
    html: { id: 'p', label: 'A & <B> "C"', placeholder: 'x & <y> "z"', footnote: 'f & <g> "h"', tags: ['t & <u> "v"'], name: 'email' },
  });
  cases.push({ name: 'name attribute', react: { id: 'p', name: 'tags' }, html: { id: 'p', name: 'tags' } });
  cases.push({ name: 'empty placeholder', react: { id: 'p', placeholder: '' }, html: { id: 'p', placeholder: '' } });
  cases.push({ name: 'label hidden, custom label as aria-label', react: { id: 'p', showLabel: false, label: 'Search tags' }, html: { id: 'p', showLabel: false, label: 'Search tags' } });
  return cases;
}

export function InputTagParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<InputTag {...c.react} />)), html: normalize(htmlBuilder(c.html)) }))
      .filter((r) => r.react !== r.html);
    return { total: cases.length, failures };
  }, []);

  const ok = result.failures.length === 0;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status" style={{ fontFamily: 'var(--ds-font-family)' }}>
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
