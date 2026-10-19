import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOTIFICATION_DEFAULTS } from '../../components/notification/notification.spec.js';
import '../../docs/button-docs.css';
import '../../docs/input-docs.css';
import '../../docs/notification-docs.css';
import { Button } from '../Button/Button';
import { Notification, NOTIFICATION_STATE_LIST, NOTIFICATION_TYPE_LIST } from './Notification';
import type { NotificationProps } from './Notification';
import { NotificationParity } from './NotificationParity';

const figma = (property: string) => `Figma property: \`${property}\``;

type PlaygroundArgs = NotificationProps & { showButton?: boolean };

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Notification',
  component: Notification,
  parameters: { layout: 'padded' },
  args: {
    type: 'default',
    state: 'warning',
    children: NOTIFICATION_DEFAULTS.text,
    showIcon: true,
    close: true,
    showButton: false,
    buttonText: NOTIFICATION_DEFAULTS.buttonText,
  },
  argTypes: {
    type: { description: figma('type'), control: 'inline-radio', options: NOTIFICATION_TYPE_LIST },
    state: { description: `${figma('state')}. Six statuses with their own fill, border and icon. Figma defines no hover, focus or disabled state.`, control: 'select', options: NOTIFICATION_STATE_LIST },
    children: { name: 'children', description: figma('Text'), control: 'text' },
    showIcon: { name: 'showIcon', description: figma('show icon'), control: 'boolean' },
    close: { description: `${figma('close')}. Click it to dismiss the banner; the button below the banner shows it again.`, control: 'boolean' },
    showButton: { name: 'show button', description: `${figma('show button')}. In code, passing \`buttonText\` shows the Button.`, control: 'boolean' },
    buttonText: { description: 'The label of the text Button.', control: 'text', if: { arg: 'showButton' } },
    onDismiss: { action: 'dismissed' },
    onButtonClick: { action: 'button clicked' },
  },
};

export default meta;
type Story = StoryObj<PlaygroundArgs>;

const Surface = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-demo-surface">{children}</div>;
const Box = ({ children, width }: { children: React.ReactNode; width?: number }) => (
  <div className="ds-bd-nt-box" style={width ? { maxWidth: width } : undefined}>
    {children}
  </div>
);

/** The close control hides the banner; the documentation button brings it back. */
export const Playground: Story = {
  render: ({ showButton, buttonText, onDismiss, ...args }) => {
    const [open, setOpen] = useState(true);
    return (
      <Surface>
        <div className="ds-bd-nt-demo">
          <Box>
            <Notification
              {...args}
              buttonText={showButton ? buttonText : undefined}
              open={open}
              onDismiss={() => {
                setOpen(false);
                onDismiss?.();
              }}
            />
          </Box>
          <Button variant="secondary" size={36} className="ds-bd-nt-reset" onClick={() => setOpen(true)}>
            Show banner again
          </Button>
        </div>
      </Surface>
    );
  },
};

/** Every combination of the Figma `type` and `state` properties. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <div className="ds-bd-nt-demo">
        {NOTIFICATION_TYPE_LIST.map((type) => (
          <div key={type}>
            <h3>type={type}</h3>
            <div className="ds-bd-nt-stack">
              {NOTIFICATION_STATE_LIST.map((state) => (
                <div key={state} className="ds-bd-nt-item">
                  <code>
                    type={type}, state={state}
                  </code>
                  <Box>
                    <Notification type={type} state={state}>
                      {NOTIFICATION_DEFAULTS.text}
                    </Notification>
                  </Box>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  ),
};

/** The optional text Button sits in the same row as the text, before the close control. */
export const WithButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <div className="ds-bd-nt-stack">
        <Box>
          <Notification type="default" state="info" buttonText="Button">
            {NOTIFICATION_DEFAULTS.text}
          </Notification>
        </Box>
        <Box>
          <Notification type="home" state="warning" buttonText="Update now" close={false}>
            Your plan renews soon.
          </Notification>
        </Box>
      </div>
    </Surface>
  ),
};

/** Figma draws one width (820px); the banner fills its container and the text wraps, so the height grows. */
export const Widths: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <div className="ds-bd-nt-stack">
        <div className="ds-bd-nt-item">
          <code>820px, as in Figma</code>
          <Box width={820}>
            <Notification type="default" state="alert">
              {NOTIFICATION_DEFAULTS.text}
            </Notification>
          </Box>
        </div>
        <div className="ds-bd-nt-item">
          <code>520px</code>
          <Box width={520}>
            <Notification type="default" state="alert" buttonText="Button">
              {NOTIFICATION_DEFAULTS.text}
            </Notification>
          </Box>
        </div>
        <div className="ds-bd-nt-item">
          <code>268px, the width used inside the Header drawer</code>
          <Box width={268}>
            <Notification type="default" state="warning">
              REMINDER: Plus Members get one free credit each month.
            </Notification>
          </Box>
        </div>
      </div>
    </Surface>
  ),
};

function BehaviorDemo() {
  const [open, setOpen] = useState([true, true, true]);
  const visible = open.filter(Boolean).length;
  const close = (index: number) => setOpen((o) => o.map((v, i) => (i === index ? false : v)));
  return (
    <Surface>
      <div className="ds-bd-nt-demo">
        <div className="ds-bd-nt-stack">
          <Box>
            <Notification state="info" buttonText="Button" open={open[0]} onDismiss={() => close(0)}>
              First banner. Close it with the close control.
            </Notification>
          </Box>
          <Box>
            <Notification state="success" open={open[1]} onDismiss={() => close(1)}>
              Second banner. Each banner is dismissed on its own.
            </Notification>
          </Box>
          <Box>
            <Notification state="alert" open={open[2]} onDismiss={() => close(2)}>
              Third banner. This one uses the alert state.
            </Notification>
          </Box>
        </div>
        <p className="ds-bd-nt-readout">
          Visible banners: {visible} of {open.length}
        </p>
        <Button variant="secondary" size={36} className="ds-bd-nt-reset" onClick={() => setOpen([true, true, true])}>
          Show all banners again
        </Button>
      </div>
    </Surface>
  );
}

/** Three banners dismissed independently. The readout and the reset button belong to the documentation. */
export const Behavior: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BehaviorDemo />,
};

/** Checks that the React Notification and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <NotificationParity />,
};
