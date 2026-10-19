import { forwardRef, useId, useState } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import '../../components/accordion/accordion.css';
import { ACCORDION_DEFAULTS } from '../../components/accordion/accordion.spec.js';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { cx } from '../utils/cx';
import { RADIO_ICON_PATH } from './radioIcon';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>;
type HeaderButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'id'> {
  /** Base for the generated ids (`-toggle`, `-panel`, `-title`). It is not set on the root. Generated when omitted. */
  id?: string;
  /** Figma `title`. */
  title?: ReactNode;
  /** Figma `Subtitle` + its text: present means shown. */
  subtitle?: ReactNode;
  /** Figma `Left icon`: shows the radio icon before the text. */
  leftIcon?: boolean;
  /** Figma `Link` + its text: present means shown. */
  link?: ReactNode;
  /** Attributes for the link. `href` defaults to `"#"`, and a click on `"#"` does not navigate. */
  linkProps?: LinkProps;
  /** Figma `Button` + its label: present means shown. It is the primary Button at size 36. */
  button?: ReactNode;
  /** Attributes for the header Button, such as `onClick`. */
  buttonProps?: HeaderButtonProps;
  /** Figma `state=open`. Controlled use: pass `open` and update it in `onOpenChange`. */
  open?: boolean;
  /** Initial state for uncontrolled use. */
  defaultOpen?: boolean;
  /** Called with the next state when the header is toggled. */
  onOpenChange?: (open: boolean) => void;
  /** Figma `content`: the panel, shown only when the item is open. */
  children?: ReactNode;
}

const has = (node: ReactNode) => node !== undefined && node !== null && node !== false;

/**
 * One independent accordion item (Figma "collapse"). Same markup and classes as the HTML `accordionHTML()` builder,
 * styled by the same `accordion.css`. The header is a native button laid over the whole header area
 * (`aria-expanded`, `aria-controls`), so a click, Enter and Space toggle the item. The Button and the link are
 * separate controls above it and do not toggle the item.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    id,
    title = ACCORDION_DEFAULTS.title,
    subtitle,
    leftIcon = false,
    link,
    linkProps,
    button,
    buttonProps,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    className,
    children,
    ...rest
  },
  ref,
) {
  const generated = useId();
  const base = id ?? generated;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolledOpen;

  const toggle = () => {
    const next = !open;
    if (!controlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const onLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    linkProps?.onClick?.(event);
    if (!event.defaultPrevented && (linkProps?.href ?? '#') === '#') event.preventDefault();
  };

  return (
    <div ref={ref} className={cx('ds-accordion', open && 'ds-accordion--open', className)} {...rest}>
      <div className="ds-accordion__header">
        <button
          className="ds-accordion__toggle"
          type="button"
          id={`${base}-toggle`}
          aria-expanded={open}
          aria-controls={`${base}-panel`}
          aria-labelledby={`${base}-title`}
          onClick={toggle}
        />
        {leftIcon ? (
          <span className="ds-accordion__icon">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d={RADIO_ICON_PATH} />
            </svg>
          </span>
        ) : null}
        <span className="ds-accordion__text">
          <span className="ds-accordion__title-row">
            <span className="ds-accordion__title" id={`${base}-title`}>
              {title}
            </span>
            {has(link) ? (
              <a {...linkProps} className={cx('ds-accordion__link', linkProps?.className)} href={linkProps?.href ?? '#'} onClick={onLinkClick}>
                {link}
              </a>
            ) : null}
          </span>
          {has(subtitle) ? <span className="ds-accordion__subtitle">{subtitle}</span> : null}
        </span>
        {has(button) ? (
          <span className="ds-accordion__button">
            <Button {...buttonProps} variant="primary" size={36}>
              {button}
            </Button>
          </span>
        ) : null}
        <span className="ds-accordion__chevron" aria-hidden="true">
          <Icon name="chevron" />
        </span>
      </div>
      <div className="ds-accordion__panel" id={`${base}-panel`} role="region" aria-labelledby={`${base}-title`} hidden={!open}>
        <div className="ds-accordion__content">{children}</div>
      </div>
    </div>
  );
});
