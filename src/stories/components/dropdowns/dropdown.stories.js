import { createDropdown, DROPDOWN_STATES, DROPDOWN_DEFAULTS, SAMPLE_OPTIONS } from '../../../components/dropdown/dropdown.js';
import { dropdownStateConfig } from '../../../docs/dropdown-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/dropdown-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Dropdowns/dropdown',
  parameters: { layout: 'padded' },
  args: {
    state: 'default',
    showLabel: true,
    label: DROPDOWN_DEFAULTS.label,
    info: false,
    placeholder: DROPDOWN_DEFAULTS.placeholder,
    showFootnote: true,
    footnote: DROPDOWN_DEFAULTS.footnote,
    showPro: false,
    showCheckbox: false,
    showRightIcon: false,
    showColor: false,
    showSearch: false,
  },
  argTypes: {
    state: {
      description: `${figma('state')} of dropdown-input. Selected is a chosen value, disabled and error map to the component's \`disabled\` and \`validation\` props, and hover is forced for preview only. Open the menu and choose an option to try it. The options (${SAMPLE_OPTIONS.join(', ')}) are sample data, not a design specification.`,
      control: 'select',
      options: DROPDOWN_STATES,
    },
    showLabel: { name: 'title', description: figma('title'), control: 'boolean' },
    label: { name: 'title text', description: figma('title text'), control: 'text', if: { arg: 'showLabel' } },
    info: { name: 'info', description: `${figma('info')}. Shows the info icon after the title.`, control: 'boolean', if: { arg: 'showLabel' } },
    placeholder: { name: 'placeholder text', description: figma('placeholder text'), control: 'text' },
    showFootnote: { name: 'footnote', description: figma('footnote'), control: 'boolean' },
    footnote: { name: 'footnote text', description: figma('footnote text'), control: 'text', if: { arg: 'showFootnote' } },
    showSearch: { name: 'Search', description: `${figma('Search')} on the menu. Adds a search field at the top; typing narrows the list.`, control: 'boolean' },
    showPro: { name: 'Pro', description: `${figma('Pro')} on dropdown item. Applied to every item here.`, control: 'boolean' },
    showCheckbox: { name: 'checkbox', description: `${figma('checkbox')} on dropdown item. Applied to every item here.`, control: 'boolean' },
    showRightIcon: { name: 'Right icons', description: `${figma('Right icons')} on dropdown item. Shows a check mark on the selected item.`, control: 'boolean' },
    showColor: { name: 'Color', description: `${figma('Color')} on dropdown item. Applied to every item here.`, control: 'boolean' },
  },
  render: ({ state, ...args }) => {
    const { props, preview } = dropdownStateConfig(state);
    const dropdown = createDropdown({ ...args, ...props });
    if (preview) dropdown.setAttribute('data-preview-state', preview);

    const box = document.createElement('div');
    box.className = 'ds-bd-dd-box';
    box.append(dropdown);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface ds-bd-dd-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};

// Shows the native interaction: the readout is driven by the component's change event.
export const Behavior = {
  parameters: { controls: { disable: true } },
  render: () => {
    const dropdown = createDropdown({ label: 'Dropdown', footnote: 'Click, or focus the trigger and use the keyboard.' });
    const readout = document.createElement('p');
    readout.className = 'ds-bd-dd-readout';
    readout.innerHTML = 'Selected value: <code>none</code>';
    dropdown.addEventListener('ds-dropdown-change', (event) => {
      readout.innerHTML = `Selected value: <code>${event.detail.value}</code>`;
    });

    const box = document.createElement('div');
    box.className = 'ds-bd-dd-box';
    box.append(dropdown, readout);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface ds-bd-dd-surface';
    surface.append(box);
    return surface;
  },
};
