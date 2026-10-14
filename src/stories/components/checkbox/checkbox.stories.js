import { createCheckbox, CHECKBOX_STATES, CHECKBOX_DEFAULTS, STATE_PROPS } from '../../../components/checkbox/checkbox.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/checkbox-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Checkbox/checkbox',
  parameters: { layout: 'padded' },
  args: {
    state: 'default',
    title: CHECKBOX_DEFAULTS.title,
    showCaption: true,
    subtitle: CHECKBOX_DEFAULTS.subtitle,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. \`selected\` is a checked box and \`disabled\` is drawn as a checked box in Figma. Hover is forced for preview only. Click the box or the label to toggle it for real.`,
      control: 'inline-radio',
      options: CHECKBOX_STATES,
    },
    title: { name: 'title', description: figma('title'), control: 'text' },
    showCaption: { name: 'Show Caption', description: figma('Show Caption'), control: 'boolean' },
    subtitle: { name: 'subtitle', description: figma('subtitle'), control: 'text', if: { arg: 'showCaption' } },
  },
  render: ({ state, ...args }) => {
    const checkbox = createCheckbox({ ...args, ...STATE_PROPS[state] });
    if (state === 'hover') checkbox.setAttribute('data-preview-state', 'hover');

    const box = document.createElement('div');
    box.className = 'ds-bd-cb-box';
    box.append(checkbox);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};

// Shows the native behavior: the readout is driven by the real input's `checked` value.
export const Behavior = {
  parameters: { controls: { disable: true } },
  render: () => {
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-demo-surface';
    const stack = document.createElement('div');
    stack.className = 'ds-bd-behavior';

    const item = (props) => {
      const box = document.createElement('div');
      box.className = 'ds-bd-cb-box';
      const checkbox = createCheckbox(props);
      box.append(checkbox);
      return { box, input: checkbox.querySelector('input') };
    };

    const live = item({ title: 'Click the box or the label', showCaption: true, subtitle: 'Or press Tab to focus it, then Space.' });
    const off = item({ title: 'Disabled', showCaption: false, checked: true, disabled: true });

    const status = document.createElement('p');
    status.className = 'ds-bd-behavior__status';
    const update = () => {
      status.innerHTML = `Input <code>checked</code>: <code>${live.input.checked}</code>`;
    };
    live.input.addEventListener('change', update);
    update();

    stack.append(live.box, off.box, status);
    wrap.append(stack);
    return wrap;
  },
};
