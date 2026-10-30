import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'storybook/preview-api';
import ReactMeta from '../../../react/Tooltip/Tooltip.stories';
import { TooltipDemo, TooltipAnatomy, TooltipVariants, TooltipExamples } from '../../../react/Tooltip/TooltipDocs';

function mount(Component, args) {
  const host = document.createElement('div');
  useEffect(() => {
    const root = createRoot(host);
    root.render(createElement(Component, args));
    return () => root.unmount();
  }, [host]);
  return host;
}
export default {
  title: 'Components/Tooltips/tooltip',
  parameters: { layout: 'padded' },
  args: ReactMeta.args,
  argTypes: ReactMeta.argTypes,
  render: args => mount(TooltipDemo, args),
};
export const Playground = {};
export const Anatomy = { render: () => mount(TooltipAnatomy), parameters: { controls: { disable: true } } };
export const Variants = { render: () => mount(TooltipVariants), parameters: { controls: { disable: true } } };
export const Examples = { render: () => mount(TooltipExamples), parameters: { controls: { disable: true } } };
