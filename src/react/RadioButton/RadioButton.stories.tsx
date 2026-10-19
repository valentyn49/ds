import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RADIO_STATES, RADIO_DEFAULTS, RADIO_STATE_PROPS } from '../../components/radiobutton/radiobutton.spec.js';
import { RadioButton } from './RadioButton';
import type { RadioButtonProps } from './RadioButton';
import { RadioButtonParity } from './RadioButtonParity';
import '../../docs/input-docs.css';
import '../../docs/radiobutton-docs.css';

const figma = (property: string) => `Figma property: \`${property}\``;

type State = 'default' | 'hover' | 'selected' | 'disabled';
const STATES = RADIO_STATES as State[];
const STATE_NOTES: Record<State, string> = {
  default: 'Unselected circle in gray/600.',
  hover: 'Unselected circle darkens to gray/900.',
  selected: 'Circle with a dot, both in primary/600.',
  disabled: 'Unselected circle in gray/200 and the title in gray/500.',
};

/** Props of one radio for a Figma `state`. Hover is the browser's `:hover`; here it is forced for display only. */
const stateProps = (state: State): Pick<RadioButtonProps, 'defaultChecked' | 'disabled' | 'labelProps'> => {
  const mapped = (RADIO_STATE_PROPS as Record<State, { checked: boolean; disabled?: boolean }>)[state];
  return {
    defaultChecked: mapped.checked,
    disabled: mapped.disabled ?? false,
    labelProps: state === 'hover' ? ({ 'data-preview-state': 'hover' } as RadioButtonProps['labelProps']) : undefined,
  };
};

