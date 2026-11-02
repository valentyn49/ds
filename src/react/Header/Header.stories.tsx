import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HEADER_FRAME_WIDTHS } from '../../components/header/header.spec.js';
import { PREVIEW_ZOOM } from '../../docs/header-docs.js';
import '../../docs/button-docs.css';
import '../../docs/input-docs.css';
import '../../docs/header-docs.css';
import { Button } from '../Button/Button';
import { Header, HEADER_MARGINS, HEADER_PLATFORMS, HEADER_RESOLUTIONS, HEADER_TYPES } from './Header';
import type { HeaderOpenState, HeaderPanel, HeaderPlatform, HeaderProps, HeaderResolution, HeaderType } from './Header';
import { HeaderParity } from './HeaderParity';

const figma = (property: string) => `Figma property: \`${property}\``;
const frameWidths = HEADER_FRAME_WIDTHS as Record<HeaderResolution, number>;
const zoomFor = PREVIEW_ZOOM as Record<HeaderResolution, number>;
const margins = HEADER_MARGINS as Record<HeaderResolution, number>;

interface FrameProps {
  width: number;
  height?: number;
  zoom?: number;
  label?: string;
  children: React.ReactNode;
  isolate?: boolean;
}

/** A header shown at a real width on a page-colored frame. The frame is also the containing block of the fixed drawer. Documentation only. */
function HeaderFrame({ width, height, zoom, label, children, isolate = false }: FrameProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  return (
    <div className="ds-bd-hd-item">
      {label ? <code className="ds-bd-hd-label">{label}</code> : null}
      <div className="ds-bd-hd-zoom" style={{ zoom: zoom ?? (width > 1000 ? zoomFor.desktop : 1) }}>
        <div className="ds-bd-hd-frame" style={{ width, height }}>
          {isolate ? (
            <>
              <iframe
                title={label ?? 'Header drawer preview'}
                srcDoc="<!doctype html><html><head></head><body></body></html>"
                style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
                onLoad={(event) => {
                  const doc = event.currentTarget.contentDocument!;
                  doc.head.replaceChildren(...[...document.head.querySelectorAll('style, link[rel="stylesheet"]')].map((node) => node.cloneNode(true)));
                  const reset = doc.createElement('style');
                  reset.textContent = 'html, body { margin: 0; height: 100%; }';
                  doc.head.append(reset);
                  setTarget(doc.body);
                }}
              />
              {target && createPortal(children, target)}
            </>
          ) : children}
        </div>
      </div>
    </div>
  );
}

interface PlaygroundArgs extends HeaderProps {
  resolution: HeaderResolution;
}

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Header',
  component: Header,
  parameters: { layout: 'padded' },
  args: { resolution: 'desktop', platform: 'standart', type: 'yes', warning: false },
  argTypes: {
    resolution: {
      description: `${figma('size')}. Documentation only: sets the preview width (desktop 1440px, tablet 744px, mobile 375px). In a page this is not a prop: the header follows its own width with container queries.`,
      control: 'inline-radio',
      options: [...HEADER_RESOLUTIONS],
    },
    platform: { description: figma('platform'), control: 'inline-radio', options: [...HEADER_PLATFORMS], table: { type: { summary: "'standart' | 'enterprise'" } } },
    type: {
      description: `${figma('type')}. In the Figma set \`registration\` is the logo-only header and \`log out\` is the logged-out one. Menus, the cart, the profile and the drawer open when clicked.`,
      control: 'select',
      options: [...HEADER_TYPES],
      table: { type: { summary: "'yes' | 'first purchase' | 'registration' | 'log out'" } },
    },
    warning: { description: figma('warning'), control: 'boolean', if: { arg: 'type', eq: 'yes' } },
    open: { control: false, table: { type: { summary: 'Partial<HeaderOpenState>' } }, description: 'Controlled open state (menu, submenu, drawer, drawer rows). Pair with `onOpenChange`.' },
    defaultOpen: { control: false, table: { type: { summary: 'Partial<HeaderOpenState>' } }, description: 'Initial open state when uncontrolled.' },
    onOpenChange: { control: false, action: 'openChange' },
    searchInputProps: { control: false },
  },
  render: ({ resolution, ...args }) => (
    <div className="ds-bd-hd-demo">
      <HeaderFrame width={frameWidths[resolution]} height={resolution === 'desktop' ? 640 : 812} zoom={zoomFor[resolution]}>
        <Header {...args} />
      </HeaderFrame>
      <p className="ds-bd-note">
        Preview width {frameWidths[resolution]}px, content margin {frameWidths[resolution] >= 1201 ? margins.desktop : margins.tablet}px on each side.
      </p>
    </div>
  ),
};

export default meta;
type Story = StoryObj<PlaygroundArgs>;

export const Playground: Story = {};

const PLATFORMS = HEADER_PLATFORMS as HeaderPlatform[];
const TYPES = HEADER_TYPES as HeaderType[];

