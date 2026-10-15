import './notification.css';
import { ICON_PATHS } from '../icons/icon-paths.js';
import { buttonHTML } from '../button/button.js';
import { NOTIFICATION_TYPES, NOTIFICATION_STATES, NOTIFICATION_DEFAULTS, STATE_ICONS } from './notification.spec.js';

export { NOTIFICATION_TYPES, NOTIFICATION_STATES, NOTIFICATION_DEFAULTS };

// "icon / check_filled" from the Figma icon library (24 x 24 artboard); the other icons come from the shared set.
const CHECK_FILLED =
  'M10.5808 16.2538L17.3038 9.53075L16.25 8.477L10.5808 14.1463L7.73075 11.2963L6.677 12.35L10.5808 16.2538ZM12.0017 21.5C10.6877 21.5 9.45267 21.2507 8.2965 20.752C7.14033 20.2533 6.13467 19.5766 5.2795 18.7218C4.42433 17.8669 3.74725 16.8617 3.24825 15.706C2.74942 14.5503 2.5 13.3156 2.5 12.0017C2.5 10.6877 2.74933 9.45267 3.248 8.2965C3.74667 7.14033 4.42342 6.13467 5.27825 5.2795C6.13308 4.42433 7.13833 3.74725 8.294 3.24825C9.44967 2.74942 10.6844 2.5 11.9983 2.5C13.3123 2.5 14.5473 2.74933 15.7035 3.248C16.8597 3.74667 17.8653 4.42342 18.7205 5.27825C19.5757 6.13308 20.2528 7.13833 20.7518 8.294C21.2506 9.44967 21.5 10.6844 21.5 11.9983C21.5 13.3123 21.2507 14.5473 20.752 15.7035C20.2533 16.8597 19.5766 17.8653 18.7218 18.7205C17.8669 19.5757 16.8617 20.2528 15.706 20.7518C14.5503 21.2506 13.3156 21.5 12.0017 21.5Z';

// "icon / info" (the shared list has no info; this is the Figma path).
const INFO =
  'M11.25 16.75H12.75V11H11.25V16.75ZM12 9.2885C12.2288 9.2885 12.4207 9.21108 12.5755 9.05625C12.7303 8.90142 12.8077 8.70958 12.8077 8.48075C12.8077 8.25192 12.7303 8.06008 12.5755 7.90525C12.4207 7.75058 12.2288 7.67325 12 7.67325C11.7712 7.67325 11.5793 7.75058 11.4245 7.90525C11.2697 8.06008 11.1923 8.25192 11.1923 8.48075C11.1923 8.70958 11.2697 8.90142 11.4245 9.05625C11.5793 9.21108 11.7712 9.2885 12 9.2885ZM12.0017 21.5C10.6877 21.5 9.45267 21.2507 8.2965 20.752C7.14033 20.2533 6.13467 19.5766 5.2795 18.7218C4.42433 17.8669 3.74725 16.8617 3.24825 15.706C2.74942 14.5503 2.5 13.3156 2.5 12.0017C2.5 10.6877 2.74933 9.45267 3.248 8.2965C3.74667 7.14033 4.42342 6.13467 5.27825 5.2795C6.13308 4.42433 7.13833 3.74725 8.294 3.24825C9.44967 2.74942 10.6844 2.5 11.9983 2.5C13.3123 2.5 14.5473 2.74933 15.7035 3.248C16.8597 3.74667 17.8653 4.42342 18.7205 5.27825C19.5757 6.13308 20.2528 7.13833 20.7518 8.294C21.2506 9.44967 21.5 10.6844 21.5 11.9983C21.5 13.3123 21.2507 14.5473 20.752 15.7035C20.2533 16.8597 19.5766 17.8653 18.7218 18.7205C17.8669 19.5757 16.8617 20.2528 15.706 20.7518C14.5503 21.2506 13.3156 21.5 12.0017 21.5Z';