const meta = {
  title: 'Components/RadioButton',
  component: RadioButton,
  parameters: { layout: 'padded' },
  args: { title: RADIO_DEFAULTS.title, showCaption: true, subtitle: RADIO_DEFAULTS.subtitle, badge: false, badgeText: RADIO_DEFAULTS.badgeText, disabled: false },
  argTypes: {
    title: { description: `${figma('title')}. Always shown.`, control: 'text' },
    showCaption: { name: 'showCaption', description: figma('Show Caption'), control: 'boolean' },
    subtitle: { description: figma('subtitle'), control: 'text', if: { arg: 'showCaption' } },
    badge: { description: figma('badge'), control: 'boolean' },
    badgeText: { description: 'Text of the badge.', control: 'text', if: { arg: 'badge' } },
    disabled: { description: `${figma('state')} = disabled. Native attribute; Figma draws it as an unselected radio.`, control: 'boolean' },
    defaultChecked: { description: `${figma('state')} = selected, uncontrolled. Use \`checked\` + \`onChange\` for a controlled radio.`, control: 'boolean' },
    name: { description: 'Native `name`. Radios that share it form one group.', control: 'text' },
    value: { description: 'Native `value`.', control: 'text' },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One radio button with every Figma property. `defaultChecked` is uncontrolled, so the story remounts when it changes. */
export const Playground: Story = {
  render: ({ defaultChecked, ...args }) => <RadioButton key={String(defaultChecked)} defaultChecked={defaultChecked} {...args} />,
};

const SAMPLE_COUNT = 3;

interface GroupArgs {
  state: State;
  title: string;
  showCaption: boolean;
  subtitle: string;
  badge: boolean;
}

/** Figma defines a single radio button. Three share a `name`, so selecting one deselects the others. */
export const Group: StoryObj<GroupArgs> = {
  args: { state: 'default', title: 'Option', showCaption: true, subtitle: RADIO_DEFAULTS.subtitle, badge: false },
  argTypes: {
    state: {
      description: `${figma('state')}. Applied to the three sample radios: \`selected\` checks the second one, \`disabled\` disables all three, and hover is forced for preview only. Click an option to select it for real.`,
      control: 'inline-radio',
      options: [...STATES],
    },
    title: { description: `${figma('title')}. The three sample radios add 1, 2 and 3 to this text.`, control: 'text' },
    showCaption: { name: 'showCaption', description: figma('Show Caption'), control: 'boolean' },
    subtitle: { description: figma('subtitle'), control: 'text', if: { arg: 'showCaption' } },
    badge: { description: figma('badge'), control: 'boolean' },
  },
  parameters: { controls: { include: ['state', 'title', 'showCaption', 'subtitle', 'badge'] } },
  render: ({ state, title, showCaption, subtitle, badge }) => {
    const mapped = stateProps(state);
    return (
      <div className="ds-bd-demo-surface">
        {/* key: remounts on a state change, because defaultChecked only sets the initial value */}
        <div key={state} className="ds-bd-rb-group" role="radiogroup" aria-label="Sample group">
          {Array.from({ length: SAMPLE_COUNT }, (_, i) => (
            <RadioButton
              key={i}
              name="live-demo"
              value={`option-${i + 1}`}
              title={`${title} ${i + 1}`}
              showCaption={showCaption}
              subtitle={subtitle}
              badge={badge}
              defaultChecked={state === 'selected' && i === 1}
              disabled={mapped.disabled}
              labelProps={mapped.labelProps}
            />
          ))}
        </div>
      </div>
    );
  },
};

/** The four values of the Figma `state` property. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states ds-bd-rb-states">
      {STATES.map((state) => (
        <div key={state} className="ds-bd-input-state">
          <code>state={state}</code>
          <div className="ds-bd-tile ds-bd-tile--start">
            <RadioButton {...stateProps(state)} name={`state-${state}`} />
          </div>
          <span className="ds-bd-note">{STATE_NOTES[state]}</span>
        </div>
      ))}
    </div>
  ),
};

/** Every state combined with the caption and the badge options. */
export const StatesWithOptions: Story = {
  name: 'States with caption and badge',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states ds-bd-rb-states">
      {STATES.flatMap((state) =>
        [
          { label: 'caption on', props: {} },
          { label: 'caption off', props: { showCaption: false } },
          { label: 'badge on', props: { badge: true } },
        ].map(({ label, props }) => (
          <div key={`${state}-${label}`} className="ds-bd-input-state">
            <code>
              state={state}, {label}
            </code>
            <div className="ds-bd-tile ds-bd-tile--start">
              <RadioButton {...stateProps(state)} {...props} name={`opt-${state}-${label}`} />
            </div>
          </div>
        )),
      )}
    </div>
  ),
};

/** Show Caption on, Show Caption off and badge on, as in the HTML overview. */
export const Configurations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-overview ds-bd-overview--radio">
      {[
        { name: 'Show Caption on (default)', props: {} },
        { name: 'Show Caption off', props: { showCaption: false } },
        { name: 'badge on', props: { badge: true } },
      ].map(({ name, props }) => (
        <div key={name} className="ds-bd-overview__item">
          <div className="ds-bd-tile ds-bd-tile--start">
            <RadioButton {...props} name="config" />
          </div>
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};

function BehaviorDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div className="ds-bd-demo-surface">
      <div>
        <div className="ds-bd-rb-group" role="radiogroup" aria-label="Behavior demo">
          <RadioButton name="behavior-demo" value="option-1" title="First option" subtitle="Click the circle or the label." checked={value === 'option-1'} onChange={(e) => setValue(e.target.value)} />
          <RadioButton name="behavior-demo" value="option-2" title="Second option" subtitle="Or press Tab, then the arrow keys." checked={value === 'option-2'} onChange={(e) => setValue(e.target.value)} />
          <RadioButton name="behavior-demo" value="option-3" title="Disabled option" showCaption={false} disabled checked={value === 'option-3'} onChange={(e) => setValue(e.target.value)} />
        </div>
        <p className="ds-bd-rb-readout">
          Checked value: <code>{value || 'none'}</code>
        </p>
      </div>
    </div>
  );
}

/** A controlled group: React state holds the selected value and the readout follows it. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BehaviorDemo />,
};

/** Checks that the React RadioButton and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <RadioButtonParity />,
};
