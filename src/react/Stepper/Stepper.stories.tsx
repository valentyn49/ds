import type { Meta, StoryObj } from '@storybook/react-vite';
import { STEPPER_STATES, STEPPER_DEFAULTS } from '../../components/stepper/stepper.spec.js';
import '../../docs/input-docs.css';
import '../../docs/stepper-docs.css';
import { Stepper } from './Stepper';
import { StepperParity } from './StepperParity';

const figma = (property: string) => `Figma property: \`${property}\``;

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: { layout: 'padded' },
  args: {
    state: 'active',
    number: STEPPER_DEFAULTS.number,
    title: STEPPER_DEFAULTS.title,
    showDescription: true,
    subtitle: STEPPER_DEFAULTS.subtitle,
  },
  argTypes: {
    state: { description: figma('state'), control: 'select', options: [...(STEPPER_STATES as string[])], table: { type: { summary: "'filled' | 'active' | 'next step' | 'disabled'" } } },
    number: { description: `${figma('number')}. Replaced by a check mark in the filled state.`, control: 'text' },
    title: { description: figma('title'), control: 'text' },
    showDescription: { name: 'showDescription', description: figma('short description'), control: 'boolean' },
    subtitle: { description: figma('subtitle'), control: 'text', if: { arg: 'showDescription' } },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-step-box">{children}</div>;
const Surface = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-demo-surface">{children}</div>;

export const Playground: Story = {
  render: (args) => (
    <Surface>
      <Box>
        <Stepper {...args} />
      </Box>
    </Surface>
  ),
};

const STATE_NOTES: Record<string, string> = {
  filled: 'A completed step: white circle, 1.5px primary/600 border and a primary/600 check mark.',
  active: 'The current step: primary/600 circle with a white number, and the title in primary/600.',
  'next step': 'An upcoming step: gray/200 circle with the number in gray/900.',
  disabled: 'An unavailable step: gray/200 circle with the number in gray/500.',
};

/** The four values of the Figma `state` property. It is the only variant property. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states ds-bd-step-states">
      {(STEPPER_STATES as Array<'filled' | 'active' | 'next step' | 'disabled'>).map((state) => (
        <div key={state} className="ds-bd-input-state">
          <code>state={state}</code>
          <div className="ds-bd-tile ds-bd-tile--start">
            <Box>
              <Stepper state={state} />
            </Box>
          </div>
          <span className="ds-bd-note">{STATE_NOTES[state]}</span>
        </div>
      ))}
    </div>
  ),
};

/** Figma `short description` off. The text block is centered on the circle. */
export const WithoutDescription: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states ds-bd-step-states">
      {(STEPPER_STATES as Array<'filled' | 'active' | 'next step' | 'disabled'>).map((state) => (
        <div key={state} className="ds-bd-input-state">
          <code>state={state}, short description off</code>
          <div className="ds-bd-tile ds-bd-tile--start">
            <Box>
              <Stepper state={state} showDescription={false} />
            </Box>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Title and description stay on one line and are cut with an ellipsis when the step is too narrow. */
export const LongTitle: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tile ds-bd-tile--start">
      <div style={{ width: 200 }}>
        <Stepper title="A very long step title that cannot fit in the available width" subtitle="A short description that is also too long for this width" />
      </div>
    </div>
  ),
};

const SEQUENCE_STEPS = ['First step', 'Second step', 'Third step', 'Fourth step'];

/**
 * Figma defines a single step. This arrangement uses it four times: steps before the current one are filled, the current
 * one is active and the rest are next steps. The "current step" control belongs to the documentation.
 */
export const Sequence: StoryObj<{ current: number }> = {
  args: { current: 2 },
  argTypes: {
    current: {
      name: 'current step',
      description: 'Documentation control, not a Figma property. Steps before it are filled, it is active and the rest are next steps.',
      control: { type: 'range', min: 1, max: SEQUENCE_STEPS.length, step: 1 },
    },
  },
  render: ({ current }) => (
    <Surface>
      <div className="ds-bd-step-sequence" role="list">
        {SEQUENCE_STEPS.map((title, index) => {
          const number = index + 1;
          const state = number < current ? 'filled' : number === current ? 'active' : 'next step';
          return (
            <div key={title} className="ds-bd-step-box" role="listitem">
              <Stepper state={state} number={String(number)} title={title} />
            </div>
          );
        })}
      </div>
    </Surface>
  ),
};

/** Checks that the React Stepper and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <StepperParity />,
};
