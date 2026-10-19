import { forwardRef, useId } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';
import '../../components/footer/footer.css';
import { FOOTER_SIZES, FOOTER_TYPES } from '../../components/footer/footer.spec.js';
import { FOOTER_TEXT, FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from '../../components/footer/footer.content.js';
import { cx } from '../utils/cx';
import { Logo } from './Logo';

export type FooterSize = 'big' | 'small';
export type FooterType = 'standart' | 'enterprise';

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Figma `size`. */
  size?: FooterSize;
  /** Figma `type`. Only the big footer has types. */
  type?: FooterType;
}

// Figma gives no link destinations, so links use the placeholder "#" until the product supplies them.
function FooterLink({ label, className }: { label: string; className: string }) {
  return (
    <a className={className} href="#">
      {label}
    </a>
  );
}

/**
 * Footer (Figma "footer"). `size` and `type` are the Figma variant properties. The Figma `resolution` is not a prop:
 * the layout follows the footer's own width through container queries (footer.css), so it behaves the same in a full
 * page and in a narrower container. Content is inset 80px on desktop and 40px on tablet and mobile.
 * Same markup and classes as `footerHTML()`. A click on a placeholder "#" link is prevented, as in the HTML version.
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer({ size = 'big', type = 'standart', className, onClick, ...rest }, ref) {
  const base = useId();
  const footerSize: FooterSize = (FOOTER_SIZES as string[]).includes(size) ? size : 'big';
  const footerType: FooterType = (FOOTER_TYPES as string[]).includes(type) ? type : 'standart';

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a[href="#"]')) event.preventDefault();
    onClick?.(event);
  };

  if (footerSize === 'small') {
    return (
      <footer ref={ref} className={cx('ds-footer', 'ds-footer--small', className)} onClick={handleClick} {...rest}>
        <div className="ds-footer__inner">
          <div className="ds-footer__small-text">{FOOTER_TEXT.copyright}</div>
        </div>
      </footer>
    );
  }

  const enterprise = footerType === 'enterprise';
  const noteText = FOOTER_TEXT.note + (enterprise ? FOOTER_TEXT.noteEnterpriseExtra : '');

  return (
    <footer ref={ref} className={cx('ds-footer', 'ds-footer--big', `ds-footer--${footerType}`, className)} onClick={handleClick} {...rest}>
      <div className="ds-footer__inner">
        <div className="ds-footer__main">
          <div className="ds-footer__about">
            <div className="ds-footer__brand">
              <Logo />
              {enterprise ? <span className="ds-footer__tag">{FOOTER_TEXT.enterpriseTag}</span> : null}
            </div>
            <div className="ds-footer__notice">
              <div className="ds-footer__text">{FOOTER_TEXT.disclaimer}</div>
              <div className="ds-footer__text">
                <span className="ds-footer__note-title">{FOOTER_TEXT.noteTitle}</span>
                <br />
                {noteText}
              </div>
            </div>
          </div>
          <nav className="ds-footer__nav" aria-label="Footer">
            {FOOTER_COLUMNS[footerType].map((items, columnIndex) => (
              <div className="ds-footer__column" key={columnIndex}>
                {items.map((item, itemIndex) => {
                  if (item.link) return <FooterLink key={itemIndex} label={item.link} className="ds-footer__link ds-footer__link--primary" />;
                  const group = item.group!;
                  const id = `${base}-group-${columnIndex}-${itemIndex}`;
                  return (
                    <div className="ds-footer__group" role="group" aria-labelledby={id} key={itemIndex}>
                      <div className="ds-footer__heading" id={id}>
                        {group.heading}
                      </div>
                      <div className="ds-footer__links">
                        {group.links.map((label) => (
                          <FooterLink key={label} label={label} className="ds-footer__link" />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
        <div className="ds-footer__legal">
          <div className="ds-footer__copyright">{FOOTER_TEXT.copyright}</div>
          <nav className="ds-footer__legal-links" aria-label="Legal">
            {FOOTER_LEGAL_LINKS[footerType].map((label) => (
              <FooterLink key={label} label={label} className="ds-footer__legal-link" />
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
});