/** Every platform × type at the desktop width, and the warning mark. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-hd-stack ds-bd-hd-stack--tight">
      {PLATFORMS.flatMap((platform) =>
        TYPES.map((type) => (
          <HeaderFrame key={`${platform}-${type}`} width={1440} label={`platform=${platform}, type=${type}`}>
            <Header platform={platform} type={type} />
          </HeaderFrame>
        )),
      )}
      <HeaderFrame width={1440} label="warning on (platform=standart, type=yes)">
        <Header platform="standart" type="yes" warning />
      </HeaderFrame>
    </div>
  ),
};

/** The layout follows the header's own width: desktop from 1201px, tablet 577–1200px, mobile up to 576px. */
export const Responsive: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-hd-stack">
      <HeaderFrame width={1440} label="Desktop · 1440px preview · 80px margins">
        <Header />
      </HeaderFrame>
      <HeaderFrame width={744} label="Tablet · 744px preview · 40px margins">
        <Header />
      </HeaderFrame>
      <HeaderFrame width={375} label="Mobile · 375px preview · 40px margins">
        <Header />
      </HeaderFrame>
      <HeaderFrame width={375} label="type=log out · Mobile · 375px · 40px margins">
        <Header type="log out" />
      </HeaderFrame>
      <HeaderFrame width={1280} zoom={0.72} label="1280px preview · 80px margins · the menu does not fit yet, so the tablet layout is kept">
        <Header />
      </HeaderFrame>
    </div>
  ),
};

const PANELS: Array<{ panel: HeaderPanel; label: string; flyout?: boolean; height: number }> = [
  { panel: 'markets', label: 'Socrates Markets open, with the Performance Trackers submenu', flyout: true, height: 640 },
  { panel: 'myMarkets', label: 'My Markets open', height: 300 },
  { panel: 'help', label: 'Help open, with the Members Help submenu', flyout: true, height: 330 },
  { panel: 'profile', label: 'Profile open', height: 460 },
  { panel: 'cart', label: 'Cart open', height: 380 },
];

/** Menus shown open through `defaultOpen`. They still open and close when clicked. */
export const DesktopMenus: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-hd-stack">
      {PANELS.map(({ panel, label, flyout, height }) => (
        <HeaderFrame key={panel} width={1440} height={height} label={label}>
          <Header defaultOpen={{ panel, flyout }} />
        </HeaderFrame>
      ))}
    </div>
  ),
};

/** The tablet and mobile drawer, open through `defaultOpen`. */
export const Drawer: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-hd-row">
      <HeaderFrame isolate width={375} height={812} label="Mobile · Socrates Markets expanded">
        <Header defaultOpen={{ drawer: true, expanded: ['Socrates Markets'] }} />
      </HeaderFrame>
      <HeaderFrame isolate width={375} height={812} label="Mobile · account expanded">
        <Header defaultOpen={{ drawer: true, expanded: ['account'] }} />
      </HeaderFrame>
      <HeaderFrame isolate width={744} height={812} zoom={0.8} label="Tablet · Help expanded">
        <Header defaultOpen={{ drawer: true, expanded: ['Help'] }} />
      </HeaderFrame>
    </div>
  ),
};

function BehaviorDemo({ width, height, label }: { width: number; height: number; label: string }) {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="ds-bd-hd-item">
      <HeaderFrame width={width} height={height} label={label}>
        <Header
          onOpenChange={(next) =>
            setLog((previous) => [`panel=${next.panel ?? 'none'} flyout=${next.flyout} drawer=${next.drawer} expanded=[${next.expanded.join(', ')}]`, ...previous].slice(0, 6))
          }
        />
      </HeaderFrame>
      <ul className="ds-bd-note" aria-label="Open state changes">
        {log.length ? log.map((line, i) => <li key={i}>{line}</li>) : <li>Open a menu, the cart, the profile or the drawer to see the state change here.</li>}
      </ul>
    </div>
  );
}

/** Click the menus (desktop) or the menu button (mobile). Press Escape, click outside, or use Tab inside the drawer. */
export const Behavior: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-hd-stack">
      <BehaviorDemo width={1440} height={480} label="Desktop: disclosure menus" />
      <BehaviorDemo width={375} height={812} label="Mobile: modal drawer" />
    </div>
  ),
};

function ControlledDemo() {
  const [open, setOpen] = useState<Partial<HeaderOpenState>>({ panel: null });
  return (
    <div className="ds-bd-hd-stack">
      <div style={{ display: 'flex', gap: 'var(--ds-space-3x)', flexWrap: 'wrap' }}>
        <Button size={36} onClick={() => setOpen({ panel: 'markets', flyout: true })}>
          Open Markets
        </Button>
        <Button size={36} variant="secondary" onClick={() => setOpen({ panel: 'cart' })}>
          Open cart
        </Button>
        <Button size={36} variant="cancel" onClick={() => setOpen({ panel: null })}>
          Close
        </Button>
      </div>
      <HeaderFrame width={1440} height={640} label="Controlled: the state lives in the page">
        <Header open={open} onOpenChange={setOpen} />
      </HeaderFrame>
    </div>
  );
}

/** With `open` and `onOpenChange` the page owns the state, so it can open a menu from outside. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />,
};

/** Checks that the React Header and the HTML builder produce the same DOM for a matrix of props. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <HeaderParity />,
};
