import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'storybook/preview-api';
import ReactMeta from '../../../react/Toast/Toast.stories';
import { ToastPlayground, ToastTypes, ToastAnatomy, ToastResponsive, ToastMotionDemo, ToastQueueDemo } from '../../../react/Toast/ToastDocs';

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
  title: 'Components/Toast/message',
  parameters: { layout: 'padded' },
  args: ReactMeta.args,
  argTypes: ReactMeta.argTypes,
  render: args => mount(ToastPlayground, args),
};
export const Playground = {};
export const Types = { render: () => mount(ToastTypes), parameters: { controls: { disable: true } } };
export const Anatomy = { render: () => mount(ToastAnatomy), parameters: { controls: { disable: true } } };
export const Responsive = { render: () => mount(ToastResponsive), parameters: { controls: { disable: true } } };
export const Animations = { render: () => mount(ToastMotionDemo), parameters: { controls: { disable: true } } };
export const Queue = { render: () => mount(ToastQueueDemo), parameters: { controls: { disable: true } } };
