import type { SVGProps } from 'react';
import { logoSVG } from '../../components/footer/logo.js';
import { cx } from '../utils/cx';

// The path data and the size live in the HTML module (copied from the Figma component "Test Design System light").
// They are read from its markup once, so there is a single copy of the artwork.
const source = logoSVG();
const PATHS = [...source.matchAll(/<path d="([^"]+)"\/>/g)].map((match) => match[1]);
const attr = (name: string, fallback: string) => new RegExp(`${name}="([^"]+)"`).exec(source)?.[1] ?? fallback;
const VIEW_BOX = attr('viewBox', '0 0 162 32');
const WIDTH = Number(attr('width', '162'));
const HEIGHT = Number(attr('height', '32'));

export type LogoProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

/**
 * The Test Design System logo (162 × 32), drawn in the current text color. Same markup as `logoSVG()` in the HTML components.
 * It is an image named "Test Design System"; pass `aria-label` to change the name or `aria-hidden` when it is decorative.
 */
export function Logo({ className, ...rest }: LogoProps) {
  return (
    <svg
      className={cx('ds-footer__logo', className)}
      viewBox={VIEW_BOX}
      width={WIDTH}
      height={HEIGHT}
      fill="currentColor"
      role="img"
      aria-label="Test Design System"
      focusable="false"
      {...rest}
    >
      {PATHS.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}
