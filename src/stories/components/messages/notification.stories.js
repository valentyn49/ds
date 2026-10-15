import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_STATES, NOTIFICATION_DEFAULTS } from '../../../components/notification/notification.js';
import { createButton } from '../../../components/button/button.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/notification-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

// Documentation-only: a button that brings a dismissed banner back. It is not part of the component.
const resetButton = (label, onClick) => {
  const button = createButton({ variant: 'secondary', size: '36', text: label });
  button.addEventListener('click', onClick);
  return button;
};

export default {
  title: 'Components/Messages/notification',
  parameters: { layout: 'padded' },
  args: {
    type: 'default',
    state: 'warning',
    text: NOTIFICATION_DEFAULTS.text,
    showIcon: true,
    close: true,
    showButton: false,
  },
  argTypes: {
    type: { description: figma('type'), control: 'inline-radio', options: NOTIFICATION_TYPES },
    state: { description: `${figma('state')}. Six statuses with their own fill, border and icon. Figma defines no hover, focus or disabled state.`, control: 'select', options: NOTIFICATION_STATES },
    text: { name: 'Text', description: figma('Text'), control: 'text' },
    showIcon: { name: 'show icon', description: figma('show icon'), control: 'boolean' },
    close: { name: 'close', description: `${figma('close')}. Click it to dismiss the banner; the documentation button below shows it again.`, control: 'boolean' },
    showButton: { name: 'show button', description: figma('show button'), control: 'boolean' },
  },
  render: (args) => {
    const banner = createNotification(args);
    const box = document.createElement('div');
    box.className = 'ds-bd-nt-box';
    box.append(banner);

    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-nt-demo';
    const reset = resetButton('Show banner again', () => banner.show());
    reset.classList.add('ds-bd-nt-reset');
    wrap.append(box, reset);

    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(wrap);
    return surface;
  },
};

export const Playground = {};

// Three banners that are dismissed independently. The readout and the reset button belong to the documentation.
export const Behavior = {
  parameters: { controls: { disable: true } },
  render: () => {
    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-nt-demo';

    const banners = [
      createNotification({ type: 'default', state: 'info', text: 'First banner. Close it with the close control.', showButton: true }),
      createNotification({ type: 'default', state: 'success', text: 'Second banner. Each banner is dismissed on its own.' }),
      createNotification({ type: 'default', state: 'alert', text: 'Third banner. This one uses the alert state.' }),
    ];
    const stack = document.createElement('div');
    stack.className = 'ds-bd-nt-stack';
    banners.forEach((b) => {
      const box = document.createElement('div');
      box.className = 'ds-bd-nt-box';
      box.append(b);
      stack.append(box);
    });

    const readout = document.createElement('p');
    readout.className = 'ds-bd-nt-readout';
    const update = () => {
      const visible = banners.filter((b) => !b.hidden).length;
      readout.textContent = `Visible banners: ${visible} of ${banners.length}`;
    };
    banners.forEach((b) => b.addEventListener('ds-notification-dismiss', update));
    update();

    const reset = resetButton('Show all banners again', () => {
      banners.forEach((b) => b.show());
      update();
    });
    reset.classList.add('ds-bd-nt-reset');

    wrap.append(stack, readout, reset);
    const surface = document.createElement('div');
    surface.className = 'ds-bd-demo-surface';
    surface.append(wrap);
    return surface;
  },
};
