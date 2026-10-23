import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, FIGMA_ICON_NAMES } from './Icon';
import { IconGallery } from './IconExplorer';

const meta = {
  title: 'Foundations/Icons',
  component: Icon,
  parameters: { layout: 'padded' },
  args: { name: 'icon/search', size: 24 },
  argTypes: {
    name: { control: 'select', options: FIGMA_ICON_NAMES, description: 'Canonical Figma identifier. All exported entries are available, including duplicate-name drawings.' },
    size: { control: 'inline-radio', options: [24], description: '24 × 24 is the only source size in this collection.' },
    color: { control: 'color', description: 'Optional replacement visible paint for verified monochrome icons. Unset preserves original Figma paint and masks.' },
    label: { control: 'text', description: 'Accessible name. Unset icons are decorative unless named with native aria-label or aria-labelledby.' },
    width: { table: { disable: true } },
    height: { table: { disable: true } },
    fill: { table: { disable: true } },
    stroke: { table: { disable: true } },
    viewBox: { table: { disable: true } },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Library: Story = { render: () => <IconGallery />, parameters: { controls: { disable: true } } };
