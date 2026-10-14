import { createFooter, FOOTER_SIZES, FOOTER_TYPES, FOOTER_RESOLUTIONS } from '../../../components/footer/footer.js';
import { FOOTER_FRAME_WIDTHS, FOOTER_MARGINS } from '../../../components/footer/footer.spec.js';
import { PREVIEW_ZOOM } from '../../../docs/footer-docs.js';
import '../../../docs/button-docs.css';
import '../../../docs/input-docs.css';
import '../../../docs/footer-docs.css';

const figma = (property) => `Figma property: \`${property}\``;

export default {
  title: 'Components/Footer/footer',
  parameters: { layout: 'padded' },
  args: { resolution: 'desktop', size: 'big', type: 'standart' },
  argTypes: {
    resolution: {
      description: `${figma('resolution')}. Sets the preview width (desktop 1440px, tablet 744px, mobile 392px or 375px for the small size). In a page this is not a prop: the footer follows its own width.`,
      control: 'inline-radio',
      options: FOOTER_RESOLUTIONS,
    },
    size: { description: figma('size'), control: 'inline-radio', options: FOOTER_SIZES },
    type: { description: `${figma('type')}. Only the big size has types.`, control: 'inline-radio', options: FOOTER_TYPES, if: { arg: 'size', eq: 'big' } },
  },
  render: ({ resolution, size, type }) => {
    const width = FOOTER_FRAME_WIDTHS[size][resolution];

    const zoom = document.createElement('div');
    zoom.className = 'ds-bd-ft-zoom';
    zoom.style.zoom = String(PREVIEW_ZOOM[resolution]);
    const frame = document.createElement('div');
    frame.className = 'ds-bd-ft-frame';
    frame.style.width = `${width}px`;
    frame.append(createFooter({ size, type }));
    zoom.append(frame);

    const note = document.createElement('p');
    note.className = 'ds-bd-note';
    note.textContent = `Preview width ${width}px, content margin ${FOOTER_MARGINS[resolution]}px on each side.`;

    const wrap = document.createElement('div');
    wrap.className = 'ds-bd-ft-demo';
    wrap.append(zoom, note);
    return wrap;
  },
};

export const Playground = {};
