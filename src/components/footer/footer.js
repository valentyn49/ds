import './footer.css';
import { logoSVG } from './logo.js';
import { FOOTER_SIZES, FOOTER_TYPES, FOOTER_RESOLUTIONS, FOOTER_MARGINS, FOOTER_BREAKPOINTS } from './footer.spec.js';
import { FOOTER_TEXT, FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from './footer.content.js';

export { FOOTER_SIZES, FOOTER_TYPES, FOOTER_RESOLUTIONS, FOOTER_MARGINS, FOOTER_BREAKPOINTS };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

// Figma gives no link destinations, so links use the placeholder "#" until the product supplies them.
const link = (label, className) => `<a class="${className}" href="#">${escapeHTML(label)}</a>`;

/**
 * Footer (Figma "footer"). `size` and `type` are the Figma variant properties; `resolution` is not a prop because
 * the layout follows the footer's own width through container queries (see footer.css).
 * Horizontal content margins are 80px on desktop and 40px on tablet and mobile.
 */
export function footerHTML({ size = 'big', type = 'standart' } = {}) {
  const footerSize = FOOTER_SIZES.includes(size) ? size : 'big';
  const footerType = FOOTER_TYPES.includes(type) ? type : 'standart';
  const base = `ds-footer-${++uid}`;

  if (footerSize === 'small') {
    return `<footer class="ds-footer ds-footer--small"><div class="ds-footer__inner"><div class="ds-footer__small-text">${escapeHTML(FOOTER_TEXT.copyright)}</div></div></footer>`;
  }

  const enterprise = footerType === 'enterprise';
  const tag = enterprise ? `<span class="ds-footer__tag">${escapeHTML(FOOTER_TEXT.enterpriseTag)}</span>` : '';

  const columns = FOOTER_COLUMNS[footerType]
    .map((items, columnIndex) => {
      const body = items
        .map((item, itemIndex) => {
          if (item.link) return link(item.link, 'ds-footer__link ds-footer__link--primary');
          const id = `${base}-group-${columnIndex}-${itemIndex}`;
          return `<div class="ds-footer__group" role="group" aria-labelledby="${id}"><div class="ds-footer__heading" id="${id}">${escapeHTML(item.group.heading)}</div><div class="ds-footer__links">${item.group.links
            .map((label) => link(label, 'ds-footer__link'))
            .join('')}</div></div>`;
        })
        .join('');
      return `<div class="ds-footer__column">${body}</div>`;
    })
    .join('');

  const noteText = FOOTER_TEXT.note + (enterprise ? FOOTER_TEXT.noteEnterpriseExtra : '');
  const legal = FOOTER_LEGAL_LINKS[footerType].map((label) => link(label, 'ds-footer__legal-link')).join('');

  return `<footer class="ds-footer ds-footer--big ds-footer--${footerType}"><div class="ds-footer__inner"><div class="ds-footer__main"><div class="ds-footer__about"><div class="ds-footer__brand">${logoSVG()}${tag}</div><div class="ds-footer__notice"><div class="ds-footer__text">${escapeHTML(FOOTER_TEXT.disclaimer)}</div><div class="ds-footer__text"><span class="ds-footer__note-title">${escapeHTML(FOOTER_TEXT.noteTitle)}</span><br>${escapeHTML(noteText)}</div></div></div><nav class="ds-footer__nav" aria-label="Footer">${columns}</nav></div><div class="ds-footer__legal"><div class="ds-footer__copyright">${escapeHTML(FOOTER_TEXT.copyright)}</div><nav class="ds-footer__legal-links" aria-label="Legal">${legal}</nav></div></div></footer>`;
}

export function createFooter(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = footerHTML(props);
  const root = template.content.firstElementChild;
  root.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href="#"]');
    if (anchor) event.preventDefault();
  });
  return root;
}
