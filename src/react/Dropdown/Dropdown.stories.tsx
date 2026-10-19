import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DROPDOWN_DEFAULTS, SAMPLE_OPTIONS } from '../../components/dropdown/dropdown.spec.js';
import { dropdownStateConfig } from '../../docs/dropdown-docs.js';
import '../../docs/input-docs.css';
import '../../docs/dropdown-docs.css';
import { Button } from '../Button/Button';
import { Dropdown, DropdownItems, DROPDOWN_STATE_LIST } from './Dropdown';
import type { DropdownOption, DropdownState } from './Dropdown';
import { DropdownParity } from './DropdownParity';

const figma = (property: string) => `Figma property: \`${property}\``;

/** Controls of the Live Demo. `state` is a documentation control that sets props of the component. */
interface PlaygroundArgs {
  state: DropdownState;
  showLabel: boolean;
  label: string;
  info: boolean;
  placeholder: string;
  showFootnote: boolean;
  footnote: string;
  showPro: boolean;
  showCheckbox: boolean;
  showRightIcon: boolean;
  showColor: boolean;
  showSearch: boolean;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const meta = {
  title: 'Components/Dropdown',
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
      description: `${figma('state')} of dropdown-input. Selected is a chosen value (\`defaultValue\`), disabled and error map to \`disabled\` and \`validation\`, and hover is forced for preview only. Open the menu and choose an option to try it. The options (${SAMPLE_OPTIONS.join(', ')}) are sample data, not a design specification.`,
      control: 'select',
      options: [...DROPDOWN_STATE_LIST],
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
    onValueChange: { action: 'value changed' },
    onOpenChange: { action: 'open changed' },
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<PlaygroundArgs>;

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-dd-box">{children}</div>;
const Surface = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-demo-surface ds-bd-dd-surface">{children}</div>;

type StateConfig = { props: { value?: string; disabled?: boolean; validation?: 'error' }; preview?: string };

/** The Controls change the dropdown; opening the menu and choosing an option works for real. */
export const Playground: Story = {
  render: ({ state, onValueChange, onOpenChange, ...args }) => {
    const { props, preview } = dropdownStateConfig(state) as StateConfig;
    const { value, ...flags } = props;
    return (
      <Surface>
        <Box>
          <Dropdown
            key={JSON.stringify([state, args])}
            {...args}
            {...flags}
            defaultValue={value}
            data-preview-state={preview}
            onValueChange={onValueChange}
            onOpenChange={onOpenChange}
          />
        </Box>
      </Surface>
    );
  },
};

const StateTile = ({ code, note, children }: { code: string; note: string; children: React.ReactNode }) => (
  <div className="ds-bd-input-state">
    <code>{code}</code>
    <div className="ds-bd-tile ds-bd-tile--start">
      <div className="ds-bd-dd-box">{children}</div>
    </div>
    <span className="ds-bd-note">{note}</span>
  </div>
);

const STATE_NOTES: Record<DropdownState, string> = {
  default: 'Gray/200 border, placeholder in gray/500, chevron down.',
  hover: 'Gray/500 border and the chevron flipped up. Figma shows the open menu this way.',
  selected: 'The chosen value in gray/900.',
  disabled: 'Gray/100 fill, text and chevron in gray/500.',
  error: 'Alert/600 border and caption.',
};

/** The five states of the trigger (`dropdown-input`), then the two types of `dropdown item`. */
export const States: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states ds-bd-dd-states">
      {DROPDOWN_STATE_LIST.map((state) => {
        const { props, preview } = dropdownStateConfig(state) as StateConfig;
        const { value, ...flags } = props;
        return (
          <StateTile key={state} code={`state=${state}`} note={STATE_NOTES[state]}>
            <Dropdown {...flags} defaultValue={value} data-preview-state={preview} />
          </StateTile>
        );
      })}
      <StateTile code="dropdown item · type=Default" note="">
        <MenuOnly options={['London']} />
      </StateTile>
      <StateTile code="dropdown item · type=hover" note="">
        <MenuOnly options={['London']} activeIndex={0} />
      </StateTile>
    </div>
  ),
};

/** A menu without its trigger, laid out in the page flow (used to show items on their own). */
function MenuOnly({ options, ...ctx }: { options: DropdownOption[]; selectedIndex?: number; activeIndex?: number }) {
  return (
    <div className="ds-dropdown ds-bd-menu-flow">
      <div className="ds-dropdown__control">
        <div className="ds-dropdown__menu">
          <div className="ds-dropdown__list" role="presentation">
            <DropdownItems options={options} {...ctx} />
          </div>
        </div>
      </div>
    </div>
  );
}

const ITEM_CONFIGS: DropdownOption[] = [
  { label: 'London' },
  { label: 'Paris', checkbox: true },
  { label: 'Berlin', color: 'var(--ds-color-alert-500)' },
  { label: 'Madrid', rightIcon: true },
  { label: 'Rome', pro: true },
];

/** Optional parts of a `dropdown item`, one per row: checkbox, Color, Right icons (a check mark, shown on the selected item) and Pro. */
export const ItemParts: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tile ds-bd-tile--start">
      <div className="ds-bd-dd-box">
        <MenuOnly options={ITEM_CONFIGS} selectedIndex={3} />
      </div>
    </div>
  ),
};

/** The menu open from the start (`defaultOpen`) with the search field: typing narrows the list. */
export const OpenWithSearch: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Box>
        <Dropdown defaultOpen showSearch defaultValue="Paris" showFootnote={false} options={[...SAMPLE_OPTIONS, 'Rome', 'Oslo']} />
      </Box>
    </Surface>
  ),
};

/** Every optional part of an item, in an open menu. */
export const OpenWithItemParts: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Box>
        <Dropdown defaultOpen defaultValue="Madrid" showFootnote={false} options={ITEM_CONFIGS} />
      </Box>
    </Surface>
  ),
};

function BehaviorExample() {
  const [last, setLast] = useState<string>('none');
  return (
    <Surface>
      <Box>
        <Dropdown label="Dropdown" footnote="Click, or focus the trigger and use the keyboard." onValueChange={(v) => setLast(v)} />
        <p className="ds-bd-dd-readout" role="status">
          Selected value: <code>{last}</code>
        </p>
      </Box>
    </Surface>
  );
}

/** Shows the interaction: the readout is driven by `onValueChange`. */
export const Behavior: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => <BehaviorExample />,
};

function ControlledExample() {
  const [value, setValue] = useState<string | undefined>('Paris');
  const [open, setOpen] = useState(false);
  return (
    <Surface>
      <Box>
        <Dropdown label="Controlled" value={value} onValueChange={setValue} open={open} onOpenChange={setOpen} footnote={`value: ${value ?? 'none'} · open: ${open}`} />
        <div style={{ display: 'flex', gap: 'var(--ds-space-3x)', marginTop: 'var(--ds-space-4x)', flexWrap: 'wrap' }}>
          <Button variant="secondary" size={36} onClick={() => setValue('Berlin')}>
            Set Berlin
          </Button>
          <Button variant="secondary" size={36} onClick={() => setValue(undefined)}>
            Clear
          </Button>
          <Button variant="secondary" size={36} onClick={() => setOpen(true)}>
            Open menu
          </Button>
        </div>
      </Box>
    </Surface>
  );
}

/** Both the value and the open state are owned by the parent. */
export const Controlled: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

/** Checks that the React Dropdown and the HTML component produce the same DOM for every combination. */
export const ParityWithHtml: StoryObj = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <DropdownParity />,
};
