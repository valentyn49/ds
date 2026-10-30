import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Icon, FIGMA_ICON_NAMES } from '../../react/Icon/Icon';

// The HTML Storybook's foundation page demonstrates the same React component exported by the library.
export default {
  title: 'Foundations/Icons',
  parameters: { layout: 'padded' },
  args: { name: 'icon/search', size: 24, label: '', color: undefined },
  argTypes: {
    name: { control: 'select', options: FIGMA_ICON_NAMES },
    size: { control: 'inline-radio', options: [24], description: 'Only 24 × 24 is defined in this Figma node.' },
    label: { control: 'text', description: 'Accessible name. Empty leaves the icon decorative.' },
    color: { control: 'color', description: 'Unset preserves original Figma paint. Explicit color customizes only the verified visible monochrome paint.' },
  },
  render: ({ name, size, label, color }) => {
    const host = document.createElement('div');
    const root = createRoot(host);
    flushSync(() => root.render(createElement(Icon, { name, size, label: label || undefined, color })));
    return host;
  },
};
export const Playground = {};
