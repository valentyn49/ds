import './accordion.css';
import { iconSVG } from '../icons/icon-paths.js';
import { buttonHTML } from '../button/button.js';
import { ACCORDION_STATES, ACCORDION_DEFAULTS } from './accordion.spec.js';

export { ACCORDION_STATES, ACCORDION_DEFAULTS };

// "icon / radio" from the Figma icon library (24 x 24 artboard), the left icon used by the Figma component.
const RADIO_PATH =
  'M12.0017 21.5C10.6877 21.5 9.45271 21.2506 8.29658 20.752C7.14043 20.2533 6.13475 19.5765 5.27953 18.7217C4.4243 17.8669 3.74724 16.8616 3.24836 15.706C2.74947 14.5504 2.50003 13.3156 2.50003 12.0017C2.50003 10.6877 2.74936 9.45268 3.24803 8.29655C3.7467 7.1404 4.42345 6.13472 5.27828 5.2795C6.13313 4.42427 7.13837 3.74721 8.29401 3.24833C9.44962 2.74944 10.6844 2.5 11.9983 2.5C13.3123 2.5 14.5473 2.74933 15.7034 3.248C16.8596 3.74667 17.8653 4.42342 18.7205 5.27825C19.5757 6.1331 20.2528 7.13834 20.7517 8.29398C21.2505 9.44959 21.5 10.6844 21.5 11.9983C21.5 13.3122 21.2506 14.5473 20.752 15.7034C20.2533 16.8596 19.5766 17.8652 18.7217 18.7205C17.8669 19.5757 16.8616 20.2527 15.706 20.7516C14.5504 21.2505 13.3156 21.5 12.0017 21.5ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76664 19.225 7.87498 17.675 6.32498C16.125 4.77498 14.2333 3.99998 12 3.99998C9.76667 3.99998 7.87501 4.77498 6.32501 6.32498C4.77501 7.87498 4.00001 9.76664 4.00001 12C4.00001 14.2333 4.77501 16.125 6.32501 17.675C7.87501 19.225 9.76667 20 12 20Z';
const radioIcon = () => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${RADIO_PATH}"/></svg>`;

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

/**
 * One independent accordion item (Figma "collapse"). Props mirror the Figma component properties:
 *   title -> `title`    content -> `content`    state / open -> `state` (open | closed)
 *   showSubtitle -> `Subtitle`      subtitle -> its text
 *   showLeftIcon -> `Left icon`     showButton -> `Button`      showLink -> `Link`
 * The header is a native button (`aria-expanded`, `aria-controls`) laid over the whole header area, so clicking the
 * header, Enter and Space toggle the item. The Button and Link stay separate controls above it.
 */
export function accordionHTML({
  id,
  open = false,
  title = ACCORDION_DEFAULTS.title,
  content = ACCORDION_DEFAULTS.content,
  showSubtitle = false,
  subtitle = ACCORDION_DEFAULTS.subtitle,
  showLeftIcon = false,
  showButton = false,
  buttonText = ACCORDION_DEFAULTS.buttonText,
  showLink = false,
  linkText = ACCORDION_DEFAULTS.linkText,
} = {}) {
  const base = id ?? `ds-accordion-${++uid}`;

  const link = showLink ? `<a class="ds-accordion__link" href="#">${escapeHTML(linkText)}</a>` : '';
  const sub = showSubtitle ? `<span class="ds-accordion__subtitle">${escapeHTML(subtitle)}</span>` : '';
  const button = showButton ? `<span class="ds-accordion__button">${buttonHTML({ variant: 'primary', size: '36', text: buttonText })}</span>` : '';
  const left = showLeftIcon ? `<span class="ds-accordion__icon">${radioIcon()}</span>` : '';

  return `<div class="ds-accordion${open ? ' ds-accordion--open' : ''}"><div class="ds-accordion__header"><button class="ds-accordion__toggle" type="button" id="${base}-toggle" aria-expanded="${open}" aria-controls="${base}-panel" aria-labelledby="${base}-title"></button>${left}<span class="ds-accordion__text"><span class="ds-accordion__title-row"><span class="ds-accordion__title" id="${base}-title">${escapeHTML(title)}</span>${link}</span>${sub}</span>${button}<span class="ds-accordion__chevron" aria-hidden="true">${iconSVG('chevron')}</span></div><div class="ds-accordion__panel" id="${base}-panel" role="region" aria-labelledby="${base}-title"${open ? '' : ' hidden'}><div class="ds-accordion__content">${escapeHTML(content)}</div></div></div>`;
}

export function createAccordion(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = accordionHTML(props);
  const root = template.content.firstElementChild;
  const toggle = root.querySelector('.ds-accordion__toggle');
  const panel = root.querySelector('.ds-accordion__panel');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
    root.classList.toggle('ds-accordion--open', !expanded);
    root.dispatchEvent(new CustomEvent('ds-accordion-toggle', { bubbles: true, detail: { open: !expanded } }));
  });

  root.querySelector('.ds-accordion__link')?.addEventListener('click', (event) => event.preventDefault());

  return root;
}
