import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import '../../components/stepper/stepper.css';
import { STEPPER_STATES, STEPPER_DEFAULTS } from '../../components/stepper/stepper.spec.js';
import { Icon } from '../Icon/Icon';
import { cx } from '../utils/cx';

/** The values of the Figma `state` property (see stepper.spec.js). */
export type StepperState = 'filled' | 'active' | 'next step' | 'disabled';

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Figma `state`: where this step is in the sequence. Default `'active'`. */
  state?: StepperState;
  /** Figma `number`. Shown in the circle; replaced by a check mark in the `filled` state. */
  number?: ReactNode;
  /** Figma `title`. */
  title?: ReactNode;
  /** Figma `short description`. Default `true`. */
  showDescription?: boolean;
  /** Figma `subtitle`. The short description under the title. */
  subtitle?: ReactNode;
}

const slug = (state: string) => state.replace(/\s+/g, '-');

/**
 * One step of a multi-step progress indicator. Same markup and classes as the HTML `stepperHTML()` builder, styled by
 * the same `stepper.css`. Figma defines no click, hover or focus behavior, so the step is presentational: it does not
 * move between steps by itself. For assistive technology the active step has `aria-current="step"`, a disabled step has
 * `aria-disabled="true"`, and a filled step (a check mark instead of the number) contains the visually hidden text
 * "Completed:". The connector line is decorative. Any native `div` attribute (including `aria-*` and `data-*`) goes to
 * the root, and consumer `aria-current` / `aria-disabled` override the defaults.
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    state = 'active',
    number = STEPPER_DEFAULTS.number,
    title = STEPPER_DEFAULTS.title,
    showDescription = true,
    subtitle = STEPPER_DEFAULTS.subtitle,
    className,
    ...rest
  },
  ref,
) {
  const current: StepperState = (STEPPER_STATES as string[]).includes(state) ? state : 'active';
  const filled = current === 'filled';

  return (
    <div
      aria-current={current === 'active' ? 'step' : undefined}
      aria-disabled={current === 'disabled' ? true : undefined}
      {...rest}
      ref={ref}
      className={cx('ds-stepper', `ds-stepper--${slug(current)}`, className)}
    >
      <span className="ds-stepper__marker">
        <span className="ds-stepper__circle">
          {filled ? (
            <span className="ds-stepper__check">
              <Icon name="check" />
            </span>
          ) : (
            <span className="ds-stepper__number">{number}</span>
          )}
        </span>
      </span>
      <span className="ds-stepper__content">
        <span className="ds-stepper__title">
          {filled ? <span className="ds-stepper__sr">Completed: </span> : null}
          {title}
        </span>
        {showDescription ? <span className="ds-stepper__description">{subtitle}</span> : null}
      </span>
      <span className="ds-stepper__connector-wrap" aria-hidden="true">
        <span className="ds-stepper__connector"></span>
      </span>
    </div>
  );
});
