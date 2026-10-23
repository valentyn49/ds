import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Toast, TOAST_LABELS } from './Toast';
import { createToastManager } from './toast-manager';
import type { ToastManager, ToastOptions, ToastSnapshot } from './toast-manager';

export interface ToastApi {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}
const Context = createContext<(ToastApi & { manager: ToastManager }) | null>(null);
export function useToast(): ToastApi {
  const value = useContext(Context);
  if (!value) throw new Error('useToast must be used inside ToastProvider.');
  return value;
}
/** Diagnostic queue state for product integrations and documentation. */
export function useToastState(): ToastSnapshot {
  const value = useContext(Context);
  if (!value) throw new Error('useToastState must be used inside ToastProvider.');
  return useSyncExternalStore(value.manager.subscribe, value.manager.getSnapshot, value.manager.getSnapshot);
}
export interface ToastProviderProps {
  children: ReactNode;
  /** Reading-time preference, fixed for this provider's lifetime. Null disables default auto-dismiss. */
  defaultDuration?: number | null;
  /** Defaults to document.body. A same-origin iframe body supports faithful device previews. */
  container?: HTMLElement | null;
}

export function ToastProvider({ children, defaultDuration = 4000, container }: ToastProviderProps) {
  const [manager] = useState(() => createToastManager({ defaultDuration }));
  const [body, setBody] = useState<HTMLElement | null>(null);
  const anchors = useRef(new Map<string, HTMLElement>());
  const generation = useRef(0);
  const target = container ?? body;
  useEffect(() => {
    setBody(document.body);
    const current = ++generation.current;
    return () => { queueMicrotask(() => { if (generation.current === current) { manager.reset(); anchors.current.clear(); } }); };
  }, [manager]);
  const toast = useCallback((options: ToastOptions) => {
    const id = manager.toast(options);
    const active = (target?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined))?.activeElement;
    if (active && active !== active.ownerDocument.body && typeof (active as HTMLElement).focus === 'function') anchors.current.set(id, active as HTMLElement);
    return id;
  }, [manager, target]);
  const api = useMemo(() => ({ toast, dismiss: manager.dismiss, clear: manager.clear, manager }), [toast, manager]);
  return <Context.Provider value={api}>{children}{target && createPortal(<ToastViewport manager={manager} anchors={anchors.current} target={target} />, target)}</Context.Provider>;
}

function ToastViewport({ manager, anchors, target }: { manager: ToastManager; anchors: Map<string, HTMLElement>; target: HTMLElement }) {
  const snapshot = useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getSnapshot);
  const active = snapshot.active;
  const element = useRef<HTMLDivElement>(null);
  const doc = target.ownerDocument;
  const view = doc.defaultView;
  const [motion, setMotion] = useState(() => view?.matchMedia('(prefers-reduced-motion: reduce)').matches ? { enter: 0, exit: 0 } : view?.matchMedia('(max-width: 576px)').matches ? { enter: 225, exit: 195 } : { enter: 180, exit: 150 });
  // Restore synchronously on dismissal, including a zero-duration reduced-motion exit.
  useLayoutEffect(() => manager.subscribe(() => {
    const state = manager.getSnapshot();
    if (state.phase !== 'exiting' || !state.active || element.current?.dataset.toastId !== state.active.id || !element.current.contains(doc.activeElement)) return;
    const anchor = anchors.get(state.active.id);
    if (anchor?.isConnected) anchor.focus({ preventScroll: true });
    else (doc.activeElement as HTMLElement | null)?.blur();
  }), [manager, anchors, doc]);
  useEffect(() => {
    if (!view) return;
    const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = view.matchMedia('(max-width: 576px)');
    const update = () => setMotion(reduced.matches ? { enter: 0, exit: 0 } : mobile.matches ? { enter: 225, exit: 195 } : { enter: 180, exit: 150 });
    update(); reduced.addEventListener('change', update); mobile.addEventListener('change', update);
    return () => { reduced.removeEventListener('change', update); mobile.removeEventListener('change', update); };
  }, [view]);
  useEffect(() => { if (active) manager.present(active.id, motion); }, [manager, active?.id, motion]);
  useEffect(() => {
    if (!active || !view) return;
    const visibility = () => doc.hidden ? manager.pause(active.id, 'document') : manager.resume(active.id, 'document');
    const blur = () => manager.pause(active.id, 'window');
    const focus = () => manager.resume(active.id, 'window');
    visibility(); doc.addEventListener('visibilitychange', visibility); view.addEventListener('blur', blur); view.addEventListener('focus', focus);
    return () => { doc.removeEventListener('visibilitychange', visibility); view.removeEventListener('blur', blur); view.removeEventListener('focus', focus); };
  }, [manager, active?.id, doc, view]);
  useLayoutEffect(() => {
    const ids = new Set([active?.id, ...snapshot.queued.map(item => item.id)]);
    for (const id of anchors.keys()) if (!ids.has(id)) anchors.delete(id);
  }, [snapshot, anchors, doc, active]);
  return <>
    <div className="ds-toast-announcer" role="status" aria-live="polite" aria-atomic="true">{active && snapshot.phase === 'visible' && <span key={active.id}>{TOAST_LABELS[active.type]}: {active.message}{active.action ? ` ${active.action.label ?? 'Undo'} available.` : ''}</span>}</div>
    <div className="ds-toast-viewport" aria-label="Notifications">
      {active && <Toast key={active.id} ref={element} type={active.type} message={active.message} showIcon={active.showIcon} close={active.close}
        data-phase={snapshot.phase} data-toast-id={active.id}
        action={active.action ? { label: active.action.label, onClick: () => manager.performAction(active.id) } : undefined}
        onDismiss={() => manager.dismiss(active.id)}
        onPointerEnter={event => { if (event.pointerType !== 'touch') manager.pause(active.id, 'pointer'); }} onPointerLeave={() => manager.resume(active.id, 'pointer')}
        onFocusCapture={() => manager.pause(active.id, 'focus')}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) manager.resume(active.id, 'focus'); }}
        onKeyDown={event => { if (event.key === 'Escape' && active.close !== false) { event.stopPropagation(); manager.dismiss(active.id); } }}
        onAnimationEnd={event => {
          if (event.target !== event.currentTarget) return;
          if (event.animationName === 'ds-toast-enter') manager.entered(active.id);
          if (event.animationName === 'ds-toast-exit') manager.exited(active.id);
        }} />}
    </div>
  </>;
}
