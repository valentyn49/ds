import { createHeader, HEADER_PLATFORMS, HEADER_TYPES, HEADER_RESOLUTIONS, HEADER_MARGINS } from '../../../components/header/header.js';
import { HEADER_FRAME_WIDTHS } from '../../../components/header/header.spec.js';
import { PREVIEW_ZOOM } from '../../../docs/header-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/header-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Headers/Header',
  parameters: { layout: 'padded' },
  args: { resolution: 'desktop', platform: 'standart', type: 'yes', warning: false },
  argTypes: {
    resolution: {
      description: `${figma('size')}. Sets the preview width: desktop 1440px, tablet 744px, mobile 375px. In a page this is not a prop: the header follows its own width.`,
      control: 'inline-radio',
      options: HEADER_RESOLUTIONS,
    },
    platform: { description: figma('platform'), control: 'inline-radio', options: HEADER_PLATFORMS },
    type: { description: `${figma('type')}. In the Figma set \`registration\` is the logo-only header and \`log out\` is the logged-out one. Menus, the cart, the profile and the drawer open when clicked.`, control: 'select', options: HEADER_TYPES },
    warning: { description: figma('warning'), control: 'boolean', if: { arg: 'type', eq: 'yes' } },
  },
  render: ({ resolution, platform, type, warning }) => {
    const width = HEADER_FRAME_WIDTHS[resolution];
    const zoomWrap = document.createElement('div');
    zoomWrap.className = 'ds-bd-hd-zoom';
    zoomWrap.style.zoom = String(PREVIEW_ZOOM[resolution]);
    const frame = document.createElement('div');
    frame.className = 'ds-bd-hd-frame';
    frame.style.width = `${width}px`;
    frame.style.height = resolution === 'desktop' ? '640px' : '812px';
    frame.append(createHeader({ platform, type, warning }));
    zoomWrap.append(frame);

    const note = document.createElement('p');
    note.className = 'ds-bd-note';
    note.textContent = `Preview width ${width}px, content margin ${width >= 1201 ? HEADER_MARGINS.desktop : HEADER_MARGINS.tablet}px on each side.`;

    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-hd-demo';
    wrap.append(zoomWrap, note);
    return wrap;
  },
};

export const Playground = {};
