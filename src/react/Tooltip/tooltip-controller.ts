export type TooltipPhase = 'hidden' | 'entering' | 'visible' | 'exiting';
export interface TooltipState { readonly phase: TooltipPhase; readonly open: boolean }
/** Per-instance interaction state, independent of DOM positioning. No content expiry timer. */
export function createTooltipController() {
  let state: TooltipState = { phase: 'hidden', open: false };
  const reasons = new Set<string>();
  const listeners = new Set<() => void>();
  let dismissed = false;
  let reduced = false;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let phaseTimer: ReturnType<typeof setTimeout> | undefined;
  const publish = (next: TooltipState) => { state = next; listeners.forEach(listener => listener()); };
  const stopShow = () => { clearTimeout(showTimer); showTimer = undefined; };
  const stopHide = () => { clearTimeout(hideTimer); hideTimer = undefined; };
  const stopPhase = () => { clearTimeout(phaseTimer); phaseTimer = undefined; };
  const show = () => {
    stopShow(); stopHide(); stopPhase();
    if (dismissed || !reasons.size) return;
    publish({ phase: reduced ? 'visible' : 'entering', open: true });
    if (!reduced) phaseTimer = setTimeout(() => publish({ phase: 'visible', open: true }), 150);
  };
  const hide = () => {
    stopShow(); stopHide(); stopPhase();
    if (state.phase === 'hidden') return;
    publish({ phase: reduced ? 'hidden' : 'exiting', open: false });
    if (!reduced) phaseTimer = setTimeout(() => publish({ phase: 'hidden', open: false }), 120);
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    enter(reason: 'trigger' | 'tooltip' | 'focus') {
      reasons.add(reason); stopHide();
      if (dismissed || state.open) return;
      stopShow();
      if (reason === 'focus' || state.phase === 'exiting') show();
      else showTimer = setTimeout(show, 100);
    },
    leave(reason: 'trigger' | 'tooltip' | 'focus') {
      reasons.delete(reason);
      if (reasons.size) return;
      dismissed = false; stopShow(); stopHide();
      hideTimer = setTimeout(hide, 100); // Cross the pointer gap without flicker.
    },
    dismiss() { dismissed = reasons.size > 0; hide(); },
    setReducedMotion(value: boolean) {
      reduced = value;
      if (value && (state.phase === 'entering' || state.phase === 'exiting')) {
        stopPhase(); publish({ phase: state.open ? 'visible' : 'hidden', open: state.open });
      }
    },
    reset() { stopShow(); stopHide(); stopPhase(); reasons.clear(); dismissed = false; publish({ phase: 'hidden', open: false }); },
  };
}
