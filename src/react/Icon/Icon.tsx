import { useId } from 'react';
import type { SVGProps } from 'react';
import { ICON_PATHS } from '../../components/icons/icon-paths.js';
import { ICON_REGISTRY, FIGMA_ICON_NAMES, iconContent } from '../../components/icons/icon-library';
import type { FigmaIconName } from '../../components/icons/icon-library';

/** Names of the icons in the shared set (the same data the HTML components use). */
export type LegacyIconName = keyof typeof ICON_PATHS;
export type IconName = LegacyIconName | FigmaIconName;
// Existing component controls and parity checks use this compatibility list.
export const ICON_NAMES = Object.keys(ICON_PATHS) as LegacyIconName[];
export { FIGMA_ICON_NAMES, ICON_REGISTRY };
export type { FigmaIconName };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children' | 'dangerouslySetInnerHTML'> {
  name: IconName;
  /** Only 24 is defined by this Figma collection. Native dimensions remain available for legacy callers. */
  size?: 24;
  /** A meaningful icon is exposed automatically when labeled. Decorative by default. */
  label?: string;
}

/**
 * Canonical `icon/...` names render the original exported SVG with its Figma paints by default.
 * `color` opts into recoloring a verified monochrome icon. Legacy short names retain their original
 * currentColor markup so existing Button, Popup, Accordion and Stepper consumers remain unchanged.
 * Use `label` or aria-label/aria-labelledby for meaningful icons; otherwise the icon is decorative.
 */
export function Icon({ name, size, label, color, ...rest }: IconProps) {
  const scope = useId();
  const meaningful = Boolean(label || rest['aria-label'] || rest['aria-labelledby']);
  const accessibility = {
    'aria-hidden': meaningful ? undefined : true,
    role: meaningful ? 'img' : undefined,
    ...(label ? { 'aria-label': label } : {}),
  } as const;
  if (Object.hasOwn(ICON_REGISTRY, name)) {
    const entry = ICON_REGISTRY[name as FigmaIconName];
    return <svg xmlns="http://www.w3.org/2000/svg" width={size ?? entry.width} height={size ?? entry.height}
      viewBox={entry.viewBox} fill="none" focusable="false" {...accessibility} {...rest} color={color}
      dangerouslySetInnerHTML={{ __html: iconContent(name as FigmaIconName, color, scope) }} />;
  }
  if (!Object.hasOwn(ICON_PATHS, name)) throw new Error(`Unknown icon: ${name}`);
  const path = ICON_PATHS[name as LegacyIconName];
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" focusable="false" {...accessibility} {...rest} color={color} {...(size ? { width: size, height: size } : {})}>
      <path d={path} />
    </svg>
  );
}
