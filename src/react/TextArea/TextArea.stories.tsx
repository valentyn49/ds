import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TEXT_AREA_STATES, TEXT_AREA_DEFAULTS } from '../../components/text-area/text-area.spec.js';
import { textAreaStateConfig } from '../../docs/text-area-docs.js';
import '../../docs/input-docs.css';
import { TextArea } from './TextArea';
import type { TextAreaProps } from './TextArea';
import { INPUT_ICON_NAMES } from './InputIcon';
import { TextAreaParity } from './TextAreaParity';

const figma = (property: string) => `Figma property: \`${property}\``;
const ICON_OPTIONS = ['none', ...INPUT_ICON_NAMES];
const ICON_MAPPING = { none: undefined };

/** The Figma `state` values are shown with the real component: only the focus look is forced, for display. */
type StateName = (typeof TEXT_AREA_STATES)[number];
function stateProps(state: StateName, placeholder?: string): Partial<TextAreaProps> {
  const { props, forceFocus } = textAreaStateConfig(state, placeholder) as {
    props: { value?: string; disabled?: boolean; validation?: 'valid' | 'error' };
    forceFocus?: boolean;
  };
  const { value, ...rest } = props;
  return { ...rest, ...(value !== undefined ? { defaultValue: value } : {}), ...(forceFocus ? { 'data-preview-state': 'focus' as const } : {}) };
}

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-input-box">{children}</div>;
const Surface = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-demo-surface">{children}</div>;

interface PlaygroundArgs extends TextAreaProps {
  state: StateName;
}

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: { layout: 'padded' },
  args: {
    showLabel: true,
    label: TEXT_AREA_DEFAULTS.label,
    info: false,
    placeholder: TEXT_AREA_DEFAULTS.placeholder,
    showFootnote: true,
    footnote: TEXT_AREA_DEFAULTS.footnote,
    disabled: false,
  },
  argTypes: {
    showLabel: { name: 'showLabel', description: figma('show label'), control: 'boolean' },
    label: { description: figma('label text'), control: 'text', if: { arg: 'showLabel' } },
    info: { description: `${figma('info')}. Shows the info icon after the label.`, control: 'boolean', if: { arg: 'showLabel' } },
    placeholder: { description: figma('placeholder text'), control: 'text' },
    leftIcon: { description: `${figma('show left icon')} + \`left icon\`. An icon name or your own element; present means shown.`, control: 'select', options: ICON_OPTIONS, mapping: ICON_MAPPING, table: { type: { summary: 'InputIconName | ReactElement' } } },
    rightIcon: { description: `${figma('show right icon')} + \`right icon\``, control: 'select', options: ICON_OPTIONS, mapping: ICON_MAPPING, table: { type: { summary: 'InputIconName | ReactElement' } } },
    showFootnote: { name: 'showFootnote', description: figma('show footnote'), control: 'boolean' },
    footnote: { description: figma('footnote_text'), control: 'text', if: { arg: 'showFootnote' } },
    validation: { description: `${figma('state')} = valid or error. \`error\` also sets \`aria-invalid\`.`, control: 'inline-radio', options: [undefined, 'valid', 'error'], table: { type: { summary: "'valid' | 'error'" } } },
    disabled: { description: `${figma('state')} = disabled. Native attribute.`, control: 'boolean' },
    'data-preview-state': { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The playground adds a documentation-only `state` control that maps the Figma `state` values onto the real component. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { state: 'default' },
  argTypes: {
    state: {
      description: `${figma('state')}. Focus and filing are real :focus-within behavior and are forced here for display only. Disabled, valid and error map to the \`disabled\` and \`validation\` props. Type in the field to try it; Enter adds a new line.`,
      control: 'select',
      options: [...TEXT_AREA_STATES],
    },
  },
  render: ({ state, ...args }) => {
    const mapped = stateProps(state, args.placeholder);
    const key = `${state}|${args.placeholder}`;
    return (
      <Surface>
        <Box>
          <TextArea key={key} {...args} {...mapped} />
        </Box>
      </Surface>
    );
  },
};

/** All seven values of the Figma `state` property. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states">
      {(TEXT_AREA_STATES as string[]).map((state) => (
        <div key={state} className="ds-bd-input-state">
          <code>state={state}</code>
          <div className="ds-bd-tile ds-bd-tile--start">
            <Box>
              <TextArea {...stateProps(state)} />
            </Box>
          </div>
        </div>
      ))}
    </div>
  ),
};

const CONFIGURATIONS: Array<{ name: string; props: Partial<TextAreaProps> }> = [
  { name: 'default', props: {} },
  { name: 'info', props: { info: true } },
  { name: 'show left icon', props: { leftIcon: 'info' } },
  { name: 'show right icon', props: { rightIcon: 'info' } },
  { name: 'both icons', props: { leftIcon: 'info', rightIcon: 'info' } },
  { name: 'show label off', props: { showLabel: false } },
  { name: 'show footnote off', props: { showFootnote: false } },
];

/** The optional parts: label, info icon, left and right icon, footnote. */
export const Configurations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-overview ds-bd-overview--input">
      {CONFIGURATIONS.map(({ name, props }) => (
        <div key={name} className="ds-bd-overview__item">
          <div className="ds-bd-tile ds-bd-tile--start">
            <Box>
              <TextArea {...props} />
            </Box>
          </div>
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};

/** Multi-line text. The field is one line tall by default and grows with its content (where `field-sizing` is supported). */
export const Multiline: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tile ds-bd-tile--start">
      <Box>
        <TextArea defaultValue={'First line of text\nSecond line of text\nThird line of text'} placeholder="" />
      </Box>
    </div>
  ),
};

function ControlledExample() {
  const [value, setValue] = useState('');
  const tooLong = value.length > 40;
  return (
    <div className="ds-bd-tile ds-bd-tile--stack">
      <Box>
        <TextArea
          label="Comment"
          placeholder="Write something"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          validation={tooLong ? 'error' : value ? 'valid' : undefined}
          footnote={tooLong ? 'Keep it under 40 characters' : `${value.length} of 40 characters`}
        />
      </Box>
      <span role="status">Value in the parent: “{value}”</span>
    </div>
  );
}

/** Controlled use: the parent owns the value and sets `validation` and `footnote` from it. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

/** Checks that the React TextArea and the HTML builder produce the same DOM for every state and configuration. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <TextAreaParity />,
};
