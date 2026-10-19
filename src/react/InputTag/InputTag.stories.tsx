import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { INPUT_TAG_STATES, INPUT_TAG_DEFAULTS } from '../../components/input-tag/input-tag.spec.js';
import { inputTagStateConfig } from '../../docs/input-tag-docs.js';
import '../../docs/input-docs.css';
import '../../docs/input-tag-docs.css';
import { Button } from '../Button/Button';
import { InputTag, INPUT_TAG_ICON_NAMES } from './InputTag';
import type { InputTagProps } from './InputTag';
import { InputTagParity } from './InputTagParity';

const figma = (property: string) => `Figma property: \`${property}\``;

type StateConfig = { props: { tags?: string[]; value?: string; finished?: boolean }; preview?: string };
const stateConfig = (state: string, tagText: string, placeholder: string) => inputTagStateConfig(state, tagText, placeholder) as StateConfig;

/** Documentation: draws one Figma `state` with the real component (carets are forced for static previews). */
function StateInputTag({ state, tagText = INPUT_TAG_DEFAULTS.tagText, ...props }: InputTagProps & { state: string; tagText?: string }) {
  const { props: stateProps, preview } = stateConfig(state, tagText, props.placeholder ?? INPUT_TAG_DEFAULTS.placeholder);
  const { value, ...rest } = stateProps;
  return (
    <InputTag
      {...props}
      {...rest}
      defaultValue={value}
      // The key makes the field remount when the state changes, so a new defaultValue is applied.
      key={`${state}-${tagText}`}
      rootProps={preview ? { 'data-preview-state': preview } : undefined}
    />
  );
}

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-input-box">{children}</div>;
const Surface = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-demo-surface">{children}</div>;
const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="ds-bd-tile ds-bd-tile--start">
    <Box>{children}</Box>
  </div>
);

type StoryArgs = InputTagProps & { state: string; tagText: string };

const meta = {
  title: 'Components/InputTag',
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
    disabled: false,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. Documentation preview of the five Figma states. Selected and finished add the tags. In the component these are just \`tags\`, \`finished\` and the text; the carets of focus, filing and selected are forced here for preview only. Click into the field to use the real caret and type.`,
      control: 'select',
      options: [...INPUT_TAG_STATES],
      table: { category: 'Documentation' },
    },
    tagText: { name: 'tag text', description: 'Documentation: text of the tag in the selected state. The finished state adds a second tag with " 2" appended, as in Figma.', control: 'text', if: { arg: 'state', eq: 'selected' }, table: { category: 'Documentation' } },
    showLabel: { name: 'showLabel', description: figma('show label'), control: 'boolean' },
    label: { description: figma('label text'), control: 'text', if: { arg: 'showLabel' } },
    info: { description: `${figma('info')}. Shows the info icon after the label.`, control: 'boolean', if: { arg: 'showLabel' } },
    placeholder: { description: figma('placeholder text'), control: 'text' },
    showLeftIcon: { name: 'showLeftIcon', description: `${figma('show left icon')}. On by default in this component.`, control: 'boolean' },
    leftIcon: { description: figma('left icon'), control: 'select', options: INPUT_TAG_ICON_NAMES, if: { arg: 'showLeftIcon' } },
    showRightIcon: { name: 'showRightIcon', description: figma('show right icon'), control: 'boolean' },
    rightIcon: { description: figma('right icon'), control: 'select', options: INPUT_TAG_ICON_NAMES, if: { arg: 'showRightIcon' } },
    showDropdown: { name: 'showDropdown', description: `${figma('dropdown')}. Shows a chevron at the end of the field.`, control: 'boolean' },
    showFootnote: { name: 'showFootnote', description: figma('show footnote'), control: 'boolean' },
    footnote: { description: figma('footnote_text'), control: 'text', if: { arg: 'showFootnote' } },
    disabled: { description: 'Native input attribute. Figma defines no disabled look; the browser default applies.', control: 'boolean' },
    tags: { control: false, description: 'The tags shown in the field (Figma `badge` chips). Display only.', table: { type: { summary: 'string[]' } } },
    finished: { control: false, description: 'The Figma `finished` state: the text entry is hidden visually and stays in the page for assistive technology.' },
  },
  render: (args) => (
    <Surface>
      <Box>
        <StateInputTag {...args} />
      </Box>
    </Surface>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The five values of the Figma `state` property, drawn with the real component. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states">
      {INPUT_TAG_STATES.map((state: string) => (
        <div key={state} className="ds-bd-input-state">
          <code>state={state}</code>
          <Tile>
            <StateInputTag state={state} />
          </Tile>
        </div>
      ))}
    </div>
  ),
};

const CONFIGURATIONS: Array<{ name: string; props: InputTagProps }> = [
  { name: 'default', props: {} },
  { name: 'tags', props: { tags: [INPUT_TAG_DEFAULTS.tagText], defaultValue: INPUT_TAG_DEFAULTS.placeholder } },
  { name: 'tags, finished', props: { tags: [INPUT_TAG_DEFAULTS.tagText, `${INPUT_TAG_DEFAULTS.tagText} 2`], finished: true } },
  { name: 'dropdown', props: { showDropdown: true } },
  { name: 'show right icon', props: { showRightIcon: true } },
  { name: 'show left icon off', props: { showLeftIcon: false } },
  { name: 'info', props: { info: true } },
  { name: 'show label off', props: { showLabel: false } },
  { name: 'show footnote off', props: { showFootnote: false } },
];

/** The optional parts of the component, each switched on or off. */
export const Configurations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-overview ds-bd-overview--input">
      {CONFIGURATIONS.map(({ name, props }) => (
        <div key={name} className="ds-bd-overview__item">
          <Tile>
            <InputTag {...props} />
          </Tile>
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};

/** Tags wrap onto new rows with an 8px gap. */
export const WrappingTags: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tile>
      <InputTag tags={['Australia BMK', 'Australia BMK 2', 'Australia BMK 3', 'Australia BMK 4']} finished showLeftIcon={false} />
    </Tile>
  ),
};

function UncontrolledExample() {
  const [last, setLast] = useState('Type in the field.');
  return (
    <div className="ds-bd-tile ds-bd-tile--stack">
      <Box>
        <InputTag
          label="Search markets"
          placeholder="Au"
          defaultValue=""
          name="markets"
          onChange={(event) => setLast(`onChange: "${event.target.value}"`)}
        />
      </Box>
      <span role="status">{last}</span>
    </div>
  );
}

/** Uncontrolled: the browser keeps the text; `onChange` reports it. Clicking anywhere in the field, or on the label, focuses the text entry. */
export const Uncontrolled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <UncontrolledExample />,
};

function ControlledExample() {
  const [value, setValue] = useState('Au');
  return (
    <div className="ds-bd-tile ds-bd-tile--stack">
      <Box>
        <InputTag label="Controlled" value={value} onChange={(event) => setValue(event.target.value.toUpperCase())} tags={[INPUT_TAG_DEFAULTS.tagText]} />
      </Box>
      <div style={{ display: 'flex', gap: 'var(--ds-space-4x)', alignItems: 'center' }}>
        <Button variant="secondary" size={36} onClick={() => setValue('')}>
          Clear
        </Button>
        <span role="status">value: "{value}"</span>
      </div>
    </div>
  );
}

/** Controlled: the app owns the text through `value` and `onChange` (here it turns the text to upper case). */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

/** Checks that the React InputTag and the HTML builder produce the same DOM for every combination of the Figma properties. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <InputTagParity />,
};
