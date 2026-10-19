import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { sampleItems } from '../../components/tabs/tabs.js';
import { FIGMA_LABEL, ITEM_COUNT, ITEM_STATES, ITEM_STATE_PROPERTY, SMALL_TAB_MODES, TABS_TYPES } from '../../components/tabs/tabs.spec.js';
import '../../docs/button-docs.css';
import '../../docs/input-docs.css';
import '../../docs/tabs-docs.css';
import { Tabs } from './Tabs';
import type { TabsItem, TabsMode, TabsType } from './Tabs';
import { TabsParity } from './TabsParity';

const figma = (property: string) => `Figma property: \`${property}\``;
const counts = ITEM_COUNT as Record<string, { min: number; max: number; default: number }>;
const makeItems = sampleItems as (type: string, count: number, options?: Record<string, unknown>) => TabsItem[];

const Panel = ({ label }: { label: React.ReactNode }) => (
  <div className="ds-bd-tabs-panel">Sample panel content for "{label}". Figma does not define panel content.</div>
);
const withPanels = (items: TabsItem[]): TabsItem[] => items.map((item) => ({ ...item, panel: <Panel label={item.label} /> }));

/** Shows which item is current for the navigation bar, which has no panels. Documentation only. */
const Readout = ({ label }: { label: React.ReactNode }) => <div className="ds-bd-tabs-readout">Current item: {label}</div>;

interface DemoProps {
  type: TabsType;
  mode?: TabsMode;
  count: number;
  selected: number;
  icon?: boolean;
  pro?: boolean;
  divider?: boolean;
  previewState?: string;
  ariaLabel?: string;
}

