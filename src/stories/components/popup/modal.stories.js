import { createPopup, POPUP_TYPES, POPUP_WIDTHS, POPUP_DEFAULTS } from '../../../components/popup/popup.js';
import { POPUP_FRAMES } from '../../../components/popup/popup.spec.js';
import { createButton } from '../../../components/button/button.js';
import { PREVIEW_ZOOM, fieldsHTML, mockPageHTML, SCROLL_SUBTITLE } from '../../../docs/popup-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/popup-docs.css';

const figma = (property) => `Figma property: \`${property}\``;
const LAYOUTS = ['desktop', 'tablet', 'mobile', 'viewport'];

const nodeFromHTML = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstElementChild;
};

// The popup that is currently open in a demo. A redraw (a Controls change) closes it and opens the new one in its place.
let active = null;
let detachLog = null;

// Documentation-only: builds the trigger, the page behind the popup and the status line around the real popup.
function buildDemo(args, { log = false } = {}) {
  const reopen = Boolean(active?.isOpen);
  active?.destroy();
  active = null;
  detachLog?.();
  detachLog = null;

  const inViewport = args.layout === 'viewport';
  const trigger = createButton({ variant: 'primary', size: '48', text: 'Open popup' });
  trigger.classList.add('ds-bd-pp-trigger');

  let stage;
  let container = document.body;
  let wrapper;
  if (inViewport) {
    stage = document.createElement('div');
    stage.className = 'ds-bd-pp-viewport-note';
    const text = document.createElement('p');
    text.className = 'ds-bd-pp-status';
    text.textContent = 'The popup opens over the whole documentation page, as it does in a product. Scrolling the page is locked while it is open.';
    trigger.classList.remove('ds-bd-pp-trigger');
    stage.append(text, trigger);
    wrapper = stage;
  } else {
    const size = POPUP_FRAMES[args.layout];
    const frame = document.createElement('div');
    frame.className = `ds-bd-pp-demo-frame ds-bd-pp-demo-frame--${args.layout}`;
    frame.style.width = `${size.width}px`;
    frame.style.height = `${size.height}px`;
    frame.insertAdjacentHTML('beforeend', mockPageHTML(args.layout));
    frame.append(trigger);
    wrapper = document.createElement('div');
    wrapper.style.zoom = String(PREVIEW_ZOOM[args.layout]);
    wrapper.append(frame);
    container = frame;
    stage = wrapper;
  }

  const status = document.createElement('p');
  status.className = 'ds-bd-pp-status';
  status.textContent = 'Closed.';

  const readout = log ? document.createElement('ul') : null;
  if (readout) readout.className = 'ds-bd-pp-log';
  const note = (text, name) => {
    status.textContent = text;
    if (!readout) return;
    const item = document.createElement('li');
    item.innerHTML = `<code>${name}</code> ${text}`;
    readout.prepend(item);
  };

  const popup = createPopup({
    type: args.type,
    width: args.width,
    title: args.title,
    subtitle: args.showSubtitle ? args.subtitle : '',
    body: args.longContent ? nodeFromHTML(fieldsHTML()) : args.body,
    primaryLabel: args.primaryLabel,
    cancelLabel: args.cancelLabel,
    showCancel: args.showCancel,
    closeOnEscape: args.closeOnEscape,
    closeOnBackdrop: args.closeOnBackdrop,
    container,
    onPrimary: (p) => {
      if (args.primaryCloses) p.close('programmatic');
    },
  });
  active = popup;

  const listeners = {
    'ds-popup-open': () => note('Open. Focus is on the popup; Tab stays inside it.', 'ds-popup-open'),
    'ds-popup-primary': () => note(args.primaryCloses ? 'Primary action fired. This demo then closes the popup.' : 'Primary action fired. The popup stays open: the application decides.', 'ds-popup-primary'),
    'ds-popup-close': (event) => note(`Closed (${event.detail.reason}). Focus returned to "Open popup".`, 'ds-popup-close'),
  };
  Object.entries(listeners).forEach(([name, fn]) => container.addEventListener(name, fn));
  detachLog = () => Object.entries(listeners).forEach(([name, fn]) => container.removeEventListener(name, fn));

  trigger.addEventListener('click', () => popup.open());
  if (reopen) {
    popup.open({ focus: false, returnFocusTo: trigger });
    status.textContent = 'Open. The preview follows the Controls.';
  }

  const wrap = document.createElement('div');
  wrap.className = 'ds-bd-pp-demo';
  wrap.append(stage, status);
  if (readout) wrap.append(readout);

  const surface = document.createElement('div');
  surface.className = 'ds-bd-demo-surface ds-bd-pp-demo-surface';
  surface.append(wrap);
  return surface;
}

