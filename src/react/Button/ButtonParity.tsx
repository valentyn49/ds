import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buttonHTML } from '../../components/button/button.js';
import { BUTTON_TYPES } from '../../components/button/button.spec.js';
import { Button, BUTTON_VARIANTS } from './Button';
import type { ButtonProps } from './Button';

/*
  Documentation-only check. For every variant, size and option it renders the React Button and the HTML builder
  `buttonHTML()` and compares the resulting DOM (tag, attributes, class names, children). Both use the same CSS, so
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
      .map((a) => (a.name === 'class' ? `class="${a.value.split(/\s+/).sort().join(' ')}"` : `${a.name}="${a.value}"`))
      .sort()
      .join(' ');
    return `<${tag} ${attrs}>${[...el.childNodes].map(walk).join('')}</${tag}>`;
  };
  return [...template.content.childNodes].map(walk).join('');
};

interface Case {
  name: string;
  react: ButtonProps;
  html: Parameters<typeof buttonHTML>[0];
}

function buildCases(): Case[] {
  const cases: Case[] = [];
  for (const { type, sizes } of BUTTON_TYPES as Array<{ type: string; sizes: string[] }>) {
    for (const size of sizes) {
      const base = { variant: type as ButtonProps['variant'], size: Number(size) as 48 | 36 };
      const htmlBase = { variant: type, size };
      const label = `${type} / ${size}`;
      cases.push({ name: `${label}: label`, react: { ...base, children: 'Button' }, html: { ...htmlBase, text: 'Button' } });
      cases.push({ name: `${label}: disabled`, react: { ...base, children: 'Button', disabled: true }, html: { ...htmlBase, text: 'Button', disabled: true } });
      cases.push({ name: `${label}: left icon`, react: { ...base, children: 'Button', leftIcon: 'search' }, html: { ...htmlBase, text: 'Button', showLeftIcon: true, leftIcon: 'search' } });
      cases.push({ name: `${label}: right icon`, react: { ...base, children: 'Button', rightIcon: 'chevron' }, html: { ...htmlBase, text: 'Button', showRightIcon: true, rightIcon: 'chevron' } });
      cases.push({
        name: `${label}: both icons`,
        react: { ...base, children: 'Button', leftIcon: 'search', rightIcon: 'chevron' },
        html: { ...htmlBase, text: 'Button', showLeftIcon: true, leftIcon: 'search', showRightIcon: true, rightIcon: 'chevron' },
      });
      cases.push({
        name: `${label}: icon only`,
        react: { ...base, 'aria-label': 'Search', leftIcon: 'search' },
        html: { ...htmlBase, text: 'Search', showText: false, showLeftIcon: true, leftIcon: 'search' },
      });
      cases.push({
        name: `${label}: icon only, disabled`,
        react: { ...base, 'aria-label': 'Search', leftIcon: 'search', disabled: true },
        html: { ...htmlBase, text: 'Search', showText: false, showLeftIcon: true, leftIcon: 'search', disabled: true },
      });
    }
  }
  // Fallbacks shared by both builders: a size the variant does not have, and an unknown variant.
  cases.push({ name: 'Stroke asked at 48 falls back to 36', react: { variant: 'Stroke', size: 48, children: 'Button' }, html: { variant: 'Stroke', size: '48', text: 'Button' } });
  cases.push({ name: 'menu asked at 48 falls back to 36', react: { variant: 'menu', size: 48, children: 'Button' }, html: { variant: 'menu', size: '48', text: 'Button' } });
  cases.push({
    name: 'unknown variant falls back to primary',
    react: { variant: 'nope' as ButtonProps['variant'], children: 'Button' },
    html: { variant: 'nope', text: 'Button' },
  });
  // Text is escaped in both.
  cases.push({ name: 'special characters', react: { children: 'A & <B> "C"' }, html: { text: 'A & <B> "C"' } });
  return cases;
}

export function ButtonParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<Button {...c.react} />)), html: normalize(buttonHTML(c.html)) }))
      .filter((r) => r.react !== r.html);
    const sameVariants = JSON.stringify([...BUTTON_VARIANTS]) === JSON.stringify((BUTTON_TYPES as Array<{ type: string }>).map((t) => t.type));
    return { total: cases.length, failures, sameVariants };
  }, []);

  const ok = result.failures.length === 0 && result.sameVariants;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack" role="status">
      <strong>{ok ? 'Identical' : 'Differences found'}</strong>
      <span>
        {result.total - result.failures.length} of {result.total} combinations render the same DOM in React and in the HTML builder.
      </span>
      <span>
        Variant list in TypeScript matches <code>button.spec.js</code>: {result.sameVariants ? 'yes' : 'NO'}
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
