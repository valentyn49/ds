import { createStepper, STEPPER_STATES, STEPPER_DEFAULTS } from '../../../components/stepper/stepper.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/stepper-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Stepper/stepper',
  parameters: { layout: 'padded' },
  args: {
    state: 'active',
    number: STEPPER_DEFAULTS.number,
    title: STEPPER_DEFAULTS.title,
    showDescription: true,
    subtitle: STEPPER_DEFAULTS.subtitle,
  },
  argTypes: {
    state: { description: figma('state'), control: 'select', options: STEPPER_STATES },
    number: { name: 'number', description: `${figma('number')}. Replaced by a check mark in the filled state.`, control: 'text' },
    title: { name: 'title', description: figma('title'), control: 'text' },
    showDescription: { name: 'short description', description: figma('short description'), control: 'boolean' },
    subtitle: { name: 'subtitle', description: figma('subtitle'), control: 'text', if: { arg: 'showDescription' } },
  },
  render: (args) => {
    const box = document.createElement('div');
    box.className = 'ds-bd-step-box';
    box.append(createStepper(args));
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};

// Figma defines a single step. This arrangement uses it four times to show the states in sequence:
// steps before the current one are filled, the current one is active and the rest are next steps.
const SEQUENCE_STEPS = ['First step', 'Second step', 'Third step', 'Fourth step'];

export const Sequence = {
  args: { current: 2 },
  argTypes: {
    state: { table: { disable: true } },
    number: { table: { disable: true } },
    title: { table: { disable: true } },
    showDescription: { table: { disable: true } },
    subtitle: { table: { disable: true } },
    current: {
      name: 'current step',
      description: 'Documentation control, not a Figma property. Steps before it are filled, it is active and the rest are next steps.',
      control: { type: 'range', min: 1, max: SEQUENCE_STEPS.length, step: 1 },
    },
  },
  render: ({ current }) => {
    const list = document.createElement('div');
    list.className = 'ds-bd-step-sequence';
    list.setAttribute('role', 'list');
    SEQUENCE_STEPS.forEach((title, index) => {
      const number = index + 1;
      const state = number < current ? 'filled' : number === current ? 'active' : 'next step';
      const item = document.createElement('div');
      item.className = 'ds-bd-step-box';
      item.setAttribute('role', 'listitem');
      item.append(createStepper({ state, number: String(number), title }));
      list.append(item);
    });
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(list);
    return surface;
  },
};
