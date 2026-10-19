import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BUTTON_TYPES } from '../../components/button/button.spec.js';
import { isDarkSurface } from '../../docs/preview-state.js';
import { Button, BUTTON_VARIANTS } from './Button';
import type { ButtonVariant } from './Button';
import { ICON_NAMES } from '../Icon/Icon';
import { ButtonParity } from './ButtonParity';

const figma = (property: string) => `Figma property: \`${property}\``;
const sizesOf = (variant: ButtonVariant): Array<48 | 36> =>
  ((BUTTON_TYPES as Array<{ type: string; sizes: string[] }>).find((t) => t.type === variant)?.sizes ?? ['48', '36']).map(Number) as Array<48 | 36>;

const ICON_OPTIONS = ['none', ...ICON_NAMES];
const ICON_MAPPING = { none: undefined };

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'padded' },
  args: { variant: 'primary', size: 48, children: 'Button', disabled: false },
  argTypes: {
    variant: { description: `${figma('type')}. The Figma name is \`type\`; here it is \`variant\` because \`type\` is the native button attribute.`, control: 'select', options: [...BUTTON_VARIANTS], table: { type: { summary: BUTTON_VARIANTS.map((v) => `'${v}'`).join(' | ') } } },
    size: { description: `${figma('size')}. \`Stroke\` and \`menu\` only exist at 36 and use it whatever is asked.`, control: 'inline-radio', options: [48, 36], table: { type: { summary: '48 | 36' } } },
    children: { name: 'children', description: `${figma('Text')}. The label. Without children the button is icon-only and needs \`aria-label\`.`, control: 'text' },
    leftIcon: { description: `${figma('Show left icon')} + \`left icon\``, control: 'select', options: ICON_OPTIONS, mapping: ICON_MAPPING, table: { type: { summary: 'IconName | ReactElement' } } },
    rightIcon: { description: `${figma('Show right icon')} + \`right icon\``, control: 'select', options: ICON_OPTIONS, mapping: ICON_MAPPING, table: { type: { summary: 'IconName | ReactElement' } } },
    disabled: { description: `${figma('state')} = disabled. Hover and focus are real browser states.`, control: 'boolean' },
    type: { description: 'Native button type. Default `"button"`, so a button in a form does not submit it. Use `"submit"` for the form\'s main action.', control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const Tile = ({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) => (
  <div className={`ds-bd-tile ds-bd-tile--start${dark ? ' ds-bd-tile--dark' : ''}`}>{children}</div>
);

/** Every Figma `type` at every size it has. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-variants">
      {BUTTON_VARIANTS.map((variant) => (
        <div key={variant} className="ds-bd-variant">
          <header>
            <code>type={variant}</code>
          </header>
          <Tile dark={isDarkSurface(variant)}>
            {sizesOf(variant).map((size) => (
              <Button key={size} variant={variant} size={size}>
                Button
              </Button>
            ))}
          </Tile>
        </div>
      ))}
    </div>
  ),
};

const STATES = ['default', 'hover', 'focus', 'disabled'] as const;

/** Hover and focus are forced with `data-preview-state` for display only; in a page they come from the browser. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <table className="ds-bd-states">
      <thead>
        <tr>
          <th></th>
          {STATES.map((state) => (
            <th key={state}>{state}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {BUTTON_VARIANTS.map((variant) => (
          <tr key={variant}>
            <th scope="row">{variant}</th>
            {STATES.map((state) => (
              <td key={state}>
                <Tile dark={isDarkSurface(variant)}>
                  <Button
                    variant={variant}
                    size={sizesOf(variant)[0]}
                    disabled={state === 'disabled'}
                    data-preview-state={state === 'hover' || state === 'focus' ? state : undefined}
                  >
                    Button
                  </Button>
                </Tile>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tile>
      <Button leftIcon="search">Left icon</Button>
      <Button variant="secondary" rightIcon="chevron">
        Right icon
      </Button>
      <Button variant="white" leftIcon="search" rightIcon="chevron">
        Both icons
      </Button>
      <Button variant="primary" size={36} leftIcon="plus">
        Size 36
      </Button>
    </Tile>
  ),
};

/** No visible text, so the button must be named with `aria-label` (or `aria-labelledby`). */
export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tile>
      <Button aria-label="Search" leftIcon="search" />
      <Button aria-label="Close" variant="secondary" leftIcon="close" />
      <Button aria-label="Add" size={36} leftIcon="plus" />
      <Button aria-label="Search, unavailable" leftIcon="search" disabled />
    </Tile>
  ),
};

function FormExample() {
  const [last, setLast] = useState('Nothing pressed yet.');
  return (
    <div className="ds-bd-tile ds-bd-tile--stack">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLast('Submitted: only the Log in button, which has type="submit".');
        }}
        onReset={() => setLast('Reset.')}
        style={{ display: 'flex', gap: 'var(--ds-space-4x)', alignItems: 'center' }}
      >
        <Button type="submit">Log in</Button>
        <Button variant="cancel" onClick={() => setLast('Cancel pressed: it did not submit the form (default type="button").')}>
          Cancel
        </Button>
      </form>
      <span role="status">{last}</span>
    </div>
  );
}

/** `type` defaults to `"button"`, so only the button that asks for it submits a form. This is what a Login form needs. */
export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormExample />,
};

/** Checks that the React Button and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <ButtonParity />,
};
