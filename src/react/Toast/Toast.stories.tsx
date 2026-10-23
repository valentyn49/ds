import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastPlayground, ToastTypes, ToastAnatomy, ToastResponsive, ToastMotionDemo, ToastQueueDemo } from './ToastDocs';
import { TOAST_TYPES } from './toast-manager';

const meta = {
  title: 'Components/Toast/Toast Notifications',
  component: ToastPlayground,
  parameters: { layout: 'padded' },
  args: { type: 'purchase', message: 'You have successfully', showIcon: true, close: true, action: false, timing: 'automatic', duration: 4000 },
  argTypes: {
    type: { control: 'select', options: [...TOAST_TYPES], description: 'Exact Figma state names; purchase is the success appearance.' },
    message: { control: 'text', description: 'Figma content property. Longer messages wrap.' },
    showIcon: { control: 'boolean', description: 'Figma Show icon property.' },
    close: { control: 'boolean', description: 'Figma close property.' },
    action: { control: 'boolean', description: 'Documentation control for Figma button property: supplies an Undo callback.' },
    timing: { control: 'select', options: ['automatic', 'extended', 'persistent', 'custom'], description: 'Documentation-only: automatic is 4 seconds without action, persistent with action; extended is 10 seconds.' },
    duration: { control: { type: 'number', min: 100, max: 60000, step: 100 }, description: 'Documentation-only custom milliseconds, used only for custom timing.' },
  },
} satisfies Meta<typeof ToastPlayground>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Types: Story = { render: () => <ToastTypes />, parameters: { controls: { disable: true } } };
export const Anatomy: Story = { render: () => <ToastAnatomy />, parameters: { controls: { disable: true } } };
export const Responsive: Story = { render: () => <ToastResponsive />, parameters: { controls: { disable: true } } };
export const Animations: Story = { render: () => <ToastMotionDemo />, parameters: { controls: { disable: true } } };
export const Queue: Story = { render: () => <ToastQueueDemo />, parameters: { controls: { disable: true } } };
