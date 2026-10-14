import { createAccordion, ACCORDION_STATES, ACCORDION_DEFAULTS } from '../../../components/accordion/accordion.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/accordion-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Accordion/collapse',
  parameters: { layout: 'padded' },
  args: {
    state: 'closed',
    title: ACCORDION_DEFAULTS.title,
    content: ACCORDION_DEFAULTS.content,
    showSubtitle: false,
    subtitle: ACCORDION_DEFAULTS.subtitle,
    showLeftIcon: false,
    showLink: false,
    showButton: false,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. The initial state of the item; click the header, or press Enter or Space on it, to toggle it for real. The content text is sample text for demonstration only.`,
      control: 'inline-radio',
      options: ACCORDION_STATES,
    },
    title: { name: 'title', description: figma('title'), control: 'text' },
    content: { name: 'content', description: figma('content'), control: 'text' },
    showSubtitle: { name: 'Subtitle', description: figma('Subtitle'), control: 'boolean' },
    subtitle: { name: 'subtitle text', description: 'Text of the Subtitle.', control: 'text', if: { arg: 'showSubtitle' } },
    showLeftIcon: { name: 'Left icon', description: figma('Left icon'), control: 'boolean' },
    showLink: { name: 'Link', description: figma('Link'), control: 'boolean' },
    showButton: { name: 'Button', description: figma('Button'), control: 'boolean' },
  },
  render: ({ state, ...args }) => {
    const box = document.createElement('div');
    box.className = 'ds-bd-acc-box';
    box.append(createAccordion({ ...args, open: state === 'open' }));
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};

export const Playground = {};

// Three independent items. Figma defines a single item, so each one opens and closes on its own.
export const Behavior = {
  parameters: { controls: { disable: true } },
  render: () => {
    const group = document.createElement('div');
    group.className = 'ds-bd-acc-group';
    const readout = document.createElement('p');
    readout.className = 'ds-bd-acc-readout';

    const items = ['First item', 'Second item', 'Third item'].map((title, index) =>
      createAccordion({ title, open: index === 0, content: `Sample content for ${title.toLowerCase()}, for demonstration only.` }),
    );
    const update = () => {
      const open = items.map((el, i) => (el.classList.contains('ds-accordion--open') ? i + 1 : null)).filter(Boolean);
      readout.innerHTML = `Open items: <code>${open.length ? open.join(', ') : 'none'}</code>`;
    };
    items.forEach((el) => {
      el.addEventListener('ds-accordion-toggle', update);
      group.append(el);
    });
    update();

    const box = document.createElement('div');
    box.className = 'ds-bd-acc-box';
    box.append(group, readout);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(box);
    return surface;
  },
};
