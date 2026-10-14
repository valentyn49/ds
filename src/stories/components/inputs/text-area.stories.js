import { createTextArea, TEXT_AREA_STATES, INPUT_ICON_NAMES, TEXT_AREA_DEFAULTS } from '../../../components/text-area/text-area.js';
import { textAreaStateConfig } from '../../../docs/text-area-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Inputs/text-area',
  parameters: { layout: 'padded' },
  args: {
    state: 'default',
    showLabel: true,
    label: TEXT_AREA_DEFAULTS.label,
    info: false,
    placeholder: TEXT_AREA_DEFAULTS.placeholder,
    showLeftIcon: false,
    leftIcon: 'info',
    showRightIcon: false,
    rightIcon: 'info',
    showFootnote: true,
    footnote: TEXT_AREA_DEFAULTS.footnote,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. Focus and filing are real :focus-within behavior and are forced here for preview only. Disabled, valid and error map to the component's \`disabled\` and \`validation\` props. Type in the field to try it; Enter adds a new line.`,
      control: 'select',
      options: TEXT_AREA_STATES,
    },
    showLabel: { name: 'show label', description: figma('show label'), control: 'boolean' },
    label: { name: 'label text', description: figma('label text'), control: 'text', if: { arg: 'showLabel' } },
    info: { name: 'info', description: `${figma('info')}. Shows the info icon after the label.`, control: 'boolean', if: { arg: 'showLabel' } },
    placeholder: { name: 'placeholder text', description: figma('placeholder text'), control: 'text' },
    showLeftIcon: { name: 'show left icon', description: figma('show left icon'), control: 'boolean' },
    leftIcon: {
      name: 'left icon',
      description: `${figma('left icon')}. Subset of the Figma icon library.`,
      control: 'select',
      options: INPUT_ICON_NAMES,
      if: { arg: 'showLeftIcon' },
    },
    showRightIcon: { name: 'show right icon', description: figma('show right icon'), control: 'boolean' },
    rightIcon: {
      name: 'right icon',
      description: `${figma('right icon')}. Subset of the Figma icon library.`,
      control: 'select',
      options: INPUT_ICON_NAMES,
      if: { arg: 'showRightIcon' },
    },
    showFootnote: { name: 'show footnote', description: figma('show footnote'), control: 'boolean' },
    footnote: { name: 'footnote_text', description: figma('footnote_text'), control: 'text', if: { arg: 'showFootnote' } },
  },
  render: ({ state, ...args }) => {
    const { props, forceFocus } = textAreaStateConfig(state, args.placeholder);
    const area = createTextArea({ ...args, ...props });
    if (forceFocus) area.setAttribute('data-preview-state', 'focus');

    const box = document.createElement('div');
    box.className = 'ds-bd-input-box';
    box.append(area);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};
