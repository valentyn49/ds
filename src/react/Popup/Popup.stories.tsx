import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { POPUP_DEFAULTS, POPUP_FRAMES } from '../../components/popup/popup.spec.js';
import { PREVIEW_ZOOM, SCROLL_SUBTITLE, mockPageHTML } from '../../docs/popup-docs.js';
import '../../docs/input-docs.css';
import '../../docs/popup-docs.css';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { Popup, PopupView, POPUP_TYPE_LIST, POPUP_WIDTH_LIST } from './Popup';
import type { PopupCloseReason, PopupType, PopupViewProps, PopupWidth } from './Popup';
import { PopupParity } from './PopupParity';

const figma = (property: string) => `Figma property: \`${property}\``;

type Layout = 'desktop' | 'tablet' | 'mobile' | 'viewport';
type Resolution = 'desktop' | 'tablet' | 'mobile';
const LAYOUTS: Layout[] = ['desktop', 'tablet', 'mobile', 'viewport'];

/** Sample content for the scrolling examples: nine fields 16px apart, as in the Figma Behaviour section. */
function Fields({ count = 9 }: { count?: number }) {
  return (
    <div className="ds-bd-pp-fields">
      {Array.from({ length: count }, (_, i) => (
        <TextInput key={i} label="Enter new password" placeholder="Enter current password" />
      ))}
    </div>
  );
}

const Page = ({ resolution }: { resolution: Resolution }) => <div dangerouslySetInnerHTML={{ __html: mockPageHTML(resolution) }} />;

interface DemoArgs {
  layout: Layout;
  type: PopupType;
  width: PopupWidth;
  title: string;
  showSubtitle: boolean;
  subtitle: string;
  body: string;
  longContent: boolean;
  showCancel: boolean;
  cancelLabel: string;
  primaryLabel: string;
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  primaryCloses: boolean;
}

/** Listens to the bubbling `ds-popup-*` events dispatched on the popup overlay. */
function useEventLog(target: HTMLElement | null, onEvent: (name: string, detail: { reason?: PopupCloseReason }) => void) {
  const handler = useRef(onEvent);
  handler.current = onEvent;
  useEffect(() => {
    const el = target ?? document.body;
    const names = ['ds-popup-open', 'ds-popup-primary', 'ds-popup-cancel', 'ds-popup-close'];
    const listener = (event: Event) => handler.current(event.type, (event as CustomEvent).detail ?? {});
    names.forEach((n) => el.addEventListener(n, listener));
    return () => names.forEach((n) => el.removeEventListener(n, listener));
  }, [target]);
}

