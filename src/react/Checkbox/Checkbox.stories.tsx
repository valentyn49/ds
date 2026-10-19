import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CHECKBOX_DEFAULTS, CHECKBOX_STATES, STATE_PROPS } from '../../components/checkbox/checkbox.spec.js';
import '../../docs/input-docs.css';
import '../../docs/checkbox-docs.css';
import { Checkbox } from './Checkbox';
import { CheckboxParity } from './CheckboxParity';

const figma = (property: string) => `Figma property: \`${property}\``;

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
  args: {
    title: CHECKBOX_DEFAULTS.title,
    showCaption: true,
    subtitle: CHECKBOX_DEFAULTS.subtitle,
    checked: false,
    disabled: false,
  },
  argTypes: {
    title: { description: figma('title'), control: 'text' },
    showCaption: { name: 'showCaption', description: figma('Show Caption'), control: 'boolean' },
    subtitle: { description: figma('subtitle'), control: 'text', if: { arg: 'showCaption' } },
    checked: { description: `Figma \`state=selected\`. Click the box or the label to toggle it for real.`, control: 'boolean' },
    disabled: { description: 'Figma `state=disabled`, drawn as a checked box in Figma. Hover is the browser\'s `:hover`.', control: 'boolean' },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-cb-box">{children}</div>;

/** The Controls change the checkbox; clicking it toggles it for real and the Controls follow. */
export const Playground: Story = {
  render: ({ checked: checkedArg, ...args }) => {
    const [checked, setChecked] = useState(Boolean(checkedArg));
    useEffect(() => setChecked(Boolean(checkedArg)), [checkedArg]);
    return (
      <Box>
        <Checkbox {...args} checked={checked} onChange={(event) => { setChecked(event.target.checked); args.onChange?.(event); }} />
      </Box>
    );
  },
};

const STATE_NOTES: Record<string, string> = {
  default: 'Unchecked box in gray/600.',
  hover: 'Unchecked box darkens to gray/900 (forced here with a documentation-only attribute; in a page it is :hover).',
  selected: 'Checked box in primary/600.',
  disabled: 'Checked box and both texts in gray/400.',
};

/** The four values of the Figma `state` property. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states ds-bd-cb-states">
      {(CHECKBOX_STATES as string[]).map((state) => {
        const props = (STATE_PROPS as Record<string, { checked: boolean; disabled?: boolean }>)[state];
        return (
          <div key={state} className="ds-bd-input-state">
            <code>state={state}</code>
            <div className="ds-bd-tile ds-bd-tile--start">
              <Box>
                <Checkbox defaultChecked={props.checked} disabled={props.disabled} rootProps={state === 'hover' ? { 'data-preview-state': 'hover' } : undefined} />
              </Box>
            </div>
            <span className="ds-bd-note">{STATE_NOTES[state]}</span>
          </div>
        );
      })}
    </div>
  ),
};

/** Figma `Show Caption` off. */
export const WithoutCaption: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tile ds-bd-tile--start">
      <Box>
        <Checkbox showCaption={false} />
      </Box>
    </div>
  ),
};

/** The text column is a fixed width: the text wraps and the box stays aligned to the first line. */
export const LongLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tile ds-bd-tile--start">
      <Box>
        <Checkbox
          title="A longer label that does not fit on one line wraps inside the text column"
          subtitle="Supporting text can wrap too, and the box stays aligned to the first line."
        />
      </Box>
    </div>
  ),
};

function BehaviorDemo() {
  const [value, setValue] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(false);
  return (
    <div className="ds-bd-behavior">
      <Box>
        <Checkbox title="Controlled" subtitle="checked + onChange. Click the box or the label, or Tab then Space." checked={value} onChange={(e) => setValue(e.target.checked)} />
      </Box>
      <Box>
        <Checkbox title="Uncontrolled" subtitle="defaultChecked + onChange." defaultChecked onChange={(e) => setUncontrolled(e.target.checked)} />
      </Box>
      <Box>
        <Checkbox title="Disabled" showCaption={false} defaultChecked disabled />
      </Box>
      <p className="ds-bd-behavior__status" role="status">
        Controlled <code>checked</code>: <code>{String(value)}</code> · uncontrolled last change: <code>{String(uncontrolled)}</code>
      </p>
    </div>
  );
}

/** Native behavior: click the box or the label, Tab to focus, Space to toggle; a disabled checkbox cannot be focused or toggled. */
export const Behavior: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BehaviorDemo />,
};

/** Checks that the React Checkbox and the HTML builder produce the same DOM for a matrix of props. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <CheckboxParity />,
};
