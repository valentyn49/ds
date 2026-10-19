import { forwardRef, useId } from 'react';
import type { CSSProperties, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import '../../components/checkbox/checkbox.css';
import { checkboxIcons } from '../../components/checkbox/icons.js';
import { CHECKBOX_DEFAULTS } from '../../components/checkbox/checkbox.spec.js';
import { cx } from '../utils/cx';

/** Native `data-*` attributes for the root `label`. */
type DataAttributes = { [key: `data-${string}`]: string | undefined };

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title' | 'size' | 'className' | 'style' | 'children'>;

export interface CheckboxProps extends NativeInputProps {
  /** Figma `title`. The label, always shown. */
  title?: ReactNode;
  /** Figma `Show Caption`. */
  showCaption?: boolean;
  /** Figma `subtitle`. The caption under the title. */
  subtitle?: ReactNode;
  /** Class name for the root `label`. */
  className?: string;
  /** Style for the root `label`. */
  style?: CSSProperties;
  /** Extra attributes for the root `label` (for example `data-preview-state="hover"` in documentation). */
  rootProps?: Omit<HTMLAttributes<HTMLLabelElement>, 'className' | 'style' | 'children'> & DataAttributes;
}

/**
 * Socrates checkbox: a native `input type="checkbox"` inside a `label`, so click, label click, Tab and Space work in
 * the browser. Same markup and classes as the HTML `checkboxHTML()` builder, styled by the same `checkbox.css`.
 *
 * It is controlled with `checked` + `onChange`, or uncontrolled with `defaultChecked`, like a native input. Figma's
 * `state` is not a prop: `selected` is `checked`, `disabled` is the native `disabled`, and `hover` is the browser's
 * `:hover`. The `ref` points to the `input`; native input attributes (`name`, `value`, `required`, `onChange`, `aria-*`,
 * `data-*`) go to the `input`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    title = CHECKBOX_DEFAULTS.title,
    showCaption = true,
    subtitle = CHECKBOX_DEFAULTS.subtitle,
    id,
    className,
    style,
    rootProps,
    ...inputProps
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const titleId = `${inputId}-title`;
  const captionId = `${inputId}-caption`;

  return (
    <label {...rootProps} className={cx('ds-checkbox', className)} style={style}>
      <input
        aria-labelledby={titleId}
        aria-describedby={showCaption ? captionId : undefined}
        {...inputProps}
        ref={ref}
        className="ds-checkbox__input"
        id={inputId}
        type="checkbox"
      />
      {/* Static, library-owned SVG markup shared with the HTML component, so the icons are not duplicated. */}
      <span className="ds-checkbox__box" aria-hidden="true" dangerouslySetInnerHTML={{ __html: checkboxIcons() }} />
      <span className="ds-checkbox__content">
        <span className="ds-checkbox__title" id={titleId}>
          {title}
        </span>
        {showCaption ? (
          <span className="ds-checkbox__caption" id={captionId}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </label>
  );
});
