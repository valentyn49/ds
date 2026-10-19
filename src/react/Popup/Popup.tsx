import { forwardRef, useCallback, useId, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode, Ref, RefObject } from 'react';
import { createPortal } from 'react-dom';
import '../../components/popup/popup.css';
import { POPUP_DEFAULTS } from '../../components/popup/popup.spec.js';
import successUrl from '../../components/popup/assets/success.svg';
import circleUrl from '../../components/popup/assets/ellipse.svg';
import crossUrl from '../../components/popup/assets/negative-x.png';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { cx } from '../utils/cx';

/** Figma `type` of the header component "modal". */
export type PopupType = 'default' | 'successfully' | 'negative';
/** Desktop width: the Figma frames "600" and "480". Tablet and mobile fill the width (bottom sheet). */
export type PopupWidth = 600 | 480;
/** Why the popup asks to be closed. The primary action never closes the popup. */
export type PopupCloseReason = 'close-button' | 'cancel' | 'escape' | 'backdrop';
export type PopupMode = 'fixed' | 'contained' | 'static';

export const POPUP_TYPE_LIST: PopupType[] = ['default', 'successfully', 'negative'];
export const POPUP_WIDTH_LIST: PopupWidth[] = [600, 480];

const has = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== '';

function Illustration({ type }: { type: PopupType }) {
  if (type === 'successfully')
    return (
      <span className="ds-popup__illustration ds-popup__illustration--successfully">
        <img src={successUrl} alt="" width={154} height={120} />
      </span>
    );
  if (type === 'negative')
    return (
      <span className="ds-popup__illustration ds-popup__illustration--negative">
        <img className="ds-popup__circle" src={circleUrl} alt="" />
        <img className="ds-popup__cross" src={crossUrl} alt="" />
      </span>
    );
  return null;
}

export interface PopupViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Base for the generated ids (`-title`, `-subtitle`, `-body`). Generated when omitted. */
  idBase?: string;
  /** Figma `type`. */
  type?: PopupType;
  /** Desktop width, Figma frames `600` and `480`. */
  width?: PopupWidth;
  /** The title (Figma `title`). */
  title: ReactNode;
  /** Figma `subTitle` + `sub`: present means shown. */
  subtitle?: ReactNode;
  /** The body: any content. */
  children?: ReactNode;
  primaryLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Shows the Cancel action. It is only drawn on desktop; tablet and mobile hide it. */
  showCancel?: boolean;
  /** `fixed` fills the window, `contained` fills a positioned container, `static` sits in the flow (documentation). */
  mode?: PopupMode;
  /** Documentation only: width and height of the flow box in `static` mode. */
  frame?: { width: number; height: number };
  /** Documentation only: draws the look used when the content does not fit. */
  scrolling?: boolean;
  /** Documentation only: drawn behind the backdrop (a stand-in for the page). */
  behind?: ReactNode;
  /** Ref of the overlay element. */
  rootRef?: Ref<HTMLDivElement>;
  onCloseClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onCancelClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPrimaryClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onBackdropMouseDown?: (event: MouseEvent<HTMLDivElement>) => void;
  onBackdropClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

/**
 * The popup drawn, without any behavior: backdrop plus dialog, the same markup and classes as the HTML `popupHTML()`
 * builder and styled by the same `popup.css`. `Popup` renders this inside a portal and adds the modal behavior.
 * The `static` mode (a dialog with `role="group"`, in the flow) is for documentation previews.
 */
