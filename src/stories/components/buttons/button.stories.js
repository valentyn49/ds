import { createButton, BUTTON_VARIANTS, BUTTON_SIZES } from '../../../components/button/button.js';
import { BUTTON_STATES } from '../../../components/button/button.spec.js';
import { ICON_NAMES } from '../../../components/icons/icon-paths.js';
import { forceStateEl, isDarkSurface } from '../../../docs/preview-state.js';
import '../../../docs/button-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Buttons/Button',
  parameters: { layout: 'padded' },
  args: {
    variant: 'primary',
    size: '48',
    state: 'default',
    text: 'Button',
    showText: true,
    showLeftIcon: false,
    leftIcon: 'search',
    showRightIcon: false,
    rightIcon: 'search',
  },
  argTypes: {
    variant: {
      name: 'type',
      description: `${figma('type')}. Visual style of the button.`,
      control: 'select',
      options: BUTTON_VARIANTS,
    },
    size: {
      description: `${figma('size')}. \`menu\` and \`Stroke\` only exist at size 36, so they ignore 48.`,
      control: 'inline-radio',
      options: BUTTON_SIZES,
    },
    state: {
      description: `${figma('state')}. Disabled sets the native \`disabled\` attribute. Hover and focus are forced for preview only; in the product they come from the browser.`,
      control: 'inline-radio',
      options: BUTTON_STATES,
    },
    text: { name: 'Text', description: figma('Text'), control: 'text', if: { arg: 'showText' } },
    showText: { name: 'show text', description: `${figma('show text')}. Turn off for an icon-only button.`, control: 'boolean' },
    showLeftIcon: { name: 'Show left icon', description: figma('Show left icon'), control: 'boolean' },
    leftIcon: {
      name: 'left icon',
      description: `${figma('left icon')}. Subset of the Figma icon library.`,
      control: 'select',
      options: ICON_NAMES,
      if: { arg: 'showLeftIcon' },
    },
    showRightIcon: { name: 'Show right icon', description: figma('Show right icon'), control: 'boolean' },
    rightIcon: {
      name: 'right icon',
      description: `${figma('right icon')}. Subset of the Figma icon library.`,
      control: 'select',
      options: ICON_NAMES,
      if: { arg: 'showRightIcon' },
    },
  },
  render: ({ state, ...args }) => {
    const surface = document.createElement('div');
    surface.className = `ds-bd-demo-surface${isDarkSurface(args.variant) ? ' ds-bd-demo-surface--dark' : ''}`;
    surface.append(forceStateEl(createButton({ ...args, disabled: state === 'disabled' }), state));
    return surface;
  },
};

export const Playground = {};
