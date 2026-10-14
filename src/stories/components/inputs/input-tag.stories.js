import { createInputTag, INPUT_TAG_STATES, INPUT_ICON_NAMES, INPUT_TAG_DEFAULTS } from '../../../components/input-tag/input-tag.js';
import { inputTagStateConfig } from '../../../docs/input-tag-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/input-tag-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Inputs/input tag',
  parameters: { layout: 'padded' },
  args: {
    state: 'Default',
    tagText: INPUT_TAG_DEFAULTS.tagText,
    showLabel: true,
    label: INPUT_TAG_DEFAULTS.label,
    info: false,
    placeholder: INPUT_TAG_DEFAULTS.placeholder,
    showLeftIcon: true,
    leftIcon: 'info',
    showRightIcon: false,
    rightIcon: 'info',
    showDropdown: false,
    showFootnote: true,
    footnote: INPUT_TAG_DEFAULTS.footnote,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. Selected and finished add the tags. Focus, filing and selected carets are forced here for preview only; click into the field to use the real caret and type.`,
      control: 'select',
      options: INPUT_TAG_STATES,
    },
    tagText: {
      name: 'tag text',
      description: 'Text of the badge in the selected state. The finished state adds a second badge with " 2" appended, as in Figma.',
      control: 'text',
      if: { arg: 'state', eq: 'selected' },
    },
    showLabel: { name: 'show label', description: figma('show label'), control: 'boolean' },
    label: { name: 'label text', description: figma('label text'), control: 'text', if: { arg: 'showLabel' } },
    info: { name: 'info', description: `${figma('info')}. Shows the info icon after the label.`, control: 'boolean', if: { arg: 'showLabel' } },
    placeholder: { name: 'placeholder text', description: figma('placeholder text'), control: 'text' },
    showLeftIcon: { name: 'show left icon', description: `${figma('show left icon')}. On by default in this component.`, control: 'boolean' },
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
    showDropdown: { name: 'dropdown', description: `${figma('dropdown')}. Shows a chevron at the end of the field.`, control: 'boolean' },
    showFootnote: { name: 'show footnote', description: figma('show footnote'), control: 'boolean' },
    footnote: { name: 'footnote_text', description: figma('footnote_text'), control: 'text', if: { arg: 'showFootnote' } },
  },
  render: ({ state, tagText, ...args }) => {
    const { props, preview } = inputTagStateConfig(state, tagText, args.placeholder);
    const inputTag = createInputTag({ ...args, ...props });
    if (preview) inputTag.setAttribute('data-preview-state', preview);

    const box = document.createElement('div');
    box.className = 'ds-bd-input-box';
    box.append(inputTag);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};