/** The real Popup behind a trigger Button, shown in a desktop, tablet or mobile frame or over the whole page. */
function LiveDemo(args: DemoArgs & { log?: boolean }) {
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('Closed.');
  const [events, setEvents] = useState<string[]>([]);
  const resolution: Resolution | null = args.layout === 'viewport' ? null : args.layout;
  const inViewport = resolution === null;
  const container = inViewport ? undefined : frame;

  useEventLog(inViewport ? document.body : frame, (name, detail) => {
    const text = name === 'ds-popup-open' ? 'Open. Focus is on the popup; Tab stays inside it.' : name === 'ds-popup-primary' ? (args.primaryCloses ? 'Primary action pressed. This demo then closes the popup.' : 'Primary action pressed. The popup stays open: the application decides.') : name === 'ds-popup-close' ? `Closed (${detail.reason}). Focus returns to "Open popup".` : 'Cancel pressed.';
    if (name !== 'ds-popup-cancel') setStatus(text);
    setEvents((list) => [`${name}${detail.reason ? ` · ${detail.reason}` : ''}`, ...list].slice(0, 12));
  });

  const trigger = (
    <Button className={inViewport ? undefined : 'ds-bd-pp-trigger'} onClick={() => setOpen(true)}>
      Open popup
    </Button>
  );

  const popup = (
    <Popup
      open={open}
      container={container}
      type={args.type}
      width={args.width}
      title={args.title}
      subtitle={args.showSubtitle ? args.subtitle : undefined}
      primaryLabel={args.primaryLabel}
      cancelLabel={args.cancelLabel}
      showCancel={args.showCancel}
      closeOnEscape={args.closeOnEscape}
      closeOnBackdrop={args.closeOnBackdrop}
      onClose={() => setOpen(false)}
      onPrimary={() => {
        if (args.primaryCloses) setOpen(false);
      }}
    >
      {args.longContent ? <Fields /> : args.body}
    </Popup>
  );

  let stage: ReactNode;
  if (resolution === null) {
    stage = (
      <div className="ds-bd-pp-viewport-note">
        <p className="ds-bd-pp-status">The popup opens over the whole page, as it does in a product. Scrolling the page is locked while it is open.</p>
        {trigger}
        {popup}
      </div>
    );
  } else {
    const size = POPUP_FRAMES[resolution];
    stage = (
      <div style={{ zoom: PREVIEW_ZOOM[resolution] }}>
        <div ref={setFrame} className={`ds-bd-pp-demo-frame ds-bd-pp-demo-frame--${resolution}`} style={{ width: size.width, height: size.height }}>
          <Page resolution={resolution} />
          {trigger}
        </div>
        {popup}
      </div>
    );
  }

  return (
    <div className="ds-bd-demo-surface ds-bd-pp-demo-surface">
      <div className="ds-bd-pp-demo">
        {stage}
        <p className="ds-bd-pp-status">{status}</p>
        {args.log ? (
          <ul className="ds-bd-pp-log">
            {events.map((line, i) => (
              <li key={`${i}-${line}`}>
                <code>{line}</code>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Popup',
  parameters: { layout: 'padded' },
  args: {
    layout: 'desktop',
    type: 'default',
    width: 600,
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
      description: 'Documentation only. Sets the width of the preview: desktop 1440px, tablet 744px, mobile 375px. In a product this is not a prop: the popup follows the width of its container. "viewport" opens the popup over this whole page.',
      control: 'inline-radio',
      options: LAYOUTS,
    },
    type: { description: `${figma('type')}. Changes the header: default, or an illustration above centered text.`, control: 'inline-radio', options: POPUP_TYPE_LIST },
    width: { description: 'Figma frames `600` and `480`. Desktop only; tablet and mobile fill the width.', control: 'inline-radio', options: POPUP_WIDTH_LIST },
    title: { description: 'Title text.', control: 'text' },
    showSubtitle: { name: 'subTitle', description: figma('subTitle'), control: 'boolean' },
    subtitle: { name: 'sub', description: figma('sub'), control: 'text', if: { arg: 'showSubtitle' } },
    body: { description: 'Body text. In code `children` takes any content.', control: 'text', if: { arg: 'longContent', truthy: false } },
    longContent: { name: 'long content', description: 'Documentation only. Fills the body with nine fields so the content scrolls, as in the Figma Behaviour section.', control: 'boolean' },
    showCancel: { name: 'show cancel', description: 'Shows the Cancel action. Cancel is only drawn on desktop in Figma; on tablet and mobile it is hidden whatever this says.', control: 'boolean' },
    cancelLabel: { name: 'cancel label', description: 'Label of the Cancel Button.', control: 'text', if: { arg: 'showCancel' } },
    primaryLabel: { name: 'primary label', description: 'Label of the primary Button.', control: 'text' },
    closeOnEscape: { name: 'closeOnEscape', description: 'Behavior, not in Figma. Escape closes the popup.', control: 'boolean' },
    closeOnBackdrop: { name: 'closeOnBackdrop', description: 'Behavior, not in Figma. A click on the backdrop closes the popup.', control: 'boolean' },
    primaryCloses: { name: 'primary closes', description: 'Documentation only. The primary action never closes the popup by itself; the application decides. This switch shows an application that closes it.', control: 'boolean' },
  },
  render: (args) => <LiveDemo {...args} />,
} satisfies Meta<DemoArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The real popup. Change a control while it is open and the open popup follows. */
export const Playground: Story = {};

/** The same popup with fixed settings and an event log, for the behavior section. */
export const Behavior: Story = {
  args: { layout: 'desktop', longContent: true, showSubtitle: true, title: 'Change password', primaryLabel: 'Save' },
  parameters: { controls: { disable: true } },
  render: (args) => <LiveDemo {...args} log />,
};

// ---------- static previews ----------

interface FrameProps extends Omit<PopupViewProps, 'mode' | 'frame' | 'behind'> {
  resolution: Resolution;
  label: string;
  width?: PopupWidth;
  frameWidth?: number;
  frameHeight?: number;
  zoom?: number;
}

function StaticFrame({ resolution, label, frameWidth, frameHeight, zoom = PREVIEW_ZOOM[resolution], ...view }: FrameProps) {
  const base = POPUP_FRAMES[resolution];
  return (
    <div className="ds-bd-pp-item">
      <code className="ds-bd-pp-label">{label}</code>
      <div className="ds-bd-pp-zoom" style={{ zoom }}>
        <PopupView {...view} mode="static" frame={{ width: frameWidth ?? base.width, height: frameHeight ?? base.height }} behind={<Page resolution={resolution} />} />
      </div>
    </div>
  );
}

const BODY = POPUP_DEFAULTS.body;

/** Figma `type`: the default header, and the two status headers with an illustration. Desktop and mobile. */
export const Types: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      {POPUP_TYPE_LIST.map((type) => (
        <div key={type}>
          <h3>type={type}</h3>
          <div className="ds-bd-pp-pair">
            <StaticFrame resolution="desktop" label={`size=desktop, type=${type}`} frameWidth={1000} frameHeight={type === 'default' ? 440 : 700} zoom={0.5} type={type} title="Customise dashboard" subtitle={SCROLL_SUBTITLE}>
              {BODY}
            </StaticFrame>
            <StaticFrame resolution="mobile" label={`size=mobile, type=${type}`} frameHeight={type === 'default' ? 360 : 600} zoom={0.5} type={type} title="Customise dashboard" subtitle={SCROLL_SUBTITLE}>
              {BODY}
            </StaticFrame>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** The two desktop widths: the Figma frames `600` and `480`. */
export const Widths: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-pp-stack">
      {POPUP_WIDTH_LIST.map((width) => (
        <StaticFrame key={width} resolution="desktop" label={`width ${width}`} frameWidth={1000} frameHeight={440} zoom={0.9} width={width} title={POPUP_DEFAULTS.title}>
          {BODY}
        </StaticFrame>
      ))}
    </div>
  ),
};

/** The look when the content does not fit: the header and footer stay, the body scrolls. */
export const LongContent: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-pp-stack">
      <StaticFrame resolution="desktop" label="Content scrolls: the header and footer stay, the body scrolls between them" frameWidth={1000} frameHeight={640} zoom={0.9} scrolling title="Change password" subtitle={SCROLL_SUBTITLE} primaryLabel="Save">
        <Fields />
      </StaticFrame>
    </div>
  ),
};

/** Desktop, tablet and mobile, with short and with long content. */
export const Responsive: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <h3>Desktop</h3>
      <div className="ds-bd-pp-stack">
        <StaticFrame resolution="desktop" label="1440 × 900, short content" title={POPUP_DEFAULTS.title}>
          {BODY}
        </StaticFrame>
        <StaticFrame resolution="desktop" label="1440 × 900, content scrolls" scrolling title="Change password" subtitle={SCROLL_SUBTITLE} primaryLabel="Save">
          <Fields />
        </StaticFrame>
      </div>
      {(['tablet', 'mobile'] as const).map((resolution) => (
        <div key={resolution}>
          <h3>{resolution === 'tablet' ? 'Tablet' : 'Mobile'}</h3>
          <div className="ds-bd-pp-pair">
            <StaticFrame resolution={resolution} label={`${POPUP_FRAMES[resolution].width} × ${POPUP_FRAMES[resolution].height}, short content`} title={POPUP_DEFAULTS.title}>
              {BODY}
            </StaticFrame>
            <StaticFrame resolution={resolution} label={`${POPUP_FRAMES[resolution].width} × ${POPUP_FRAMES[resolution].height}, content scrolls`} scrolling title="Change password" subtitle={SCROLL_SUBTITLE} primaryLabel="Save">
              <Fields />
            </StaticFrame>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Checks that the React markup and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: StoryObj = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <PopupParity />,
};