export default {
  title: 'Components/Popup/modal',
  parameters: { layout: 'padded' },
  args: {
    layout: 'desktop',
    type: 'default',
    width: '600',
    title: POPUP_DEFAULTS.title,
    showSubtitle: false,
    subtitle: SCROLL_SUBTITLE,
    body: POPUP_DEFAULTS.body,
    longContent: false,
    showCancel: true,
    cancelLabel: POPUP_DEFAULTS.cancelLabel,
    primaryLabel: POPUP_DEFAULTS.primaryLabel,
    closeOnEscape: true,
    closeOnBackdrop: false,
    primaryCloses: false,
  },
  argTypes: {
    layout: {
      name: 'preview',
      description:
        'Documentation only. Sets the width of the preview: desktop 1440px, tablet 744px, mobile 375px. In a product this is not a prop: the popup follows the width of the page. "viewport" opens the popup over this whole page instead of inside a frame.',
      control: 'inline-radio',
      options: LAYOUTS,
    },
    type: { description: `${figma('type')}. Changes the header: default, or an illustration above centered text.`, control: 'inline-radio', options: POPUP_TYPES },
    width: { description: 'Figma frames `480` and `600`. Desktop only; tablet and mobile fill the width.', control: 'inline-radio', options: POPUP_WIDTHS },
    title: { description: 'Title text.', control: 'text' },
    showSubtitle: { name: 'subTitle', description: figma('subTitle'), control: 'boolean' },
    subtitle: { name: 'sub', description: figma('sub'), control: 'text', if: { arg: 'showSubtitle' } },
    body: { description: 'Body text. The body is a slot: an application can pass any content.', control: 'text', if: { arg: 'longContent', truthy: false } },
    longContent: { name: 'long content', description: 'Documentation only. Fills the body with nine fields so the content scrolls, as in the Figma Behaviour section.', control: 'boolean' },
    showCancel: { name: 'show cancel', description: 'Shows the Cancel action. Cancel is only drawn on desktop in Figma; on tablet and mobile it is hidden whatever this says.', control: 'boolean' },
    cancelLabel: { name: 'cancel label', description: 'Label of the Cancel Button.', control: 'text', if: { arg: 'showCancel' } },
    primaryLabel: { name: 'primary label', description: 'Label of the primary Button.', control: 'text' },
    closeOnEscape: { name: 'closeOnEscape', description: 'Behavior, not in Figma. Escape closes the popup.', control: 'boolean' },
    closeOnBackdrop: { name: 'closeOnBackdrop', description: 'Behavior, not in Figma. A click on the backdrop closes the popup.', control: 'boolean' },
    primaryCloses: {
      name: 'primary closes',
      description: 'Documentation only. The primary action never closes the popup by itself; the application decides. This switch shows an application that closes it.',
      control: 'boolean',
    },
  },
  render: (args) => buildDemo(args),
};

export const Playground = {};

// The same popup with fixed settings and an event log, for the Behaviors section.
export const Behavior = {
  args: { layout: 'desktop', longContent: true, showSubtitle: true, title: 'Change password', primaryLabel: 'Save' },
  parameters: { controls: { disable: true } },
  render: (args) => buildDemo(args, { log: true }),
};
