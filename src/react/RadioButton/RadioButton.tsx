import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import '../../components/radiobutton/radiobutton.css';
import { radioIcons } from '../../components/radiobutton/icons.js';
import { RADIO_DEFAULTS } from '../../components/radiobutton/radiobutton.spec.js';
import { cx } from '../utils/cx';

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'title' | 'children' | 'size' | 'className' | 'style'>;

export interface RadioButtonProps extends NativeInputProps {
  /** Figma `title`: the label. Always shown. (Not the native `title` tooltip attribute.) */
  title?: ReactNode;
  /** Figma `Show Caption`. */
  showCaption?: boolean;
  /** Figma `subtitle`: the caption under the title. */
  subtitle?: ReactNode;
  /** Figma `badge`: shows the `pro` badge after the title. */
  badge?: boolean;
  /** Text of the badge. */
  badgeText?: ReactNode;
  /** Applied to the root `<label>`. */
  className?: string;
  /** Applied to the root `<label>`. */
  style?: React.CSSProperties;
  /** Any other attribute for the root `<label>` (the input receives all remaining props). */
  labelProps?: Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className' | 'style' | 'children'>;
}

/**
 * Test Design System radio button. Same markup and classes as the HTML `radiobuttonHTML()` builder, styled by the same
 * `radiobutton.css`. The input is a native `type="radio"`: radios that share a `name` form one group, so exclusive
 * selection, Tab, arrow keys, Space and label clicks come from the browser. Figma's `state` is not a prop:
 * `selected` is `checked` / `defaultChecked`, `disabled` is the native `disabled`, and hover is the browser's `:hover`.
 *
 * The ref goes to the `<input>`. Use `checked` + `onChange` (controlled) or `defaultChecked` (uncontrolled), as with
 * a native input. Figma defines no radio group component, so there is none.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  {
    title = RADIO_DEFAULTS.title,
    showCaption = true,
    subtitle = RADIO_DEFAULTS.subtitle,
    badge = false,
    badgeText = RADIO_DEFAULTS.badgeText,
    id,
    className,
    style,
    labelProps,
    ...inputProps
  },
  ref,
) {
  const generated = useId();
  const inputId = id ?? `ds-radiobutton-${generated}`;
  const titleId = `${inputId}-title`;
  const captionId = `${inputId}-caption`;

  return (
    <label {...labelProps} className={cx('ds-radiobutton', className)} style={style}>
      <input
        className="ds-radiobutton__input"
        id={inputId}
        type="radio"
        aria-labelledby={titleId}
        aria-describedby={showCaption ? captionId : undefined}
        {...inputProps}
        ref={ref}
      />
      <span className="ds-radiobutton__control" aria-hidden="true" dangerouslySetInnerHTML={{ __html: radioIcons() }} />
      <span className="ds-radiobutton__content">
        <span className="ds-radiobutton__row">
          <span className="ds-radiobutton__title" id={titleId}>
            {title}
          </span>
          {badge ? <span className="ds-radiobutton__badge">{badgeText}</span> : null}
        </span>
        {showCaption ? (
          <span className="ds-radiobutton__caption" id={captionId}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </label>
  );
});
