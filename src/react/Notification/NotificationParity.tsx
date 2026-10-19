import { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { notificationHTML } from '../../components/notification/notification.js';
import { NOTIFICATION_STATES, NOTIFICATION_TYPES } from '../../components/notification/notification.spec.js';
import { Notification } from './Notification';
import type { NotificationProps } from './Notification';

/*
  Documentation-only check. For a matrix of props it renders the React Notification and the HTML builder
  `notificationHTML()` and compares the resulting DOM (tag, attributes, class names, children). Both use the same
  CSS, so an identical DOM means an identical look.
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
  react: NotificationProps;
  html: Parameters<typeof notificationHTML>[0];
}

const TEXTS = [
  ['default text', 'Payment failed. Please check details and try again. If issue persists, contact support. Thanks.'],
  ['short text', 'Saved.'],
  ['special characters', 'A & <B> "C"'],
] as const;

function buildCases(): Case[] {
  const cases: Case[] = [];
  for (const type of NOTIFICATION_TYPES as Array<'home' | 'default'>) {
    for (const state of NOTIFICATION_STATES as Array<NotificationProps['state']>) {
      for (const showIcon of [true, false]) {
        for (const close of [true, false]) {
          for (const showButton of [false, true]) {
            for (const [textName, text] of TEXTS) {
              cases.push({
                name: [type, state, showIcon ? 'icon' : 'no icon', close ? 'close' : 'no close', showButton ? 'button' : 'no button', textName].join(' / '),
                react: { type, state, showIcon, close, buttonText: showButton ? 'Button' : undefined, children: text },
                html: { type, state, showIcon, close, showButton, text },
              });
            }
          }
        }
      }
    }
  }
  // A custom Button label.
  cases.push({
    name: 'custom button label',
    react: { type: 'default', state: 'success', buttonText: 'Undo', children: 'Done.' },
    html: { type: 'default', state: 'success', showButton: true, buttonText: 'Undo', text: 'Done.' },
  });
  return cases;
}

export function NotificationParity() {
  const result = useMemo(() => {
    const cases = buildCases();
    const failures = cases
      .map((c) => ({ c, react: normalize(renderToStaticMarkup(<Notification {...c.react} />)), html: normalize(notificationHTML(c.html)) }))
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
