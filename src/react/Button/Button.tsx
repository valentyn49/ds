import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import '../../components/button/button.css';
import { sizesFor } from '../../components/button/button.spec.js';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/Icon';
import { cx } from '../utils/cx';

/** The values of the Figma `type` property, in the order Figma lists them (see button.spec.js). */
export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'purchase',
  'white',
  'text',
  'Stroke',
  'menu',
  'cancel',
  'purchase_secondary',
  'neutral_summary',
  'neutral_detailed',
  'neutral_premium',
] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = 48 | 36;

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

interface ButtonOwnProps {
  /** Figma `type`. Named `variant` because `type` is the native button attribute. */
  variant?: ButtonVariant;
  /** Figma `size`. `Stroke` and `menu` only exist at 36, so they use 36 whatever is asked. */
  size?: ButtonSize;
  /** Figma `Show left icon` + `left icon`: an icon name, or your own element. */
  leftIcon?: IconName | ReactElement;
  /** Figma `Show right icon` + `right icon`. */
  rightIcon?: IconName | ReactElement;
}

/** A button with a label (Figma `Text`, `show text` on). */
interface WithLabel {
  children: ReactNode;
}

/** An icon-only button (Figma `show text` off). It has no visible text, so it must be named. */
type IconOnly = { children?: undefined } & ({ 'aria-label': string } | { 'aria-labelledby': string });

export type ButtonProps = NativeButtonProps & ButtonOwnProps & (WithLabel | IconOnly);

function resolve(variant: string, size: number | string) {
  const known = (BUTTON_VARIANTS as readonly string[]).includes(variant);
  const type = known ? variant : 'primary';
  const allowed = sizesFor(type) as string[];
  const wanted = String(size);
  return { type, size: allowed.includes(wanted) ? wanted : allowed[0] };
}

function renderIcon(icon: IconName | ReactElement | undefined, side: 'left' | 'right') {
  if (icon === undefined || icon === null) return null;
  const className = `ds-button__icon ds-button__icon--${side}`;
  if (typeof icon === 'string') return <Icon name={icon} className={className} />;
  return <span className={className}>{icon}</span>;
}

/**
 * Test Design System button. Same markup and classes as the HTML `buttonHTML()` builder, styled by the same `button.css`.
 * Hover, focus and disabled are real browser states. The native `type` defaults to `"button"`, so a button inside a
 * form does not submit it unless you pass `type="submit"`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 48, leftIcon, rightIcon, type = 'button', className, children, ...rest },
  ref,
) {
  const resolved = resolve(variant, size);
  const hasLabel = children !== undefined && children !== null && children !== false;

  return (
    <button
      ref={ref}
      type={type}
      className={cx('ds-button', `ds-button--${resolved.type}`, `ds-button--${resolved.size}`, className)}
      {...rest}
    >
      {renderIcon(leftIcon, 'left')}
      {hasLabel ? <span className="ds-button__label">{children}</span> : null}
      {renderIcon(rightIcon, 'right')}
    </button>
  );
});
