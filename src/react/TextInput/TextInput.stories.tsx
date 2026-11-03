import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { INPUT_STATES, INPUT_DEFAULTS } from '../../components/text-input/text-input.spec.js';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { INPUT_ICON_NAMES, TextInput } from './TextInput';
import type { InputIconName, TextInputProps } from './TextInput';
import { TextInputParity } from './TextInputParity';
import '../../docs/input-docs.css';

const figma = (property: string) => `Figma property: \`${property}\``;

// Documentation-only: maps a Figma `state` value to props of the real component plus an optional forced focus.
// Figma shows the same string as placeholder (default, focus, disabled) and as entered text (filing, filled, valid, error).
function stateProps(state: string, text: string): { props: Partial<TextInputProps>; forceFocus?: boolean } {
  switch (state) {
    case 'focus':
      return { props: {}, forceFocus: true };
    case 'filing':
      return { props: { defaultValue: text }, forceFocus: true };
    case 'filled':
      return { props: { defaultValue: text } };
    case 'disabled':
      return { props: { disabled: true } };
    case 'valid':
      return { props: { defaultValue: text, validation: 'valid' } };
    case 'error':
      return { props: { defaultValue: text, validation: 'error' } };
    default:
      return { props: {} };
  }
}

interface DemoArgs {
  state: string;
  label: string;
  showLabel: boolean;
  info: boolean;
  placeholder: string;
  showLeftIcon: boolean;
  leftIcon: InputIconName;
  showRightIcon: boolean;
  rightIcon: InputIconName;
  showFootnote: boolean;
  footnote: string;
}

const Box = ({ children }: { children: React.ReactNode }) => <div className="ds-bd-input-box">{children}</div>;
const Tile = ({ children }: { children: React.ReactNode }) => (
  <div className="ds-bd-tile ds-bd-tile--start">
    <Box>{children}</Box>
  </div>
);

const meta = {
  title: 'Components/TextInput',
  parameters: { layout: 'padded' },
  args: {
    state: 'default',
    label: INPUT_DEFAULTS.label,
    showLabel: true,
    info: false,
    placeholder: INPUT_DEFAULTS.placeholder,
    showLeftIcon: false,
    leftIcon: 'info',
    showRightIcon: false,
    rightIcon: 'info',
    showFootnote: true,
    footnote: INPUT_DEFAULTS.footnote,
  },
  argTypes: {
    state: {
      description: `${figma('state')}. Focus and filing are real :focus-within behavior and are forced here for preview only. Disabled, valid and error map to the \`disabled\` and \`validation\` props. Type in the field to try it.`,
      control: 'select',
      options: INPUT_STATES,
    },
    label: { name: 'label', description: `${figma('label text')}. Always required: it names the field.`, control: 'text' },
    showLabel: { name: 'showLabel', description: `${figma('show label')}. When off, the label text becomes \`aria-label\`.`, control: 'boolean' },
    info: { name: 'info', description: `${figma('info')}. Shows the info icon after the label.`, control: 'boolean', if: { arg: 'showLabel' } },
    placeholder: { name: 'placeholder', description: figma('placeholder text'), control: 'text' },
    showLeftIcon: { name: 'show left icon', description: 'Documentation control. In code, `leftIcon` present means shown.', control: 'boolean' },
    leftIcon: { name: 'leftIcon', description: `${figma('left icon')}. Subset of the Figma icon library.`, control: 'select', options: INPUT_ICON_NAMES, if: { arg: 'showLeftIcon' } },
    showRightIcon: { name: 'show right icon', description: 'Documentation control. In code, `rightIcon` present means shown.', control: 'boolean' },
    rightIcon: { name: 'rightIcon', description: `${figma('right icon')}. Subset of the Figma icon library.`, control: 'select', options: INPUT_ICON_NAMES, if: { arg: 'showRightIcon' } },
    showFootnote: { name: 'show footnote', description: 'Documentation control. In code, `footnote` present means shown.', control: 'boolean' },
    footnote: { name: 'footnote', description: figma('footnote_text'), control: 'text', if: { arg: 'showFootnote' } },
  },
  render: (args) => {
    const { props, forceFocus } = stateProps(args.state, args.placeholder);
    return (
      <div className="ds-bd-demo-surface">
        <Box>
          <TextInput
            key={`${args.state}|${args.placeholder}`}
            label={args.label}
            showLabel={args.showLabel}
            info={args.info}
            placeholder={args.placeholder}
            leftIcon={args.showLeftIcon ? args.leftIcon : undefined}
            rightIcon={args.showRightIcon ? args.rightIcon : undefined}
            footnote={args.showFootnote ? args.footnote : undefined}
            rootProps={forceFocus ? { 'data-preview-state': 'focus' } : undefined}
            {...props}
          />
        </Box>
      </div>
    );
  },
} satisfies Meta<DemoArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The seven values of the Figma `state` property. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states">
      {INPUT_STATES.map((state) => {
        const { props, forceFocus } = stateProps(state, INPUT_DEFAULTS.placeholder);
        return (
          <div key={state} className="ds-bd-input-state">
            <code>state={state}</code>
            <Tile>
              <TextInput
                label={INPUT_DEFAULTS.label}
                placeholder={INPUT_DEFAULTS.placeholder}
                footnote={INPUT_DEFAULTS.footnote}
                rootProps={forceFocus ? { 'data-preview-state': 'focus' } : undefined}
                {...props}
              />
            </Tile>
          </div>
        );
      })}
    </div>
  ),
};

