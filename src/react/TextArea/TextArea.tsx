import { forwardRef, useCallback, useId, useRef } from 'react';
import type { CSSProperties, MouseEvent, ReactElement, TextareaHTMLAttributes } from 'react';
import '../../components/text-area/text-area.css';
import { TEXT_AREA_DEFAULTS, TEXT_AREA_VALIDATIONS } from '../../components/text-area/text-area.spec.js';
import { cx } from '../utils/cx';
import { InputIcon } from './InputIcon';
import type { InputIconName } from './InputIcon';

export type TextAreaValidation = 'valid' | 'error';

type NativeTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style' | 'children'>;

export interface TextAreaProps extends NativeTextAreaProps {
  /** Figma `show label`. Default `true`. When off, `label` becomes the field's `aria-label`. */
  showLabel?: boolean;
  /** Figma `label text`. */
  label?: string;
  /** Figma `info`: shows the info icon after the label. */
  info?: boolean;
  /** Figma `show left icon` + `left icon`: an icon name, or your own element. Present means shown. */
  leftIcon?: InputIconName | ReactElement;
  /** Figma `show right icon` + `right icon`. */
  rightIcon?: InputIconName | ReactElement;
  /** Figma `show footnote`. Default `true`. */
  showFootnote?: boolean;
  /** Figma `footnote_text`. Linked to the field with `aria-describedby`. */
  footnote?: string;
  /** Figma states `valid` and `error`. `error` also sets `aria-invalid`. */
  validation?: TextAreaValidation;
  /** Class name of the component's root element (the native attributes go to the `<textarea>`). */
  className?: string;
  /** Style of the component's root element. */
  style?: CSSProperties;
  /** Documentation only: draws the Figma `focus` / `filing` look without focusing the field. */
  'data-preview-state'?: 'focus';
}

function renderIcon(icon: InputIconName | ReactElement | undefined, side: 'left' | 'right') {
  if (icon === undefined || icon === null) return null;
  return (
    <span className={`ds-text-area__icon ds-text-area__icon--${side}`}>
      {typeof icon === 'string' ? <InputIcon name={icon} /> : icon}
    </span>
  );
}

/**
 * Test Design System text area: an optional label, a multi-line field with optional icons, and an optional footnote.
 * Same markup and classes as the HTML `textAreaHTML()` builder, styled by the same `text-area.css`.
 * Works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`). Focus, filing and filled are real browser
 * states (`:focus-within`, a non-empty value); `disabled` is the native attribute. A click anywhere in the field
 * (icons and padding included) focuses the text area.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    id,
    label = TEXT_AREA_DEFAULTS.label,
    showLabel = true,
    info = false,
    placeholder = TEXT_AREA_DEFAULTS.placeholder,
    leftIcon,
    rightIcon,
    showFootnote = true,
    footnote = TEXT_AREA_DEFAULTS.footnote,
    validation,
    disabled = false,
    rows = 1,
    className,
    style,
    'data-preview-state': previewState,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const footnoteId = `${fieldId}-footnote`;
  const state = (TEXT_AREA_VALIDATIONS as string[]).includes(validation as string) ? validation : undefined;

  const controlRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      controlRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLTextAreaElement | null }).current = node;
    },
    [ref],
  );

  const focusControl = (event: MouseEvent<HTMLDivElement>) => {
    const control = controlRef.current;
    if (control && event.target !== control && !control.disabled) {
      event.preventDefault();
      control.focus();
    }
  };

  const describedBy = [ariaDescribedBy, showFootnote ? footnoteId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={cx('ds-text-area', disabled && 'ds-text-area--disabled', state && `ds-text-area--${state}`, className)}
      style={style}
      data-preview-state={previewState}
    >
      {showLabel ? (
        <div className="ds-text-area__label">
          <label className="ds-text-area__label-text" htmlFor={fieldId}>
            {label}
          </label>
          {info ? (
            <span className="ds-text-area__info">
              <InputIcon name="info" />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="ds-text-area__field" onMouseDown={focusControl}>
        {renderIcon(leftIcon, 'left')}
        <span className="ds-text-area__value">
          <textarea
            {...rest}
            ref={setRefs}
            className="ds-text-area__control"
            id={fieldId}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={state === 'error' ? true : undefined}
            aria-label={!showLabel ? (ariaLabel ?? label) : ariaLabel}
            aria-describedby={describedBy}
          />
        </span>
        {renderIcon(rightIcon, 'right')}
      </div>
      {showFootnote ? (
        <div className="ds-text-area__footnote" id={footnoteId}>
          {footnote}
        </div>
      ) : null}
    </div>
  );
});
