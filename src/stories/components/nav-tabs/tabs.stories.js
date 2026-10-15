import { createTabs, sampleItems, TABS_TYPES, SMALL_TAB_MODES, ITEM_COUNT } from '../../../components/tabs/tabs.js';
import { demoTabs, withReadout, panelHTML } from '../../../docs/tabs-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/tabs-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Nav Tabs/Tabs',
  parameters: { layout: 'padded' },
  args: {
    type: 'tab',
    mode: 'light',
    tabCount: ITEM_COUNT.tab.default,
    generalCount: ITEM_COUNT['General tab'].default,
    smallCount: ITEM_COUNT['Small tab'].default,
    selected: 1,
    icon: false,
    pro: false,
    divider: false,
    tabState: 'none',
    menuState: 'none',
  },
  argTypes: {
    type: {
      name: 'type',
      description: 'Figma component: `tab`, `General tab` or `Small tab`. Each is a separate component in Figma, not a variant of one.',
      control: 'inline-radio',
      options: TABS_TYPES,
    },
    mode: { name: 'mode', description: figma('mode'), control: 'inline-radio', options: SMALL_TAB_MODES, if: { arg: 'type', eq: 'Small tab' } },
    tabCount: {
      name: 'tabs',
      description: `Number of tabs shown (Figma: ${ITEM_COUNT.tab.min} to ${ITEM_COUNT.tab.max}). Sample labels are not part of the specification.`,
      control: { type: 'range', min: ITEM_COUNT.tab.min, max: ITEM_COUNT.tab.max, step: 1 },
      if: { arg: 'type', eq: 'tab' },
    },
    generalCount: {
      name: 'tabs',
      description: `Number of tabs shown (Figma: ${ITEM_COUNT['General tab'].min} to ${ITEM_COUNT['General tab'].max}).`,
      control: { type: 'range', min: ITEM_COUNT['General tab'].min, max: ITEM_COUNT['General tab'].max, step: 1 },
      if: { arg: 'type', eq: 'General tab' },
    },
    smallCount: {
      name: 'tabs',
      description: `Number of tabs shown (Figma: ${ITEM_COUNT['Small tab'].min} to ${ITEM_COUNT['Small tab'].max}).`,
      control: { type: 'range', min: ITEM_COUNT['Small tab'].min, max: ITEM_COUNT['Small tab'].max, step: 1 },
      if: { arg: 'type', eq: 'Small tab' },
    },
    selected: {
      name: 'selected tab',
      description: 'Which tab starts selected (1 is the first). Clicking or using the arrow keys changes the selection in the preview.',
      control: { type: 'range', min: 1, max: ITEM_COUNT.tab.max, step: 1 },
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
    const type = TABS_TYPES.includes(args.type) ? args.type : 'tab';
    const count = type === 'tab' ? args.tabCount : type === 'General tab' ? args.generalCount : args.smallCount;
    const previewState = type === 'tab' ? args.tabState : args.menuState;
    const bar = demoTabs({ type, mode: args.mode, count, selected: args.selected, icon: args.icon, pro: args.pro, divider: args.divider, previewState });

    const box = document.createElement('div');
    box.className = 'ds-bd-tabs-box';
    box.append(bar);
    if (type === 'General tab') withReadout(bar, box);

    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};

// One bar of each kind, with the panels or readout that show the selection working.
export const Behavior = {
  parameters: { controls: { disable: true } },
  render: () => {
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-tabs-stack';

    const make = (title, build) => {
      const group = document.createElement('div');
      group.className = 'ds-bd-tabs-group';
      const caption = document.createElement('code');
      caption.textContent = title;
      group.append(caption);
      build(group);
      wrap.append(group);
    };

    make('tab: tablist, tab and tabpanel', (g) => g.append(demoTabs({ type: 'tab', count: 4 })));
    make('Small tab (light): tablist, tab and tabpanel', (g) => g.append(demoTabs({ type: 'Small tab', mode: 'light', count: 3 })));
    make('Small tab (dark): one disabled tab is skipped by the arrow keys', (g) => {
      const items = sampleItems('Small tab', 4);
      items[2].disabled = true;
      items.forEach((item) => (item.panel = panelHTML(item.label)));
      g.append(createTabs({ type: 'Small tab', mode: 'dark', items, ariaLabel: 'Small tab dark sample' }));
    });
    make('General tab: navigation with aria-current', (g) => {
      const items = sampleItems('General tab', 4);
      items[2].disabled = true;
      const bar = createTabs({ type: 'General tab', items, ariaLabel: 'General tab sample' });
      g.append(bar);
      withReadout(bar, g);
    });

    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(wrap);
    return surface;
  },
};
