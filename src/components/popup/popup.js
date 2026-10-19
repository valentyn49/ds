import './popup.css';
import { iconSVG } from '../icons/icon-paths.js';
import { buttonHTML } from '../button/button.js';
import { POPUP_TYPES, POPUP_WIDTHS, POPUP_DEFAULTS, POPUP_BREAKPOINTS } from './popup.spec.js';
import successUrl from './assets/success.svg';
import circleUrl from './assets/ellipse.svg';
import crossUrl from './assets/negative-x.png';

export { POPUP_TYPES, POPUP_WIDTHS, POPUP_DEFAULTS, POPUP_BREAKPOINTS };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

const illustration = (type) =>
  type === 'successfully'
    ? `<span class="ds-popup__illustration ds-popup__illustration--successfully"><img src="${successUrl}" alt="" width="154" height="120"></span>`
    : type === 'negative'
      ? `<span class="ds-popup__illustration ds-popup__illustration--negative"><img class="ds-popup__circle" src="${circleUrl}" alt=""><img class="ds-popup__cross" src="${crossUrl}" alt=""></span>`
      : '';

/**
 * Markup of the overlay: backdrop plus dialog. Props mirror the Figma component "modal" and the popup frames:
 *   type -> `type`            width -> frame "600" | "480"        title, subtitle (Figma `subTitle` + `sub`)
 *   body (text) | bodyHTML    primaryLabel, cancelLabel, showCancel
 * `size` (desktop | mobile) is not a prop: the CSS follows the width of the overlay.
 * Documentation-only: `mode` ('static' draws the popup in the flow, no dialog role), `frame` (width/height of that
 * flow box) and `scrolling` (draws the look used when the content does not fit).
 */