export const PopupView = forwardRef<HTMLDivElement, PopupViewProps>(function PopupView(
  {
    idBase,
    type = 'default',
    width = 600,
    title,
    subtitle,
    children,
    primaryLabel = POPUP_DEFAULTS.primaryLabel,
    cancelLabel = POPUP_DEFAULTS.cancelLabel,
    showCancel = true,
    mode = 'fixed',
    frame,
    scrolling = false,
    behind,
    rootRef,
    className,
    onCloseClick,
    onCancelClick,
    onPrimaryClick,
    onBackdropMouseDown,
    onBackdropClick,
    ...rest
  },
  ref,
) {
  const generated = useId();
  const id = idBase ?? generated;
  const t: PopupType = type === 'successfully' || type === 'negative' ? type : 'default';
  const w: PopupWidth = Number(width) === 480 ? 480 : 600;
  const isStatic = mode === 'static';
  const hasSubtitle = has(subtitle);
  const rootStyle: CSSProperties | undefined = frame ? { width: frame.width, height: frame.height } : undefined;

  return (
    <div className={`ds-popup ds-popup--${mode}`} data-ds-popup="" style={rootStyle} ref={rootRef}>
      {behind}
      <div className="ds-popup__backdrop" onMouseDown={onBackdropMouseDown} onClick={onBackdropClick}></div>
      <div
        ref={ref}
        className={cx('ds-popup__dialog', `ds-popup__dialog--${t}`, `ds-popup__dialog--${w}`, className)}
        role={isStatic ? 'group' : 'dialog'}
        aria-modal={isStatic ? undefined : true}
        aria-labelledby={`${id}-title`}
        aria-describedby={hasSubtitle || !isStatic ? `${id}-${hasSubtitle ? 'subtitle' : 'body'}` : undefined}
        tabIndex={isStatic ? undefined : -1}
        data-scroll={scrolling ? '' : undefined}
        {...rest}
      >
        <div className="ds-popup__header">
          <Illustration type={t} />
          <div className="ds-popup__titles">
            <div className="ds-popup__title" id={`${id}-title`} role="heading" aria-level={2}>
              {title}
            </div>
            {hasSubtitle ? (
              <div className="ds-popup__subtitle" id={`${id}-subtitle`}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <button type="button" className="ds-popup__close" aria-label="Close" onClick={onCloseClick}>
            <Icon name="close" className="ds-popup__close-icon" />
          </button>
        </div>
        <div className="ds-popup__body" id={`${id}-body`}>
          {children}
        </div>
        <div className="ds-popup__footer">
          <div className="ds-popup__actions">
            {showCancel ? (
              <span className="ds-popup__cancel">
                <Button variant="cancel" size={48} onClick={onCancelClick}>
                  {cancelLabel}
                </Button>
              </span>
            ) : null}
            <span className="ds-popup__primary">
              <Button variant="primary" size={48} onClick={onPrimaryClick}>
                {primaryLabel}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---------- modal behavior (same rules as createPopup in popup.js) ----------

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const stack: symbol[] = [];
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

export interface PopupProps extends Omit<PopupViewProps, 'mode' | 'frame' | 'scrolling' | 'behind' | 'rootRef' | 'idBase' | 'onCloseClick' | 'onCancelClick' | 'onPrimaryClick' | 'onBackdropMouseDown' | 'onBackdropClick'> {
  /** Closed means not rendered. The application owns this state. */
  open?: boolean;
  /** The close control, Cancel, Escape or (if enabled) the backdrop asked to close. Set `open` to false in response. */
  onClose?: (reason: PopupCloseReason) => void;
  /** The primary action was pressed. The popup does not close: the application decides. */
  onPrimary?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Cancel was pressed. `onClose('cancel')` follows. */
  onCancel?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Escape closes the popup. Default true. Only the topmost popup reacts. */
  closeOnEscape?: boolean;
  /** A click on the backdrop closes the popup. Default false: Figma defines no such rule. */
  closeOnBackdrop?: boolean;
  /**
   * Where the popup is rendered. Default `document.body` (fills the window and locks page scroll). Pass a positioned
   * element to contain the popup in it. `null` renders nothing yet (for a container that is not mounted).
   */
  container?: HTMLElement | null;
  /** Focus moves to the dialog when it opens. Default true. */
  autoFocus?: boolean;
  /** Element to focus on close. Default: the element that had focus when the popup opened. */
  returnFocusTo?: RefObject<HTMLElement | null>;
}

/**
 * Accessible modal dialog (Figma "modal" + "blur"). Renders the markup of `PopupView` in a portal, and adds:
 * focus moved to the dialog, a Tab focus trap, `inert` on everything else in the container, page scroll lock (for the
 * window), Escape (topmost popup only), focus restored on close, and the scroll look when the content does not fit.
 * Close, Cancel and the primary action are separate: the primary action never closes the popup.
 * The bubbling events `ds-popup-open`, `ds-popup-primary`, `ds-popup-cancel` and `ds-popup-close` (`detail.reason`)
 * are dispatched on the overlay like in the HTML component.
 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup(
  { open = false, onClose, onPrimary, onCancel, closeOnEscape = true, closeOnBackdrop = false, container, autoFocus = true, returnFocusTo, ...view },
  ref,
) {
  const base = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const latest = useRef({ onClose, onPrimary, onCancel, closeOnEscape, closeOnBackdrop, autoFocus, returnFocusTo });
  useLayoutEffect(() => {
    latest.current = { onClose, onPrimary, onCancel, closeOnEscape, closeOnBackdrop, autoFocus, returnFocusTo };
  });

  const target = container === undefined ? (typeof document === 'undefined' ? null : document.body) : container;
  const contained = target !== null && typeof document !== 'undefined' && target !== document.body;
  const active = open && target !== null;

  const setDialog = useCallback(
    (node: HTMLDivElement | null) => {
      dialogRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const emit = useCallback((name: string, detail: Record<string, unknown> = {}) => {
    rootRef.current?.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }, []);

  const requestClose = useCallback(
    (reason: PopupCloseReason) => {
      emit('ds-popup-close', { reason });
      latest.current.onClose?.(reason);
    },
    [emit],
  );

  // The popup is measured without its scrolling look, so the decision cannot flip back and forth.
  const refresh = useCallback(() => {
    const dialog = dialogRef.current;
    const bodyEl = dialog?.querySelector<HTMLElement>('.ds-popup__body');
    if (!dialog || !bodyEl) return;
    dialog.removeAttribute('data-scroll');
    if (bodyEl.scrollHeight > bodyEl.clientHeight + 1) dialog.setAttribute('data-scroll', '');
  }, []);

  // The content may change on any render, so the scroll look is checked after each one.
  useLayoutEffect(() => {
    if (active) refresh();
  });

  useLayoutEffect(() => {
    if (!active || !target) return undefined;
    const root = rootRef.current;
    const dialog = dialogRef.current;
    if (!root || !dialog) return undefined;

    const token = Symbol('popup');
    const initialOpener = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;

    // Everything behind the popup becomes inert: not focusable, not clickable, hidden from assistive technology.
    const inerted = [...target.children].filter((el): el is HTMLElement => el !== root && el instanceof HTMLElement && !el.inert);
    inerted.forEach((el) => {
      el.inert = true;
    });
    if (!contained) lockScroll();
    stack.push(token);

    const focusables = () => [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
    const onKeydown = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== token) return;
      if (event.key === 'Escape' && latest.current.closeOnEscape && !event.defaultPrevented) {
        event.preventDefault();
        requestClose('escape');
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
      const activeEl = document.activeElement;
      if (!dialog.contains(activeEl) || (event.shiftKey && (activeEl === first || activeEl === dialog)) || (!event.shiftKey && activeEl === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', onKeydown, true);

    const observer = new ResizeObserver(refresh);
    observer.observe(root);
    refresh();

    if (latest.current.autoFocus) dialog.focus({ preventScroll: true });
    emit('ds-popup-open');

    return () => {
      document.removeEventListener('keydown', onKeydown, true);
      observer.disconnect();
      const at = stack.indexOf(token);
      if (at >= 0) stack.splice(at, 1);
      inerted.forEach((el) => {
        el.inert = false;
      });
      if (!contained) unlockScroll();
      const opener = latest.current.returnFocusTo?.current ?? initialOpener;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [active, target, contained, emit, refresh, requestClose]);

  // A server render has no `document`, so it shows nothing, like a closed popup.
  if (!active || !target) return null;

  return createPortal(
    <PopupView
      {...view}
      ref={setDialog}
      rootRef={rootRef}
      idBase={base}
      mode={contained ? 'contained' : 'fixed'}
      onCloseClick={() => requestClose('close-button')}
      onCancelClick={(event) => {
        latest.current.onCancel?.(event);
        emit('ds-popup-cancel');
        requestClose('cancel');
      }}
      onPrimaryClick={(event) => {
        latest.current.onPrimary?.(event);
        emit('ds-popup-primary');
      }}
      onBackdropMouseDown={(event) => event.preventDefault()}
      onBackdropClick={() => {
        if (latest.current.closeOnBackdrop) requestClose('backdrop');
      }}
    />,
    target,
  );
});
