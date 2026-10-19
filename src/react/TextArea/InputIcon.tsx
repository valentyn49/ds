import type { SVGProps } from 'react';
import { INPUT_ICON_PATHS } from '../../components/text-input/icons.js';

/** Icon names of the input components: the shared subset plus `info` (the Figma default for both icon slots). */
export type InputIconName = keyof typeof INPUT_ICON_PATHS;
export const INPUT_ICON_NAMES = Object.keys(INPUT_ICON_PATHS) as InputIconName[];

interface InputIconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> {
  name: InputIconName;
}

/** Same markup as `inputIconSVG()` in the HTML components: a 24px icon in `currentColor`, hidden from assistive technology. */
export function InputIcon({ name, ...rest }: InputIconProps) {
  const path = INPUT_ICON_PATHS[name] ?? INPUT_ICON_PATHS.info;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d={path} />
    </svg>
  );
}
