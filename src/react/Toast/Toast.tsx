import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import type { FigmaIconName } from '../Icon/Icon';
import type { ToastAction, ToastType } from './toast-manager';
import '../../components/toast/toast.css';

export const TOAST_ICONS: Record<ToastType, FigmaIconName> = {
  purchase: 'icon/check_filled', warning: 'icon/warning', alert: 'icon/report', neutral: 'icon/check_filled', info: 'icon/info',
};
export const TOAST_LABELS: Record<ToastType, string> = { purchase: 'Success', warning: 'Warning', alert: 'Alert', neutral: 'Notification', info: 'Information' };
export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  type?: ToastType;
  message: string;
  showIcon?: boolean;
  close?: boolean;
  action?: ToastAction;
  onDismiss?: () => void;
  closeLabel?: string;
}
/** Visual surface only. ToastProvider owns announcements, timers, queue, and animation state. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast({ type = 'purchase', message, showIcon = true, close = true, action, onDismiss, closeLabel = 'Dismiss notification', className, ...rest }, ref) {
  return <div ref={ref} className={`ds-toast ${className ?? ''}`} data-type={type} {...rest}>
    <div className="ds-toast__content">{showIcon && <Icon name={TOAST_ICONS[type]} color="currentColor" className="ds-toast__icon" />}<span className="ds-toast__message">{message}</span></div>
    {(action || close) && <div className="ds-toast__controls">
      {action && <button type="button" className="ds-toast__action" onClick={action.onClick}>{action.label ?? 'UNDO'}</button>}
      {close && <button type="button" className="ds-toast__close" aria-label={closeLabel} onClick={onDismiss}><Icon name="icon/close" color="currentColor" /></button>}
    </div>}
  </div>;
});
