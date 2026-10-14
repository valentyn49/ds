import { createRadiobutton, RADIO_STATES, RADIO_DEFAULTS } from '../../../components/radiobutton/radiobutton.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/radiobutton-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

// Neutral sample group used to show mutually exclusive selection. Figma has no radio group component.
const SAMPLE_COUNT = 3;

function buildGroup({ name, title, showCaption, subtitle, badge, state, hover }) {
  const group = document.createElement('div');
  group.className = 'ds-bd-rb-group';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', 'Sample group');
  for (let i = 1; i <= SAMPLE_COUNT; i += 1) {
    const radio = createRadiobutton({
      name,
      value: `option-${i}`,
      title: `${title} ${i}`,
      showCaption,
      subtitle,
      badge,
      checked: state === 'selected' && i === 2,
      disabled: state === 'disabled',
    });
    if (hover) radio.setAttribute('data-preview-state', 'hover');
    group.append(radio);
  }
  return group;
}

export default {
  title: 'Components/Radiobutton/radiobutton',
  parameters: { layout: 'padded' },
  args: {
    state: 'default',
    title: 'Option',
    showCaption: true,
    subtitle: RADIO_DEFAULTS.subtitle,
    badge: false,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. Applied to the three sample radios: \`selected\` checks the second one, \`disabled\` disables all three, and hover is forced for preview only. Click an option to select it for real.`,
      control: 'inline-radio',
      options: RADIO_STATES,
    },
    title: { name: 'title', description: `${figma('title')}. The three sample radios add 1, 2 and 3 to this text.`, control: 'text' },
    showCaption: { name: 'Show Caption', description: figma('Show Caption'), control: 'boolean' },
    subtitle: { name: 'subtitle', description: figma('subtitle'), control: 'text', if: { arg: 'showCaption' } },
    badge: { name: 'badge', description: figma('badge'), control: 'boolean' },
  },
  render: ({ state, ...args }) => {
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(buildGroup({ ...args, name: 'live-demo', state, hover: state === 'hover' }));
    return surface;
  },
};

export const Playground = {};

// Shows the native behavior: the readout is driven by the group's real `checked` input.
export const Behavior = {
  parameters: { controls: { disable: true } },
  render: () => {
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    const wrap = document.createElement('div');

    const group = document.createElement('div');
    group.className = 'ds-bd-rb-group';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Behavior demo');
    [
      { title: 'First option', subtitle: 'Click the circle or the label.' },
      { title: 'Second option', subtitle: 'Or press Tab, then the arrow keys.' },
      { title: 'Disabled option', showCaption: false, disabled: true },
    ].forEach((props, i) => group.append(createRadiobutton({ name: 'behavior-demo', value: `option-${i + 1}`, ...props })));

    const readout = document.createElement('p');
    readout.className = 'ds-bd-rb-readout';
    const update = () => {
      const checked = group.querySelector('input:checked');
      readout.innerHTML = `Checked value: <code>${checked ? checked.value : 'none'}</code>`;
    };
    group.addEventListener('change', update);
    update();

    wrap.append(group, readout);
    surface.append(wrap);
    return surface;
  },
};