/** An interactive bar built from sample items, with panels (tab, Small tab) or a readout (General tab). */
function Demo({ type, mode, count, selected, icon = false, pro = false, divider = false, previewState = 'none', ariaLabel }: DemoProps) {
  const items = useMemo(() => {
    const list = makeItems(type, count, { icon, pro, divider });
    const current = Math.min(Math.max(selected - 1, 0), list.length - 1);
    if (previewState !== 'none') {
      const target = list[(current + 1) % list.length];
      if (previewState === 'disabled') target.disabled = true;
      else target.previewState = previewState as TabsItem['previewState'];
    }
    return type === 'General tab' ? list : withPanels(list);
  }, [type, count, selected, icon, pro, divider, previewState]);

  const initial = Math.min(Math.max(selected - 1, 0), items.length - 1);
  const [value, setValue] = useState<number | null>(initial);
  useEffect(() => setValue(initial), [initial, type, count]);

  return (
    <div className="ds-bd-tabs-group">
      <Tabs type={type} mode={mode} items={items} value={value} onValueChange={setValue} ariaLabel={ariaLabel ?? `${type} sample`} />
      {type === 'General tab' ? <Readout label={value !== null ? items[value]?.label : 'none'} /> : null}
    </div>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { layout: 'padded', controls: { exclude: ['items', 'value', 'defaultValue', 'ariaLabel', 'className', 'style'] } },
  args: { type: 'tab', mode: 'light', items: [] },
  argTypes: {
    type: {
      name: 'type',
      description: 'Figma component: `tab`, `General tab` or `Small tab`. Each is a separate component in Figma, not a variant of one.',
      control: 'inline-radio',
      options: [...TABS_TYPES],
    },
    mode: { name: 'mode', description: figma('mode'), control: 'inline-radio', options: [...SMALL_TAB_MODES], if: { arg: 'type', eq: 'Small tab' } },
    onValueChange: { action: 'selected' },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Surface = ({ children }: { children: React.ReactNode }) => (
  <div className="ds-bd-demo-surface">
    <div className="ds-bd-tabs-box">{children}</div>
  </div>
);

interface PlaygroundArgs {
  tabCount: number;
  generalCount: number;
  smallCount: number;
  selected: number;
  icon: boolean;
  pro: boolean;
  divider: boolean;
  tabState: string;
  menuState: string;
}

/** The Controls change the bar; clicking a tab or using the arrow keys changes the selection for real. */
export const Playground: StoryObj<PlaygroundArgs & Pick<React.ComponentProps<typeof Tabs>, 'type' | 'mode'>> = {
  args: {
    type: 'tab',
    mode: 'light',
    tabCount: counts.tab.default,
    generalCount: counts['General tab'].default,
    smallCount: counts['Small tab'].default,
    selected: 1,
    icon: false,
    pro: false,
    divider: false,
    tabState: 'none',
    menuState: 'none',
  },
  argTypes: {
    tabCount: {
      name: 'tabs',
      description: `Number of tabs shown (Figma: ${counts.tab.min} to ${counts.tab.max}). Sample labels are not part of the specification.`,
      control: { type: 'range', min: counts.tab.min, max: counts.tab.max, step: 1 },
      if: { arg: 'type', eq: 'tab' },
    },
    generalCount: {
      name: 'tabs',
      description: `Number of tabs shown (Figma: ${counts['General tab'].min} to ${counts['General tab'].max}).`,
      control: { type: 'range', min: counts['General tab'].min, max: counts['General tab'].max, step: 1 },
      if: { arg: 'type', eq: 'General tab' },
    },
    smallCount: {
      name: 'tabs',
      description: `Number of tabs shown (Figma: ${counts['Small tab'].min} to ${counts['Small tab'].max}).`,
      control: { type: 'range', min: counts['Small tab'].min, max: counts['Small tab'].max, step: 1 },
      if: { arg: 'type', eq: 'Small tab' },
    },
    selected: {
      name: 'selected tab',
      description: 'Which tab starts selected (1 is the first).',
      control: { type: 'range', min: 1, max: counts.tab.max, step: 1 },
    },
    icon: { name: 'icon', description: `${figma('right icon')} on \`tab\`, ${figma('icon')} on \`General tab\` and \`Small tab\`. Switches the icon on for every tab.`, control: 'boolean' },
    pro: { name: 'pro', description: `${figma('pro')}. Shows the "Upgrade" badge on the last tab (preview choice).`, control: 'boolean', if: { arg: 'type', eq: 'General tab' } },
    divider: { name: 'divider', description: `${figma('divider')}. Puts a divider before the last tab (preview choice).`, control: 'boolean', if: { arg: 'type', eq: 'General tab' } },
    tabState: {
      name: 'state of next tab',
      description: 'Forces a state on the tab after the selected one. `tab` has selected, default, hover and pressed only.',
      control: 'inline-radio',
      options: ['none', 'hover', 'pressed'],
      if: { arg: 'type', eq: 'tab' },
    },
    menuState: {
      name: 'state of next tab',
      description: 'Forces a state on the tab after the selected one. `General tab` and `Small tab` also have a disabled state.',
      control: 'inline-radio',
      options: ['none', 'hover', 'pressed', 'disabled'],
      if: { arg: 'type', neq: 'tab' },
    },
  },
  render: (args) => {
    const type = (TABS_TYPES as string[]).includes(args.type ?? 'tab') ? (args.type as TabsType) : 'tab';
    const count = type === 'tab' ? args.tabCount : type === 'General tab' ? args.generalCount : args.smallCount;
    const previewState = type === 'tab' ? args.tabState : args.menuState;
    return (
      <Surface>
        <Demo type={type} mode={args.mode} count={count} selected={args.selected} icon={args.icon} pro={args.pro} divider={args.divider} previewState={previewState} />
      </Surface>
    );
  },
};

const figmaItems = (type: TabsType, count: number, extra: (i: number) => Partial<TabsItem> = () => ({})): TabsItem[] =>
  Array.from({ length: count }, (_, i) => ({ label: FIGMA_LABEL[type as keyof typeof FIGMA_LABEL], ...extra(i) }));

const Row = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
  <div className="ds-bd-tabs-item">
    <code>{caption}</code>
    <div className="ds-bd-tabs-box">{children}</div>
  </div>
);

const Bar = ({ type, items, mode, selected = 0 }: { type: TabsType; items: TabsItem[]; mode?: TabsMode; selected?: number | null }) => (
  <Tabs type={type} mode={mode} items={items} defaultValue={selected} ariaLabel={`${type} example`} />
);

/** Every optional property of the three bars, at the sample text Figma uses. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tabs-stack">
      <h3>tab</h3>
      <Row caption="tab · first tab selected (10 tabs, as in Figma)">
        <Bar type="tab" items={figmaItems('tab', 10)} />
      </Row>
      <Row caption="tab-item · right icon = true">
        <Bar type="tab" items={figmaItems('tab', 4, () => ({ icon: true }))} />
      </Row>
      <h3>General tab</h3>
      <Row caption="General tab · first tab selected (5 of 10 tabs shown)">
        <Bar type="General tab" items={figmaItems('General tab', 5)} />
      </Row>
      <Row caption="menu item · icon = true">
        <Bar type="General tab" items={figmaItems('General tab', 4, () => ({ icon: true }))} />
      </Row>
      <Row caption="menu item · pro = true">
        <Bar type="General tab" items={figmaItems('General tab', 4, (i) => ({ pro: i > 0 }))} />
      </Row>
      <Row caption="menu item · icon = true, pro = true">
        <Bar type="General tab" items={figmaItems('General tab', 3, () => ({ icon: true, pro: true }))} />
      </Row>
      <Row caption="General tab · divider = true, divider 2 = true">
        <Bar type="General tab" items={figmaItems('General tab', 5, (i) => ({ dividerBefore: i === 2 || i === 4 }))} />
      </Row>
      <h3>Small tab</h3>
      <Row caption="Small tab · mode = light">
        <Bar type="Small tab" mode="light" items={figmaItems('Small tab', 6)} />
      </Row>
      <Row caption="Small tab · mode = dark">
        <Bar type="Small tab" mode="dark" items={figmaItems('Small tab', 6)} />
      </Row>
      <Row caption="small menu item · icon = true, mode = light">
        <Bar type="Small tab" mode="light" items={figmaItems('Small tab', 4, () => ({ icon: true }))} />
      </Row>
      <Row caption="small menu item dark · icon = true, mode = dark">
        <Bar type="Small tab" mode="dark" items={figmaItems('Small tab', 4, () => ({ icon: true }))} />
      </Row>
    </div>
  ),
};

function StateGrid({ type, mode }: { type: TabsType; mode?: TabsMode }) {
  const prop = (ITEM_STATE_PROPERTY as Record<string, string>)[type];
  const states = (ITEM_STATES as Record<string, string[]>)[type];
  const tile = (caption: string, item: Partial<TabsItem>, selected: number | null) => (
    <div className="ds-bd-tabs-state" key={caption}>
      <code>{caption}</code>
      <Bar type={type} mode={mode} items={[{ label: FIGMA_LABEL[type as keyof typeof FIGMA_LABEL], ...item }]} selected={selected} />
    </div>
  );
  const tiles = states.map((state) => {
    const key = state.toLowerCase();
    const caption = `${prop}=${state}`;
    if (key === 'selected' || key === 'active') return tile(caption, {}, 0);
    if (key === 'disabled') return tile(caption, { disabled: true }, null);
    if (key === 'hover' || key === 'pressed') return tile(caption, { previewState: key }, null);
    return tile(caption, {}, null);
  });
  tiles.push(tile('focus (keyboard, not in Figma)', { previewState: 'focus' }, null));
  return <div className="ds-bd-tabs-states">{tiles}</div>;
}

/** The states of each tab component. Hover, pressed and focus are forced for display only; in a page they come from the browser. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <h3>tab</h3>
      <StateGrid type="tab" />
      <h3>General tab</h3>
      <StateGrid type="General tab" />
      <h3>Small tab</h3>
      <div className="ds-bd-tabs-subtitle">mode = light</div>
      <StateGrid type="Small tab" mode="light" />
      <div className="ds-bd-tabs-subtitle">mode = dark</div>
      <StateGrid type="Small tab" mode="dark" />
    </div>
  ),
};

function BehaviorExample() {
  const smallItems = useMemo(() => {
    const list = makeItems('Small tab', 4);
    list[2].disabled = true;
    return withPanels(list);
  }, []);
  const navItems = useMemo(() => {
    const list = makeItems('General tab', 4);
    list[2].disabled = true;
    return list;
  }, []);
  const [nav, setNav] = useState<number | null>(0);
  return (
    <div className="ds-bd-tabs-stack">
      <div className="ds-bd-tabs-group">
        <code>tab: tablist, tab and tabpanel</code>
        <Demo type="tab" count={4} selected={1} />
      </div>
      <div className="ds-bd-tabs-group">
        <code>Small tab (light): tablist, tab and tabpanel</code>
        <Demo type="Small tab" mode="light" count={3} selected={1} />
      </div>
      <div className="ds-bd-tabs-group">
        <code>Small tab (dark): one disabled tab is skipped by the arrow keys</code>
        <Tabs type="Small tab" mode="dark" items={smallItems} ariaLabel="Small tab dark sample" />
      </div>
      <div className="ds-bd-tabs-group">
        <code>General tab: navigation with aria-current</code>
        <Tabs type="General tab" items={navItems} value={nav} onValueChange={setNav} ariaLabel="General tab sample" />
        <Readout label={nav !== null ? navItems[nav]?.label : 'none'} />
      </div>
    </div>
  );
}

/** One bar of each kind, with the panels or readout that show the selection working. */
export const Behavior: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-demo-surface">
      <BehaviorExample />
    </div>
  ),
};

function ControlledExample() {
  const items = useMemo(() => withPanels(makeItems('tab', 3)), []);
  const [value, setValue] = useState<number | null>(0);
  return (
    <div className="ds-bd-tabs-group">
      <Tabs type="tab" items={items} value={value} onValueChange={setValue} ariaLabel="Controlled tabs" />
      <div className="ds-bd-tabs-readout">value = {String(value)}</div>
      <div>
        <button type="button" onClick={() => setValue(2)}>
          Select the last tab from outside
        </button>
      </div>
    </div>
  );
}

/** With `value` and `onValueChange` the parent owns the selection. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <ControlledExample />
    </Surface>
  ),
};

/** Checks that the React Tabs and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <TabsParity />,
};
