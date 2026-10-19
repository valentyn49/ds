import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ACCORDION_DEFAULTS, ACCORDION_STATES } from '../../components/accordion/accordion.spec.js';
import '../../docs/input-docs.css';
import '../../docs/accordion-docs.css';
import { Button } from '../Button/Button';
import { Accordion } from './Accordion';
import { AccordionParity } from './AccordionParity';

const figma = (property: string) => `Figma property: \`${property}\``;

const SAMPLE_TITLE = 'Do changes to my membership (upgrade/downgrade) affect my billing cycle?';

/** Controls of the Live Demo. `state` and the `show…` switches belong to the demo; the component takes `defaultOpen` and presence. */
interface PlaygroundArgs {
  state: 'closed' | 'open';
  title: string;
  content: string;
  showSubtitle: boolean;
  subtitle: string;
  leftIcon: boolean;
  showLink: boolean;
  showButton: boolean;
  onOpenChange?: (open: boolean) => void;
}

const meta = {
  title: 'Components/Accordion',
  parameters: { layout: 'padded' },
  args: {
    state: 'closed',
    title: ACCORDION_DEFAULTS.title,
    content: ACCORDION_DEFAULTS.content,
    showSubtitle: false,
    subtitle: ACCORDION_DEFAULTS.subtitle,
    leftIcon: false,
    showLink: false,
    showButton: false,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. The initial state (\`defaultOpen\`). Click the header, or press Enter or Space on it, to toggle it for real. The content text is sample text for demonstration only.`,
      control: 'inline-radio',
      options: ACCORDION_STATES,
    },
    title: { description: figma('title'), control: 'text' },
    content: { description: `${figma('content')}. Passed as \`children\`.`, control: 'text' },
    showSubtitle: { name: 'Subtitle', description: `${figma('Subtitle')}. Present means shown: pass \`subtitle\`.`, control: 'boolean' },
    subtitle: { description: 'Text of the Subtitle.', control: 'text', if: { arg: 'showSubtitle' } },
    leftIcon: { name: 'Left icon', description: figma('Left icon'), control: 'boolean' },
    showLink: { name: 'Link', description: `${figma('Link')}. Present means shown: pass \`link\`.`, control: 'boolean' },
    showButton: { name: 'Button', description: `${figma('Button')}. Present means shown: pass \`button\`.`, control: 'boolean' },
    onOpenChange: { action: 'open changed' },
  },
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<PlaygroundArgs>;

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-acc-box">{children}</div>;

/** The Controls change the item; clicking the header toggles it for real. */
export const Playground: Story = {
  render: ({ state, title, content, showSubtitle, subtitle, leftIcon, showLink, showButton, onOpenChange }) => (
    <Box>
      <Accordion
        key={state}
        defaultOpen={state === 'open'}
        title={title}
        subtitle={showSubtitle ? subtitle : undefined}
        leftIcon={leftIcon}
        link={showLink ? 'Link' : undefined}
        button={showButton ? 'Button' : undefined}
        onOpenChange={onOpenChange}
      >
        {content}
      </Accordion>
    </Box>
  ),
};

const STATE_NOTES: Record<string, string> = {
  closed: 'Only the header is shown, with the chevron pointing down.',
  open: 'The content is shown under the header, and the chevron points up.',
};

/** The two values of the Figma `state` property. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-acc-states">
      {(ACCORDION_STATES as string[]).map((state) => (
        <div key={state} className="ds-bd-input-state">
          <code>state={state}</code>
          <div className="ds-bd-tile ds-bd-tile--start">
            <Box>
              <Accordion title={SAMPLE_TITLE} defaultOpen={state === 'open'}>
                {ACCORDION_DEFAULTS.content}
              </Accordion>
            </Box>
          </div>
          <span className="ds-bd-note">{STATE_NOTES[state]}</span>
        </div>
      ))}
    </div>
  ),
};

/** Each optional part of the header, as in the HTML page. */
export const Configurations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-overview ds-bd-overview--accordion">
      {[
        { name: 'state=closed', props: {} },
        { name: 'state=open', props: { defaultOpen: true } },
        { name: 'Subtitle', props: { subtitle: ACCORDION_DEFAULTS.subtitle } },
        { name: 'Left icon', props: { leftIcon: true } },
        { name: 'Link', props: { link: ACCORDION_DEFAULTS.linkText } },
        { name: 'Button', props: { button: ACCORDION_DEFAULTS.buttonText } },
      ].map(({ name, props }) => (
        <div key={name} className="ds-bd-overview__item">
          <div className="ds-bd-tile ds-bd-tile--start">
            <Box>
              <Accordion title={SAMPLE_TITLE} {...props}>
                {ACCORDION_DEFAULTS.content}
              </Accordion>
            </Box>
          </div>
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};

function BehaviorDemo() {
  const [openItems, setOpenItems] = useState<boolean[]>([true, false, false]);
  const titles = ['First item', 'Second item', 'Third item'];
  const open = openItems.map((isOpen, i) => (isOpen ? i + 1 : null)).filter(Boolean);
  return (
    <Box>
      <div className="ds-bd-acc-group">
        {titles.map((title, index) => (
          <Accordion
            key={title}
            title={title}
            defaultOpen={index === 0}
            onOpenChange={(isOpen) => setOpenItems((current) => current.map((v, i) => (i === index ? isOpen : v)))}
          >
            {`Sample content for ${title.toLowerCase()}, for demonstration only.`}
          </Accordion>
        ))}
      </div>
      <p className="ds-bd-acc-readout">
        Open items: <code>{open.length ? open.join(', ') : 'none'}</code>
      </p>
    </Box>
  );
}

/** Three independent items. Figma defines a single item, so each one opens and closes on its own. */
export const Behavior: Story = {
  parameters: { controls: { disable: true } },
  render: () => <BehaviorDemo />,
};

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <div className="ds-bd-acc-group">
        <Accordion title="Controlled item" open={open} onOpenChange={setOpen}>
          The state lives in the parent. The header and the Button below both change it.
        </Accordion>
        <div>
          <Button variant="secondary" size={36} onClick={() => setOpen((v) => !v)}>
            {open ? 'Close from outside' : 'Open from outside'}
          </Button>
        </div>
      </div>
      <p className="ds-bd-acc-readout">
        <code>open={String(open)}</code>
      </p>
    </Box>
  );
}

/** Controlled use: pass `open` and update it in `onOpenChange`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />,
};

/** Checks that the React Accordion and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <AccordionParity />,
};
