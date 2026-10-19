import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { accordionHTML } from '../../components/accordion/accordion.js';
import { Accordion } from './Accordion';
import type { AccordionProps } from './Accordion';

/*
  Documentation-only check. For a matrix of props it renders the React Accordion and the HTML builder
  `accordionHTML()` and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so
  an identical DOM means an identical look. Generated ids differ by design, so ids are compared by position, not by
  value. An empty `class=""` (the HTML icon builder writes one) is treated as no class.
*/

const ID_ATTRS = new Set(['id', 'aria-labelledby', 'aria-controls']);

const normalize = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  const ids = new Map<string, string>();
  const mapId = (value: string) => {
    const [, base, suffix = ''] = /^(.*?)(-toggle|-panel|-title)?$/.exec(value) ?? [];
    if (!ids.has(base)) ids.set(base, `ID${ids.size + 1}`);
    return ids.get(base) + suffix;
  };
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

interface Case {
  name: string;
  react: AccordionProps;
  html: Record<string, unknown>;
}

// The JS builder's destructured parameter does not list `id` in its inferred type.
const buildHtml = accordionHTML as (props: Record<string, unknown>) => string;

const TITLES = [
  ['default title', undefined],
  ['special characters', 'A & <B> "C"'],
] as const;
const CONTENTS = [
  ['default content', 'Sample content for demonstration only. It is not part of the component specification.'],
  ['special content', 'Text & <b>markup</b> "quoted"'],
] as const;
const SUBTITLES: Array<[string, string | undefined]> = [
  ['no subtitle', undefined],
  ['subtitle', 'Subtitle'],
  ['special subtitle', 'Sub & <title>'],
];

function buildCases(): Case[] {
  const cases: Case[] = [];
  for (const [titleName, title] of TITLES) {
    for (const [contentName, content] of CONTENTS) {
      for (const [subName, subtitle] of SUBTITLES) {
        for (const open of [false, true]) {
          for (const leftIcon of [false, true]) {
            for (const link of [false, true]) {
              for (const button of [false, true]) {
                for (const withId of [false, true]) {
                  const id = withId ? 'acc-test' : undefined;
                  cases.push({
                    name: [titleName, contentName, subName, open ? 'open' : 'closed', leftIcon ? 'left icon' : '-', link ? 'link' : '-', button ? 'button' : '-', withId ? 'id' : 'generated id'].join(' / '),
                    react: {
                      id,
                      title,
                      subtitle,
                      leftIcon,
                      link: link ? 'Link' : undefined,
                      button: button ? 'Button' : undefined,
                      defaultOpen: open,
                      children: content,
                    },
                    html: {
                      id,
                      title,
                      content,
                      open,
                      showSubtitle: subtitle !== undefined,
                      subtitle,
                      showLeftIcon: leftIcon,
                      showLink: link,
                      showButton: button,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  return cases;
}

export function AccordionParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<Accordion {...c.react} />)), html: normalize(buildHtml(c.html)) }))
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
