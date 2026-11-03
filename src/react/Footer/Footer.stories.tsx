import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FOOTER_SIZES, FOOTER_TYPES, FOOTER_RESOLUTIONS } from '../../components/footer/footer.js';
import { FOOTER_FRAME_WIDTHS, FOOTER_MARGINS } from '../../components/footer/footer.spec.js';
import { PREVIEW_ZOOM } from '../../docs/footer-docs.js';
import '../../docs/button-docs.css';
import '../../docs/input-docs.css';
import '../../docs/footer-docs.css';
import { Footer } from './Footer';
import type { FooterSize, FooterType } from './Footer';
import { Logo } from './Logo';
import { FooterParity } from './FooterParity';

const figma = (property: string) => `Figma property: \`${property}\``;
type Resolution = 'desktop' | 'tablet' | 'mobile';

/** A footer at the width of a Figma frame, scaled down to fit this page. The layout is decided by the footer's real width. */
function Frame({ size, type, resolution, showMargins = false, label }: { size: FooterSize; type: FooterType; resolution: Resolution; showMargins?: boolean; label?: string }) {
  const width = (FOOTER_FRAME_WIDTHS as Record<string, Record<string, number>>)[size][resolution];
  const margin = (FOOTER_MARGINS as Record<string, number>)[resolution];
  return (
    <div className="ds-bd-ft-item">
      {label ? <code className="ds-bd-ft-label">{label}</code> : null}
      <div className="ds-bd-ft-zoom" style={{ zoom: (PREVIEW_ZOOM as Record<string, number>)[resolution] }}>
        <div className="ds-bd-ft-frame" style={{ width }}>
          <Footer size={size} type={type} />
          {showMargins ? (
            <>
              <span className="ds-bd-ft-band ds-bd-ft-band--left" style={{ width: margin }}>
                <b>{margin}px</b>
              </span>
              <span className="ds-bd-ft-band ds-bd-ft-band--right" style={{ width: margin }}>
                <b>{margin}px</b>
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: { layout: 'padded' },
  args: { size: 'big', type: 'standart' },
  argTypes: {
    size: { description: figma('size'), control: 'inline-radio', options: [...FOOTER_SIZES] },
    type: { description: `${figma('type')}. Only the big size has types.`, control: 'inline-radio', options: [...FOOTER_TYPES], if: { arg: 'size', eq: 'big' } },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `preview` is a documentation control: in a page the footer follows its own width, it has no `resolution` prop. */
export const Playground: Story = {
  argTypes: {
    preview: {
      name: 'preview',
      description: 'Documentation only. Sets the preview width (desktop 1440px, tablet 744px, mobile 392px, or 375px for the small size). The Figma `resolution` is not a prop.',
      control: 'inline-radio',
      options: [...FOOTER_RESOLUTIONS],
    },
  } as never,
  args: { preview: 'desktop' } as never,
  render: ({ size = 'big', type = 'standart', ...rest }) => {
    const resolution = ((rest as unknown as { preview?: Resolution }).preview ?? 'desktop') as Resolution;
    const margin = (FOOTER_MARGINS as Record<string, number>)[resolution];
    const width = (FOOTER_FRAME_WIDTHS as Record<string, Record<string, number>>)[size][resolution];
    return (
      <div className="ds-bd-ft-demo">
        <Frame size={size} type={type} resolution={resolution} />
        <p className="ds-bd-note">
          Preview width {width}px, content margin {margin}px on each side.
        </p>
      </div>
    );
  },
};

/** The big footer in both Figma types. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-ft-stack">
      <Frame size="big" type="standart" resolution="desktop" label="size=big, resolution=desktop, type=standart" />
      <Frame size="big" type="enterprise" resolution="desktop" label="size=big, resolution=desktop, type=enterprise" />
    </div>
  ),
};

/** The small footer: one centered line. */
export const Small: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-ft-stack">
      <Frame size="small" type="standart" resolution="desktop" label="size=small, resolution=desktop" />
      <Frame size="small" type="standart" resolution="mobile" label="size=small, resolution=mobile" />
    </div>
  ),
};

/** The three layouts, with the horizontal content margins marked. */
export const Responsive: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-ft-stack">
      {(FOOTER_RESOLUTIONS as Resolution[]).map((resolution) => (
        <Frame key={resolution} size="big" type="standart" resolution={resolution} showMargins label={`size=big, resolution=${resolution}, type=standart`} />
      ))}
    </div>
  ),
};

function BehaviorExample() {
  const [last, setLast] = useState('No link pressed yet.');
  return (
    <div className="ds-bd-ft-demo">
      <div
        onClick={(event) => {
          const link = (event.target as Element).closest('a');
          if (link) setLast(`Pressed "${link.textContent}". defaultPrevented: ${String(event.defaultPrevented)}, address: ${window.location.hash || '(no hash)'}`);
        }}
      >
        <Footer />
      </div>
      <p className="ds-bd-note" role="status">
        {last}
      </p>
    </div>
  );
}

/** Figma gives no link destinations, so the placeholder "#" links do not navigate. Press a link. */
export const Behavior: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BehaviorExample />,
};

/** The Test Design System logo, exported for reuse (the Header uses it too). */
export const LogoOnly: Story = {
  name: 'Logo',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-tile ds-bd-tile--dark">
      <Logo />
    </div>
  ),
};

/** Checks that the React Footer and the HTML builder produce the same DOM. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <FooterParity />,
};