// "icon / report" (not in the shared list). Figma draws it as a 17px vector, offset by 3.5px into the 24px artboard.
const REPORT =
  'M 12 16.7115 C 12.2288 16.7115 12.4207 16.6341 12.5755 16.4793 C 12.7303 16.3244 12.8077 16.1326 12.8077 15.9037 C 12.8077 15.6749 12.7303 15.4831 12.5755 15.3283 C 12.4207 15.1736 12.2288 15.0963 12 15.0963 C 11.7712 15.0963 11.5793 15.1736 11.4245 15.3283 C 11.2697 15.4831 11.1923 15.6749 11.1923 15.9037 C 11.1923 16.1326 11.2697 16.3244 11.4245 16.4793 C 11.5793 16.6341 11.7712 16.7115 12 16.7115 Z M 11.25 13.2308 L 12.75 13.2308 L 12.75 7.1923 L 11.25 7.1923 L 11.25 13.2308 Z M 8.4615 20.5 L 3.5 15.543 L 3.5 8.4615 L 8.457 3.5 L 15.5385 3.5 L 20.5 8.457 L 20.5 15.5385 L 15.543 20.5 L 8.4615 20.5 Z';

const PATHS = { ...ICON_PATHS, check_filled: CHECK_FILLED, info: INFO, report: REPORT };
const icon = (name, className) =>
  `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`;

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Visually hidden text that names the status for assistive technology. Gray and white are neutral and get none.
const STATUS_LABEL = { warning: 'Warning', success: 'Success', info: 'Information', alert: 'Alert' };

/**
 * Props mirror the Figma component properties:
 *   type -> `type` (home | default)   state -> `state`   showIcon -> `show icon`   close -> `close`
 *   text -> `Text`                    showButton -> `show button` (buttonText is the Button's label)
 * Only the `alert` state uses role="alert"; every other state uses role="status", so banners do not all announce as urgent.
 */
export function notificationHTML({
  type = 'default',
  state = 'info',
  showIcon = true,
  close = true,
  text = NOTIFICATION_DEFAULTS.text,
  showButton = false,
  buttonText = NOTIFICATION_DEFAULTS.buttonText,
} = {}) {
  const nType = NOTIFICATION_TYPES.includes(type) ? type : 'default';
  const nState = NOTIFICATION_STATES.includes(state) ? state : 'info';
  const role = nState === 'alert' ? 'alert' : 'status';

  const status = STATUS_LABEL[nState] ? `<span class="ds-notification__status">${STATUS_LABEL[nState]}: </span>` : '';
  const iconHTML = showIcon ? `<span class="ds-notification__icon">${icon(STATE_ICONS[nState], 'ds-notification__icon-svg')}</span>` : '';
  const button = showButton ? `<span class="ds-notification__action">${buttonHTML({ variant: 'text', size: '36', text: buttonText })}</span>` : '';
  const closeHTML = close
    ? `<button type="button" class="ds-notification__close" aria-label="Close">${icon('close', 'ds-notification__close-svg')}</button>`
    : '';

  return `<div class="ds-notification ds-notification--${nType} ds-notification--${nState}" role="${role}"><div class="ds-notification__row">${iconHTML}<div class="ds-notification__text">${status}${escapeHTML(text)}</div>${button}${closeHTML}</div></div>`;
}

// Focus goes to the next focusable element after the banner (or the previous one) when a focused banner is dismissed.
function moveFocusAway(banner) {
  const focusable = [...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => !banner.contains(el) && el.offsetParent !== null,
  );
  const after = focusable.find((el) => banner.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  const before = [...focusable].reverse().find((el) => banner.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING);
  (after ?? before)?.focus();
}

/**
 * Interactive banner. The close control hides the banner and fires a bubbling `ds-notification-dismiss` event.
 * There is no timer and no automatic dismissal. `show()` brings a dismissed banner back (used by the documentation).
 */
export function createNotification(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = notificationHTML(props);
  const root = template.content.firstElementChild;

  const closeButton = root.querySelector('.ds-notification__close');
  closeButton?.addEventListener('click', () => {
    const hadFocus = root.contains(document.activeElement);
    root.hidden = true;
    if (hadFocus) moveFocusAway(root);
    root.dispatchEvent(new CustomEvent('ds-notification-dismiss', { bubbles: true }));
  });

  root.show = () => {
    root.hidden = false;
  };
  return root;
}