export function popupHTML({
  type = 'default',
  width = '600',
  title = POPUP_DEFAULTS.title,
  subtitle = '',
  body = POPUP_DEFAULTS.body,
  bodyHTML,
  primaryLabel = POPUP_DEFAULTS.primaryLabel,
  cancelLabel = POPUP_DEFAULTS.cancelLabel,
  showCancel = true,
  mode = 'fixed',
  frame,
  scrolling = false,
} = {}) {
  const t = POPUP_TYPES.includes(type) ? type : 'default';
  const w = POPUP_WIDTHS.includes(String(width)) ? String(width) : '600';
  const id = `ds-popup-${++uid}`;
  const isStatic = mode === 'static';

  const rootClass = `ds-popup ds-popup--${mode}`;
  const rootStyle = frame ? ` style="width:${frame.width}px;height:${frame.height}px"` : '';
  const dialogAttrs = [
    `class="ds-popup__dialog ds-popup__dialog--${t} ds-popup__dialog--${w}"`,
    isStatic ? 'role="group"' : 'role="dialog" aria-modal="true"',
    `aria-labelledby="${id}-title"`,
    subtitle || !isStatic ? `aria-describedby="${id}-${subtitle ? 'subtitle' : 'body'}"` : '',
    isStatic ? '' : 'tabindex="-1"',
    scrolling ? 'data-scroll' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const subtitleHTML = subtitle ? `<div class="ds-popup__subtitle" id="${id}-subtitle">${escapeHTML(subtitle)}</div>` : '';
  const cancel = showCancel ? `<span class="ds-popup__cancel">${buttonHTML({ variant: 'cancel', size: '48', text: cancelLabel })}</span>` : '';
  const primary = `<span class="ds-popup__primary">${buttonHTML({ variant: 'primary', size: '48', text: primaryLabel })}</span>`;
  const bodyContent = bodyHTML ?? escapeHTML(body);

  return `<div class="${rootClass}" data-ds-popup${rootStyle}><div class="ds-popup__backdrop"></div><div ${dialogAttrs}><div class="ds-popup__header">${illustration(t)}<div class="ds-popup__titles"><div class="ds-popup__title" id="${id}-title" role="heading" aria-level="2">${escapeHTML(title)}</div>${subtitleHTML}</div><button type="button" class="ds-popup__close" aria-label="Close">${iconSVG('close', 'ds-popup__close-icon')}</button></div><div class="ds-popup__body" id="${id}-body">${bodyContent}</div><div class="ds-popup__footer"><div class="ds-popup__actions">${cancel}${primary}</div></div></div></div>`;
}

// ---------- modal behavior ----------

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const stack = [];
let scrollLocks = 0;
let savedOverflow = '';
let savedPaddingRight = '';

function lockScroll() {
  if (scrollLocks++ > 0) return;
  const body = document.body;
  savedOverflow = body.style.overflow;
  savedPaddingRight = body.style.paddingRight;
  const bar = window.innerWidth - document.documentElement.clientWidth;
  if (bar > 0) body.style.paddingRight = `${bar + (parseFloat(getComputedStyle(body).paddingRight) || 0)}px`;
  body.style.overflow = 'hidden';
}

function unlockScroll() {
  if (--scrollLocks > 0) return;
  document.body.style.overflow = savedOverflow;
  document.body.style.paddingRight = savedPaddingRight;
}

/**
 * Accessible modal dialog.
 *
 * Presentation props: see popupHTML, plus `body` may be a Node for composed content.
 * Behavior props: closeOnEscape (default true), closeOnBackdrop (default false), container (default document.body).
 * Callbacks: onClose(reason), onPrimary(popup), onCancel(popup).
 *
 * Close, Cancel and the primary action are separate. The close control and Cancel dismiss the popup; the primary
 * action only fires `onPrimary` and the `ds-popup-primary` event, and the consuming application decides whether to
 * call `close()`. The `ds-popup-close` event carries `detail.reason`:
 * 'close-button' | 'cancel' | 'escape' | 'backdrop' | 'programmatic'.
 *
 * Closed means not rendered: the popup is added to the container when opened and removed when closed.
 */
export function createPopup(props = {}) {
  const { closeOnEscape = true, closeOnBackdrop = false, container = document.body, onClose, onPrimary, onCancel, body, ...markupProps } = props;
  const contained = container !== document.body;

  let root = null;
  let dialog = null;
  let isOpen = false;
  let opener = null;
  let inerted = [];
  let observer = null;

  const popup = {
    get element() {
      return root;
    },
    get isOpen() {
      return isOpen;
    },
    open,
    close,
    refresh,
    destroy,
  };

  const emit = (name, detail = {}) => root?.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

  function build() {
    const template = document.createElement('template');
    template.innerHTML = popupHTML({ ...markupProps, body: body instanceof Node ? '' : (body ?? POPUP_DEFAULTS.body), mode: contained ? 'contained' : 'fixed' });
    root = template.content.firstElementChild;
    dialog = root.querySelector('.ds-popup__dialog');
    if (body instanceof Node) root.querySelector('.ds-popup__body').append(body);

    root.querySelector('.ds-popup__close').addEventListener('click', () => close('close-button'));
    root.querySelector('.ds-popup__cancel .ds-button')?.addEventListener('click', () => {
      onCancel?.(popup);
      emit('ds-popup-cancel');
      close('cancel');
    });
    root.querySelector('.ds-popup__primary .ds-button').addEventListener('click', () => {
      onPrimary?.(popup);
      emit('ds-popup-primary');
    });

    const backdrop = root.querySelector('.ds-popup__backdrop');
    backdrop.addEventListener('mousedown', (event) => event.preventDefault());
    backdrop.addEventListener('click', () => {
      if (closeOnBackdrop) close('backdrop');
    });
  }

  // The popup is measured without its scrolling look, so the decision cannot flip back and forth.
  function refresh() {
    if (!isOpen) return;
    const bodyEl = dialog.querySelector('.ds-popup__body');
    dialog.removeAttribute('data-scroll');
    if (bodyEl.scrollHeight > bodyEl.clientHeight + 1) dialog.setAttribute('data-scroll', '');
  }

  function focusables() {
    return [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
  }

  function onKeydown(event) {
    if (stack[stack.length - 1] !== popup) return;
    if (event.key === 'Escape' && closeOnEscape && !event.defaultPrevented) {
      event.preventDefault();
      close('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) {
      event.preventDefault();
      dialog.focus({ preventScroll: true });
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (!dialog.contains(active) || (event.shiftKey && (active === first || active === dialog)) || (!event.shiftKey && active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }

  // `returnFocusTo` names the element that gets focus back on close (default: the element focused when opening).
  // `focus: false` leaves focus where it is; the documentation uses it when it redraws an open popup.
  function open({ focus = true, returnFocusTo } = {}) {
    if (isOpen) return;
    build();
    opener = returnFocusTo ?? (document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null);

    container.append(root);
    isOpen = true;
    stack.push(popup);

    // Everything behind the popup becomes inert: not focusable, not clickable, hidden from assistive technology.
    inerted = [...container.children].filter((el) => el !== root && !el.inert);
    inerted.forEach((el) => {
      el.inert = true;
    });
    if (!contained) lockScroll();

    document.addEventListener('keydown', onKeydown, true);
    observer = new ResizeObserver(refresh);
    observer.observe(root);
    refresh();

    if (focus) dialog.focus({ preventScroll: true });
    emit('ds-popup-open');
  }

  function close(reason = 'programmatic') {
    if (!isOpen) return;
    isOpen = false;
    stack.splice(stack.indexOf(popup), 1);
    document.removeEventListener('keydown', onKeydown, true);
    observer?.disconnect();
    observer = null;

    emit('ds-popup-close', { reason });
    root.remove();
    inerted.forEach((el) => {
      el.inert = false;
    });
    inerted = [];
    if (!contained) unlockScroll();

    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    onClose?.(reason);
  }

  // Closes without moving focus back to the opener. Used by the documentation when it redraws an open popup.
  function destroy() {
    opener = null;
    close('programmatic');
  }

  return popup;
}
