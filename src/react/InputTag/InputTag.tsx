import { forwardRef, useId, useImperativeHandle, useRef } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, MouseEvent } from 'react';
import '../../components/input-tag/input-tag.css';
import { INPUT_TAG_DEFAULTS } from '../../components/input-tag/input-tag.spec.js';
import { INPUT_ICON_PATHS } from '../../components/text-input/icons.js';
import { cx } from '../utils/cx';

/** Icons of the Figma subset used by the input fields, including `info` (the default for both icon slots). */
export type InputTagIconName = keyof typeof INPUT_ICON_PATHS;
export const INPUT_TAG_ICON_NAMES = Object.keys(INPUT_ICON_PATHS) as InputTagIconName[];

function FieldIcon({ name }: { name: InputTagIconName }) {
  const path = (INPUT_ICON_PATHS as Record<string, string>)[name] ?? INPUT_ICON_PATHS.search;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'children'>;

export interface InputTagProps extends NativeInputProps {
  /** Figma `label text`. */
  label?: string;
  /** Figma `show label`. Without a visible label the text is used as the input's `aria-label`. */
  showLabel?: boolean;
  /** Figma `info`: the info icon after the label. */
  info?: boolean;
  /** Figma `show left icon`. On by default in this component. */
  showLeftIcon?: boolean;
  /** Figma `left icon`. */
  leftIcon?: InputTagIconName;
  /** Figma `show right icon`. */
  showRightIcon?: boolean;
  /** Figma `right icon`. */
  rightIcon?: InputTagIconName;
  /** Figma `dropdown`: a chevron at the end of the field. */
  showDropdown?: boolean;
  /** Figma `show footnote`. The footnote is linked to the input with `aria-describedby`. */
  showFootnote?: boolean;
  /** Figma `footnote_text`. */
  footnote?: string;
  /** The tags (Figma `badge` chips) shown in the field, as in the `selected` and `finished` states. Display only. */
  tags?: string[];
  /** The Figma `finished` state: the text entry is hidden visually and stays in the page for assistive technology. */
  finished?: boolean;
  /** Class name for the root element (the native `className`-style props below go to the `<input>`). */
  className?: string;
  /** Attributes for the root `<div>` (for example `data-*`). Everything else not listed above goes to the `<input>`. */
  rootProps?: HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string | undefined>;
}

/**
 * Test Design System input tag: a text field that can also hold tags. Same markup and classes as the HTML `inputTagHTML()`
 * builder, styled by the same `input-tag.css`.
 *
 * The component forwards its `ref` to the `<input>`, and passes `value`, `defaultValue`, `onChange`, `name`,
 * `disabled`, `aria-*` and every other native input attribute to it, so it works controlled and uncontrolled.
 * Clicking anywhere in the field focuses the text entry. Figma draws a close icon on the tags but defines no removal,
 * adding or selection behavior, so the tags are display only.
 */
export const InputTag = forwardRef<HTMLInputElement, InputTagProps>(function InputTag(
  {
    id,
    label = INPUT_TAG_DEFAULTS.label,
    showLabel = true,
    info = false,
    placeholder = INPUT_TAG_DEFAULTS.placeholder,
    showLeftIcon = true,
    leftIcon = 'info',
    showRightIcon = false,
    rightIcon = 'info',
    showDropdown = false,
    showFootnote = true,
    footnote = INPUT_TAG_DEFAULTS.footnote,
    tags = [],
    finished = false,
    className,
    rootProps,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const footnoteId = `${inputId}-footnote`;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const describedBy = [showFootnote ? footnoteId : undefined, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  // Clicking anywhere in the field except the input itself focuses the input without moving the caret away first.
  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== inputRef.current) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <div
      {...rootProps}
      className={cx('ds-input-tag', tags.length > 0 && 'ds-input-tag--has-tags', finished && 'ds-input-tag--finished', className)}
    >
      {showLabel ? (
        <div className="ds-input-tag__label">
          <label className="ds-input-tag__label-text" htmlFor={inputId}>
            {label}
          </label>
          {info ? (
            <span className="ds-input-tag__info">
              <FieldIcon name="info" />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="ds-input-tag__field" onMouseDown={focusInput}>
        {showLeftIcon ? (
          <span className="ds-input-tag__icon ds-input-tag__icon--left">
            <FieldIcon name={leftIcon} />
          </span>
        ) : null}
        <span className="ds-input-tag__items">
          {tags.map((text, index) => (
            <span className="ds-input-tag__tag" key={`${index}-${text}`}>
              <span className="ds-input-tag__tag-text">{text}</span>
              <span className="ds-input-tag__tag-close">
                <FieldIcon name="close" />
              </span>
            </span>
          ))}
          <span className="ds-input-tag__value">
            <input
              {...rest}
              ref={inputRef}
              className="ds-input-tag__control"
              id={inputId}
              type="text"
              placeholder={placeholder}
              aria-label={ariaLabel ?? (!showLabel ? label : undefined)}
              aria-describedby={describedBy}
            />
          </span>
        </span>
        {showRightIcon ? (
          <span className="ds-input-tag__icon ds-input-tag__icon--right">
            <FieldIcon name={rightIcon} />
          </span>
        ) : null}
        {showDropdown ? (
          <span className="ds-input-tag__icon ds-input-tag__icon--dropdown">
            <FieldIcon name="chevron" />
          </span>
        ) : null}
      </div>
      {showFootnote ? (
        <div className="ds-input-tag__footnote" id={footnoteId}>
          {footnote}
        </div>
      ) : null}
    </div>
  );
});
