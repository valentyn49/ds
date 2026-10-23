import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'storybook/preview-api';
import ReactMeta, { PlaygroundChart } from '../../../react/Highcharts/Highcharts.stories';
import { ChartAnatomy, ChartExamples, ChartVariants } from '../../../react/Highcharts/HighchartsDocs';

// The established HTML documentation mounts the same production React chart.
// Storybook cleans up each root before removing/replacing its preview.
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
  title: 'Components/Highchart/Chart',
  parameters: { layout: 'padded' },
  args: ReactMeta.args,
  argTypes: ReactMeta.argTypes,
  render: args => mount(PlaygroundChart, args),
};
export const Playground = {};
export const Anatomy = { render: () => mount(ChartAnatomy), parameters: { controls: { disable: true } } };
export const Variants = { render: () => mount(ChartVariants), parameters: { controls: { disable: true } } };
export const Examples = { render: () => mount(ChartExamples), parameters: { controls: { disable: true } } };
