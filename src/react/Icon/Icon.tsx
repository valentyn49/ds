import type { SVGProps } from 'react';
import { ICON_PATHS } from '../../components/icons/icon-paths.js';

/** Names of the icons in the shared set (the same data the HTML components use). */
export type IconName = keyof typeof ICON_PATHS;
export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> {
  name: IconName;
}

/**
 * A 24px Figma icon drawn in `currentColor`. Decorative by default (`aria-hidden`); pass `aria-label` and
 * `aria-hidden={false}` to give it a name. Same markup as `iconSVG()` in the HTML components.
 */
export function Icon({ name, ...rest }: IconProps) {
  const path = ICON_PATHS[name] ?? ICON_PATHS.search;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d={path} />
    </svg>
  );
}
