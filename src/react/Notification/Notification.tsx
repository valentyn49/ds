import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import '../../components/notification/notification.css';
import { notificationHTML } from '../../components/notification/notification.js';
import { NOTIFICATION_TYPES, NOTIFICATION_STATES, STATE_ICONS } from '../../components/notification/notification.spec.js';
import { ICON_PATHS } from '../../components/icons/icon-paths.js';
import { Button } from '../Button/Button';
import { cx } from '../utils/cx';

export type NotificationType = 'home' | 'default';
export type NotificationState = 'warning' | 'success' | 'info' | 'alert' | 'gray' | 'white';

/** The Figma values, re-exported from the spec so the TypeScript unions and the spec cannot drift apart silently. */
export const NOTIFICATION_TYPE_LIST = NOTIFICATION_TYPES as NotificationType[];
export const NOTIFICATION_STATE_LIST = NOTIFICATION_STATES as NotificationState[];

// The shared icon set has `warning` and `close`. The three status icons (check_filled, info, report) are private to
// the HTML module, so their paths are read from the markup it builds instead of being copied.
const pathFromHtml = (state: NotificationState): string =>
  /<svg class="ds-notification__icon-svg"[^>]*><path d="([^"]+)"/.exec(notificationHTML({ state, showIcon: true, close: false }))?.[1] ?? '';

const STATUS_ICON_PATHS: Record<string, string> = {
  warning: ICON_PATHS.warning,
  check_filled: pathFromHtml('success'),
  info: pathFromHtml('info'),
  report: pathFromHtml('alert'),
};

// Visually hidden text that names the status for assistive technology. Gray and white are neutral and get none.
const STATUS_LABEL: Partial<Record<NotificationState, string>> = { warning: 'Warning', success: 'Success', info: 'Information', alert: 'Alert' };

const Svg = ({ className, path }: { className: string; path: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d={path} />
  </svg>
);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Where focus goes when a focused banner is dismissed: the next focusable element on the page, else the previous one.
function focusTargetAway(banner: HTMLElement): HTMLElement | undefined {
  const focusable = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !banner.contains(el) && el.offsetParent !== null);
  const after = focusable.find((el) => banner.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  const before = [...focusable].reverse().find((el) => banner.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING);
  return after ?? before;
}

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Figma `type`. */
  type?: NotificationType;
  /** Figma `state`: the status of the message. */
  state?: NotificationState;
  /** Figma `show icon`. */
  showIcon?: boolean;
  /** Figma `close`: shows the close control. */
  close?: boolean;
  /** Figma `Text`: the message. */
  children: ReactNode;
  /** Figma `show button` + the Button label: present means the text Button is shown. */
  buttonText?: string;
  /** Click handler of the optional Button. Figma gives the Button no destination or action. */
  onButtonClick?: MouseEventHandler<HTMLButtonElement>;
  /** Controlled visibility. Without it the banner manages its own visibility. */
  open?: boolean;
  /** Initial visibility when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the close control is pressed. In controlled mode, set `open` to false to hide the banner. */
  onDismiss?: () => void;
}

/**
 * Messages (banners). Same markup and classes as the HTML `notificationHTML()` builder, styled by the same
 * `notification.css`. Only the `alert` state uses `role="alert"`; every other state uses `role="status"`.
 * Dismissing hides the banner (it stays mounted, with the `hidden` attribute, as in the HTML component), moves focus
 * to the next focusable element when the banner had focus, and dispatches a bubbling `ds-notification-dismiss` event.
 * There is no timer and no automatic dismissal.
 */
export const Notification = forwardRef<HTMLDivElement, NotificationProps>(function Notification(
  {
    type = 'default',
    state = 'info',
    showIcon = true,
    close = true,
    children,
    buttonText,
    onButtonClick,
    open,
    defaultOpen = true,
    onDismiss,
    className,
    role,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const pendingFocus = useRef<HTMLElement | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      pendingFocus.current = undefined;
    } else if (pendingFocus.current) {
      pendingFocus.current.focus();
      pendingFocus.current = undefined;
    }
  }, [isOpen]);

  const dismiss = () => {
    const root = rootRef.current;
    if (!root) return;
    pendingFocus.current = root.contains(document.activeElement) ? focusTargetAway(root) : undefined;
    if (open === undefined) setInternalOpen(false);
    root.dispatchEvent(new CustomEvent('ds-notification-dismiss', { bubbles: true }));
    onDismiss?.();
  };

  const statusLabel = STATUS_LABEL[state];
  const iconPath = STATUS_ICON_PATHS[(STATE_ICONS as Record<string, string>)[state]];

  return (
    <div
      ref={rootRef}
      className={cx('ds-notification', `ds-notification--${type}`, `ds-notification--${state}`, className)}
      role={role ?? (state === 'alert' ? 'alert' : 'status')}
      hidden={!isOpen}
      {...rest}
    >
      <div className="ds-notification__row">
        {showIcon ? (
          <span className="ds-notification__icon">
            <Svg className="ds-notification__icon-svg" path={iconPath} />
          </span>
        ) : null}
        <div className="ds-notification__text">
          {statusLabel ? <span className="ds-notification__status">{`${statusLabel}: `}</span> : null}
          {children}
        </div>
        {buttonText !== undefined ? (
          <span className="ds-notification__action">
            <Button variant="text" size={36} onClick={onButtonClick}>
              {buttonText}
            </Button>
          </span>
        ) : null}
        {close ? (
          <button type="button" className="ds-notification__close" aria-label="Close" onClick={dismiss}>
            <Svg className="ds-notification__close-svg" path={ICON_PATHS.close} />
          </button>
        ) : null}
      </div>
    </div>
  );
});
