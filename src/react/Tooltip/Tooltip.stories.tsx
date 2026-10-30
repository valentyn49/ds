import type { Meta, StoryObj } from '@storybook/react-vite';
import { TooltipDemo, TooltipAnatomy, TooltipVariants, TooltipExamples, TOOLTIP_SAMPLE } from './TooltipDocs';
import { TOOLTIP_TYPES } from './position';

const meta = {
  title: 'Components/Tooltips/Tooltip',
  component: TooltipDemo,
  parameters: { layout: 'padded' },
  args: { ...TOOLTIP_SAMPLE, type: 'bottom', showSubtitle: true },
  argTypes: {
    title: { control: 'text', description: 'Figma title: Semibold 14/20, one line with ellipsis.' },
    subtitle: { control: 'text', description: 'Figma subtitle: Regular 12/18, wraps within the source width.' },
    showSubtitle: { control: 'boolean', description: 'Figma show subtitle property.' },
    type: { control: 'select', options: [...TOOLTIP_TYPES], description: 'Exact Figma pointer edge, not conventional popup placement. bottom is above the trigger; top is below; right is left; left is right.' },
  },
} satisfies Meta<typeof TooltipDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Anatomy: Story = { render: () => <TooltipAnatomy />, parameters: { controls: { disable: true } } };
export const Variants: Story = { render: () => <TooltipVariants />, parameters: { controls: { disable: true } } };
export const Examples: Story = { render: () => <TooltipExamples />, parameters: { controls: { disable: true } } };
