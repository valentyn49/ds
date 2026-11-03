import { forwardRef, useCallback, useId, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, InputHTMLAttributes, MouseEvent } from 'react';
import '../../components/text-input/text-input.css';
import { INPUT_ICON_PATHS } from '../../components/text-input/icons.js';
import { cx } from '../utils/cx';

/** Names of the icons the Figma input can show (the shared icon subset plus `info`, its default). */
export type InputIconName = keyof typeof INPUT_ICON_PATHS;
export const INPUT_ICON_NAMES = Object.keys(INPUT_ICON_PATHS) as InputIconName[];

/** Figma `valid` and `error` states. The other Figma states are native behavior (focus, value, disabled). */
export type TextInputValidation = 'valid' | 'error';

type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

/** Extra attributes for the outer `div` (id, `data-*`, `aria-*`, event handlers). */
export type TextInputRootProps = Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'> & DataAttributes;

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'style' | 'size'> {
  /** Figma `label text`. Always required: it names the field. See `showLabel`. */
  label: string;
  /** Figma `show label`. When false the label is not drawn and the text is used as `aria-label`. */
  showLabel?: boolean;
  /** Figma `info`. Shows the info icon after the label. Needs the label to be shown. */
  info?: boolean;
  /** Figma `show left icon` + `left icon`: present means shown. */
  leftIcon?: InputIconName;
  /** Figma `show right icon` + `right icon`: present means shown. */
  rightIcon?: InputIconName;
  /** Figma `show footnote` + `footnote_text`: present means shown. Linked to the field with `aria-describedby`. */
  footnote?: string;
  /** Figma states `valid` and `error`. `error` also sets `aria-invalid`. */
  validation?: TextInputValidation;
  /** Class names for the outer element. */
  className?: string;
  /** Style of the outer element. */
  style?: CSSProperties;
  /** Attributes for the outer element. Everything else is passed to the `<input>`. */
  rootProps?: TextInputRootProps;
}

function InputIcon({ name }: { name: InputIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={INPUT_ICON_PATHS[name]} />
    </svg>
  );
}

/**
 * Test Design System text input. Same markup and classes as the HTML `textInputHTML()` builder, styled by the same
 * `text-input.css`. Focus, filled and disabled are native behavior (`:focus-within`, a value, `disabled`).
 * Props that are not listed here (`value`, `defaultValue`, `onChange`, `name`, `type`, `required`, ...) go to the
 * `<input>`, so it works controlled or uncontrolled. `type` defaults to `"text"`. The `ref` is the `<input>`.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    showLabel = true,
    info = false,
    leftIcon,
    rightIcon,
    footnote,
    validation,
    disabled = false,
    id,
    type = 'text',
    className,
    style,
    rootProps,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const footnoteId = `${inputId}-footnote`;
  const state = validation === 'valid' || validation === 'error' ? validation : undefined;
  const hasFootnote = footnote !== undefined && footnote !== null;

  const controlRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      controlRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Pressing anywhere in the field (icons, padding) focuses the text, like the HTML component.
  const focusControl = (event: MouseEvent<HTMLDivElement>) => {
    const control = controlRef.current;
    if (control && event.target !== control && !control.disabled) {
      event.preventDefault();
      control.focus();
    }
  };

  const describedBy = [ariaDescribedBy, hasFootnote ? footnoteId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div {...rootProps} className={cx('ds-input', disabled && 'ds-input--disabled', state && `ds-input--${state}`, className)} style={style}>
      {showLabel ? (
        <div className="ds-input__label">
          <label className="ds-input__label-text" htmlFor={inputId}>
            {label}
          </label>
          {info ? (
            <span className="ds-input__info">
              <InputIcon name="info" />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="ds-input__field" onMouseDown={focusControl}>
        {leftIcon ? (
          <span className="ds-input__icon ds-input__icon--left">
            <InputIcon name={leftIcon} />
          </span>
        ) : null}
        <span className="ds-input__value">
          <input
            {...rest}
            ref={setRefs}
            className="ds-input__control"
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={state === 'error' ? 'true' : ariaInvalid}
            aria-label={showLabel ? ariaLabel : label}
            aria-describedby={describedBy}
          />
        </span>
        {rightIcon ? (
          <span className="ds-input__icon ds-input__icon--right">
            <InputIcon name={rightIcon} />
          </span>
        ) : null}
      </div>
      {hasFootnote ? (
        <div className="ds-input__footnote" id={footnoteId}>
          {footnote}
        </div>
      ) : null}
    </div>
  );
});