const CONFIGURATIONS: Array<{ name: string; note: string; props: Partial<TextInputProps> }> = [
  { name: 'default', note: 'All defaults: label, placeholder and footnote.', props: {} },
  { name: 'info', note: 'Figma property: info. Shows the 20px info icon after the label.', props: { info: true } },
  { name: 'show left icon', note: 'Figma properties: show left icon, left icon.', props: { leftIcon: 'info' } },
  { name: 'show right icon', note: 'Figma properties: show right icon, right icon.', props: { rightIcon: 'info' } },
  { name: 'both icons', note: 'Left and right icons together.', props: { leftIcon: 'info', rightIcon: 'info' } },
  { name: 'show label off', note: 'Figma property: show label.', props: { showLabel: false } },
  { name: 'show footnote off', note: 'Figma property: show footnote.', props: { footnote: undefined } },
];

/** The configurations that come from the component properties, named after them in Figma. */
export const Configurations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-variants">
      {CONFIGURATIONS.map(({ name, note, props }) => (
        <section key={name} className="ds-bd-variant">
          <header>
            <code className="ds-bd-variant__name">{name}</code>
          </header>
          <p>{note}</p>
          <Tile>
            <TextInput label={INPUT_DEFAULTS.label} placeholder={INPUT_DEFAULTS.placeholder} footnote={INPUT_DEFAULTS.footnote} {...props} />
          </Tile>
        </section>
      ))}
    </div>
  ),
};

/** Every icon of the Figma subset in the left slot. */
export const Icons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="ds-bd-input-states">
      {INPUT_ICON_NAMES.map((icon) => (
        <div key={icon} className="ds-bd-input-state">
          <code>{icon}</code>
          <Tile>
            <TextInput label="Icon" leftIcon={icon} rightIcon={icon} placeholder={icon} />
          </Tile>
        </div>
      ))}
    </div>
  ),
};

function ValidationExample() {
  const [value, setValue] = useState('');
  const validation = value === '' ? undefined : /^\S+@\S+\.\S+$/.test(value) ? 'valid' : 'error';
  return (
    <Tile>
      <TextInput
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="name@example.com"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        validation={validation}
        footnote={validation === 'error' ? 'Enter an address like name@example.com' : validation === 'valid' ? 'Looks good' : 'We’ll never share your details.'}
        leftIcon="search"
      />
    </Tile>
  );
}

/** A controlled input. `validation` is set by the app; `error` also sets `aria-invalid`. Type an address to try it. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ValidationExample />,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(values: { email: string; password: string; accepted: boolean }) {
  const errors = {
    email: '',
    password: '',
    accepted: '',
  };

  const email = values.email.trim();
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  if (values.password.length < 6 || values.password.length > 48) {
    errors.password = 'Password must be between 6 and 48 characters.';
  }

  if (!values.accepted) errors.accepted = 'Select to continue.';

  return errors;
}

function TermsButton({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      type="button"
      className="ds-bd-form-link"
      role="link"
      aria-label="Terms and Conditions"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
    >
      Terms and Conditions
    </button>
  );
}

function FormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState('Nothing submitted yet.');

  const errors = validateForm({ email, password, accepted });
  const hasErrors = Boolean(errors.email || errors.password || errors.accepted);
  const showErrors = submitted;

  return (
    <div className="ds-bd-tile ds-bd-tile--stack">
      <form
        className="ds-bd-validation-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);

          if (hasErrors) {
            setResult('Validation failed. Fix the highlighted fields and submit again.');
            return;
          }

          setResult(`Validated successfully: email=${email.trim()}, password length=${password.length}, terms accepted=${accepted ? 'yes' : 'no'}`);
        }}
      >
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (submitted) setResult('Nothing submitted yet.');
          }}
          validation={showErrors && errors.email ? 'error' : undefined}
          footnote={showErrors ? errors.email || 'We’ll never share your details.' : 'We’ll never share your details.'}
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (submitted) setResult('Nothing submitted yet.');
          }}
          validation={showErrors && errors.password ? 'error' : undefined}
          footnote={showErrors ? errors.password || 'Use 6 to 48 characters.' : 'Use 6 to 48 characters.'}
        />
        <div className="ds-bd-checkbox-field">
          <Checkbox
            name="accept-terms"
            checked={accepted}
            onChange={(event) => {
              setAccepted(event.target.checked);
              if (submitted) setResult('Nothing submitted yet.');
            }}
            aria-describedby={showErrors && errors.accepted ? 'terms-error' : undefined}
            title={
              <>
                Agree with{' '}
                <TermsButton onActivate={() => setResult('Terms and Conditions activated. No destination URL is specified in this experiment.')} />
              </>
            }
            showCaption={false}
          />
          {showErrors && errors.accepted ? (
            <p className="ds-bd-form-error" id="terms-error">
              {errors.accepted}
            </p>
          ) : null}
        </div>
        <Button type="submit">Submit</Button>
      </form>
      <span role="status">{result}</span>
    </div>
  );
}

/** Interactive validation experiment using the existing TextInput, Checkbox and Button components plus their existing error presentation. Test empty email, invalid email format, password length limits, unchecked Terms and Conditions, multiple simultaneous errors and successful validation. */
export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FormExample />,
};

/** Checks that the React TextInput and the HTML builder produce the same DOM for every combination. */
export const ParityWithHtml: Story = {
  name: 'Parity with the HTML component',
  parameters: { controls: { disable: true } },
  render: () => <TextInputParity />,
};
