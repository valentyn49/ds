import type { Meta, StoryObj } from '@storybook/react-vite';
import { Highcharts } from './Highcharts';
import { ChartAnatomy, ChartExamples, ChartVariants } from './HighchartsDocs';
import { MOCK_ALTERNATE, MOCK_AREA, MOCK_OHLC, MOCK_STUDIES, mockTooltip } from './mock-data';

type DemoProps = {
  variant: 'default' | 'price sparkline' | 'homepage';
  size: 'auto' | 'desktop' | 'tablet' | 'mobile';
  dataset: 'Materials (mock)' | 'Alternative (mock)';
  tooltip: boolean;
  studies: boolean;
  title: string;
};
export function PlaygroundChart({ variant, size, dataset, tooltip, studies, title }: DemoProps) {
  const alternate = dataset === 'Alternative (mock)';
  return <Highcharts title={title} description="Synthetic weekly prices and precomputed study fixtures. This is documentation data, not investment information." size={size}
    formatTooltip={tooltip ? mockTooltip : undefined}
    {...(variant === 'default' ? { variant, data: alternate ? MOCK_OHLC.map(p => [p[0], ...p.slice(1).map(v => v * 0.84)] as [number, number, number, number, number]) : MOCK_OHLC, studies: studies ? MOCK_STUDIES : [] }
      : { variant, data: alternate ? MOCK_ALTERNATE : MOCK_AREA })} />;
}
const meta = {
  title: 'Components/Highchart/Highcharts',
  includeStories: ['Playground', 'Variants', 'Anatomy', 'Examples'],
  component: PlaygroundChart,
  parameters: { layout: 'padded' },
  args: { variant: 'default', size: 'auto', dataset: 'Materials (mock)', tooltip: true, studies: true, title: 'S&P 500 Materials Sector' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'price sparkline', 'homepage'], description: 'Exact Figma type values. No additional chart types.' },
    size: { control: 'select', options: ['auto', 'desktop', 'tablet', 'mobile'], description: 'Verified layouts. Auto follows the container width.' },
    dataset: { control: 'select', options: ['Materials (mock)', 'Alternative (mock)'], description: 'Documentation-only fixture selection; production receives data.' },
    tooltip: { control: 'boolean', description: 'Documentation-only choice to supply a mock financial formatter.' },
    studies: { control: 'boolean', description: 'Documentation-only choice to supply precomputed studies to the default chart.' },
    title: { control: 'text' },
  },
} satisfies Meta<DemoProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = { render: () => <ChartVariants />, parameters: { controls: { disable: true } } };
export const Anatomy: Story = { render: () => <ChartAnatomy />, parameters: { controls: { disable: true } } };
export const Examples: Story = { render: () => <ChartExamples />, parameters: { controls: { disable: true } } };
