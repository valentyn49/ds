export const TOAST_TYPES = ['purchase', 'warning', 'alert', 'neutral', 'info'] as const;
export type ToastType = (typeof TOAST_TYPES)[number];
export type ToastPhase = 'entering' | 'visible' | 'exiting';
export interface ToastAction { label?: string; onClick: () => void }
export interface ToastOptions {
  type?: ToastType;
  message: string;
  showIcon?: boolean;
  close?: boolean;
  action?: ToastAction;
  /** Positive milliseconds; null persists. Actions persist unless explicitly overridden. */
  duration?: number | null;
}
export interface ToastRecord extends ToastOptions {
  readonly id: string;
  readonly type: ToastType;
  readonly duration: number | null;
}
export interface ToastSnapshot {
  readonly active: ToastRecord | null;
  readonly phase: ToastPhase;
  readonly queued: readonly ToastRecord[];
}
export interface ToastMotion { enter: number; exit: number }
let managerSequence = 0;
const checkDuration = (value: number | null) => {
  if (value !== null && (!Number.isFinite(value) || value <= 0 || value > 2147483647)) throw new Error('Toast duration must be positive milliseconds (up to 2147483647) or null.');
};

/** DOM-independent FIFO lifecycle. Presentation starts only when a viewport mounts the record. */
export function createToastManager({ defaultDuration = 4000 }: { defaultDuration?: number | null } = {}) {
  checkDuration(defaultDuration);
  const prefix = `toast-${++managerSequence}-`;
  let sequence = 0;
  let snapshot: ToastSnapshot = { active: null, phase: 'entering', queued: [] };
  const listeners = new Set<() => void>();
  const pauses = new Set<string>();
  let autoTimer: ReturnType<typeof setTimeout> | undefined;
  let motionTimer: ReturnType<typeof setTimeout> | undefined;
  let remaining: number | null = null;
  let startedAt = 0;
  let presented = false;
  let motion: ToastMotion = { enter: 180, exit: 150 };
  const publish = (next: ToastSnapshot) => { snapshot = next; listeners.forEach(listener => listener()); };
  const clearAuto = () => { clearTimeout(autoTimer); autoTimer = undefined; };
  const clearMotion = () => { clearTimeout(motionTimer); motionTimer = undefined; };
  const startAuto = () => {
    clearAuto();
    if (!snapshot.active || snapshot.phase !== 'visible' || pauses.size || remaining === null) return;
    const id = snapshot.active.id;
    startedAt = Date.now();
    autoTimer = setTimeout(() => dismiss(id), Math.max(0, remaining));
  };
  const activate = (active: ToastRecord | null, queued: readonly ToastRecord[]) => {
    clearAuto(); clearMotion(); pauses.clear(); presented = false;
    remaining = active?.duration ?? null;
    publish({ active, phase: 'entering', queued });
  };
  const entered = (id: string) => {
    if (snapshot.active?.id !== id || snapshot.phase !== 'entering' || !presented) return;
    clearMotion(); publish({ ...snapshot, phase: 'visible' }); startAuto();
  };
  const exited = (id: string) => {
    if (snapshot.active?.id !== id || snapshot.phase !== 'exiting') return;
    const [next, ...rest] = snapshot.queued;
    activate(next ?? null, rest);
  };
  function dismiss(id: string) {
    if (snapshot.active?.id !== id) {
      const queued = snapshot.queued.filter(item => item.id !== id);
      if (queued.length !== snapshot.queued.length) publish({ ...snapshot, queued });
      return;
    }
    if (snapshot.phase === 'exiting') return;
    clearAuto(); clearMotion();
    publish({ ...snapshot, phase: 'exiting' });
    if (!presented || motion.exit === 0) exited(id);
    else motionTimer = setTimeout(() => exited(id), motion.exit + 50);
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    toast(options: ToastOptions): string {
      const type = options.type ?? 'purchase';
      if (!(TOAST_TYPES as readonly string[]).includes(type)) throw new Error(`Unknown Toast type: ${type}`);
      if (typeof options.message !== 'string' || !options.message.trim()) throw new Error('Toast message must be a nonempty string.');
      const duration = options.duration !== undefined ? options.duration : options.action ? null : defaultDuration;
      checkDuration(duration);
      const record: ToastRecord = Object.freeze({ ...options, action: options.action ? Object.freeze({ ...options.action }) : undefined, id: prefix + ++sequence, type, duration });
      if (!snapshot.active) activate(record, []);
      else publish({ ...snapshot, queued: [...snapshot.queued, record] });
      return record.id;
    },
    dismiss,
    clear() { publish({ ...snapshot, queued: [] }); if (snapshot.active) dismiss(snapshot.active.id); },
    present(id: string, durations: ToastMotion) {
      if (snapshot.active?.id !== id) return;
      motion = durations;
      if (presented) {
        if (snapshot.phase === 'entering' && !motion.enter) entered(id);
        if (snapshot.phase === 'exiting' && !motion.exit) exited(id);
        return;
      }
      presented = true;
      if (snapshot.phase === 'entering') {
        if (!motion.enter) entered(id);
        else motionTimer = setTimeout(() => entered(id), motion.enter + 50);
      }
    },
    entered,
    exited,
    pause(id: string, reason: string) {
      if (snapshot.active?.id !== id || pauses.has(reason)) return;
      if (!pauses.size && snapshot.phase === 'visible' && remaining !== null && autoTimer !== undefined) remaining = Math.max(0, remaining - (Date.now() - startedAt));
      pauses.add(reason); clearAuto();
    },
    resume(id: string, reason: string) {
      if (snapshot.active?.id !== id || !pauses.delete(reason)) return;
      if (!pauses.size) startAuto();
    },
    performAction(id: string) {
      if (snapshot.active?.id !== id || snapshot.phase === 'exiting' || !snapshot.active.action) return;
      snapshot.active.action.onClick();
      dismiss(id);
    },
    /** Stop pending work when the owning provider is removed. Safe to call again. */
    reset() { clearAuto(); clearMotion(); activate(null, []); },
  };
}
export type ToastManager = ReturnType<typeof createToastManager>;
