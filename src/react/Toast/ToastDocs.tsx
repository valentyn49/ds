import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button/Button';
import { Toast } from './Toast';
import { ToastProvider, useToast, useToastState } from './ToastProvider';
import { TOAST_TYPES } from './toast-manager';
import type { ToastOptions, ToastType } from './toast-manager';
import '../../docs/button-docs.css';
import '../../docs/toast-docs.css';

export interface ToastPlaygroundProps {
  type: ToastType;
  message: string;
  showIcon: boolean;
  close: boolean;
  action: boolean;
  timing: 'automatic' | 'extended' | 'persistent' | 'custom';
  duration: number;
}
export function ToastPlayground(props: ToastPlaygroundProps) {
  return <ToastProvider><PlaygroundControls {...props} /></ToastProvider>;
}
function PlaygroundControls({ type, message, showIcon, close, action, timing, duration }: ToastPlaygroundProps) {
  const { toast, dismiss, clear } = useToast();
  const state = useToastState();
  const [feedback, setFeedback] = useState('');
  const input: ToastOptions = { type, message: message.trim() ? message : 'You have successfully', showIcon, close,
    duration: timing === 'persistent' ? null : timing === 'extended' ? 10000 : timing === 'custom' ? duration : undefined,
    action: action ? { label: 'UNDO', onClick: () => setFeedback('Undo callback executed.') } : undefined };
  return <div className="ds-toast-docs">
    <div className="ds-toast-docs__toolbar"><Button size={36} onClick={() => toast(input)}>Trigger toast</Button><Button size={36} variant="secondary" onClick={() => { for (let i = 1; i <= 3; i++) toast({ ...input, message: `${i}. ${input.message}` }); }}>Queue 3</Button><Button size={36} variant="secondary" disabled={!state.active} onClick={() => state.active && dismiss(state.active.id)}>Dismiss active</Button><Button size={36} variant="secondary" disabled={!state.active} onClick={clear}>Clear queue</Button></div>
    <p className="ds-toast-docs__caption">The live notification appears above the page at its actual viewport position. Use the Storybook canvas viewport for real device placement; the controls below configure the next notification.</p>
    <dl className="ds-toast-docs__state"><div><dt>Lifecycle</dt><dd>{state.active ? state.phase : 'Idle'}</dd></div><div><dt>Active</dt><dd>{state.active?.message ?? 'None'}</dd></div><div><dt>Queued</dt><dd>{state.queued.length}</dd></div></dl>
    {state.queued.length > 0 && <ol className="ds-toast-docs__queue">{state.queued.map(item => <li key={item.id}>{item.message}</li>)}</ol>}
    <p role="status" className="ds-toast-docs__caption">{feedback}</p>
  </div>;
}
export function ToastTypes() {
  const [feedback, setFeedback] = useState('');
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const remove = (id: string, action = false) => { setDismissed(previous => new Set([...previous, id])); setFeedback(action ? 'Undo callback executed; specimen dismissed.' : 'Specimen dismissed.'); };
  return <div className="ds-toast-docs"><Button size={36} variant="secondary" onClick={() => { setDismissed(new Set()); setFeedback(''); }}>Reset specimens</Button><div className="ds-toast-docs__types">{TOAST_TYPES.map(type => <div key={type}><code>{type}</code>{dismissed.has(type) ? <span className="ds-toast-docs__caption">Dismissed</span> : <Toast type={type} message="You have successfully" onDismiss={() => remove(type)} />}</div>)}</div>
    <h3>Verified content properties</h3><div className="ds-toast-docs__configurations">
      {!dismissed.has('watchlist') && <Toast type="info" message="Added to “Energy” watchlist" showIcon={false} action={{ onClick: () => remove('watchlist', true) }} onDismiss={() => remove('watchlist')} />}
      {!dismissed.has('neutral-action') && <Toast type="neutral" message="You have successfully" action={{ onClick: () => remove('neutral-action', true) }} onDismiss={() => remove('neutral-action')} />}
      <Toast type="purchase" message="You have successfully" close={false} />
      {!dismissed.has('long-message') && <Toast type="info" message="Your watchlist has been updated. This longer message wraps without covering its controls." onDismiss={() => remove('long-message')} />}
    </div><p className="ds-toast-docs__caption" role="status">{feedback || 'Visual specimens. Close or Undo dismisses a specimen; Reset restores the full inventory. Managed notifications additionally animate and queue.'}</p>
  </div>;
}
export function ToastAnatomy() {
  return <div className="ds-toast-docs"><div className="ds-bd-anatomy__stage"><div className="ds-bd-anatomy__figure" inert>
    <Toast type="info" message="Changes saved" action={{ onClick() {} }} onDismiss={() => {}} />
    <span className="ds-bd-marker ds-bd-marker--top" style={{ left: 0 }}><b>1</b></span><span className="ds-bd-marker ds-bd-marker--bottom" style={{ left: 12 }}><b>2</b></span><span className="ds-bd-marker ds-bd-marker--top" style={{ left: 105 }}><b>3</b></span><span className="ds-bd-marker ds-bd-marker--bottom" style={{ right: 57 }}><b>4</b></span><span className="ds-bd-marker ds-bd-marker--top" style={{ right: 10 }}><b>5</b></span>
    </div></div><ol className="ds-bd-anatomy__legend">{[['Container', '343 × 36 px reference, 4 px corners, shadow-lg; 8 px vertical and 12 px horizontal padding.'], ['Status icon', 'Original Figma icon in a 20 × 20 px slot, optional.'], ['Message', 'Proxima Nova Semibold, 14/20. One message field; no separate title or supporting text.'], ['Action', 'Optional UNDO text control; Semibold 12/16, uppercase.'], ['Close', 'Optional 20 px control with an accessible label.']].map(([name, description], index) => <li key={name}><b>{index + 1}</b><div><strong>{name}</strong><span>{description}</span></div></li>)}</ol></div>;
}

function DeviceContent({ body, desktop }: { body: HTMLElement; desktop: boolean }) {
  return <ToastProvider container={body}><DeviceControls desktop={desktop} /></ToastProvider>;
}
function DeviceControls({ desktop }: { desktop: boolean }) {
  const { toast, clear } = useToast();
  const [undo, setUndo] = useState(false);
  const show = () => { clear(); toast({ type: 'info', message: 'Added to “Energy” watchlist', showIcon: false, duration: null, action: desktop ? { onClick: () => setUndo(true) } : undefined }); };
  const initiallyShown = useRef(false);
  useEffect(() => { if (!initiallyShown.current) { initiallyShown.current = true; show(); } }, []);
  return <div className="ds-toast-docs__app"><header><strong>Test Design System</strong><span>Market Overview · Watchlists</span></header><main><h2>Market Overview</h2><p>Schematic application context. The notification uses the actual viewport positioning system.</p><Button size={36} onClick={show}>Show toast again</Button>{undo && <p role="status">Undo callback executed.</p>}<div className="ds-toast-docs__mock-grid"><article>Market summary</article><article>Watchlists</article><article>Weekly overview</article></div></main></div>;
}
function DeviceFrame({ name, width, height, desktop }: { name: string; width: number; height: number; desktop: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [body, setBody] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [width]);
  const loaded = () => {
    const doc = frame.current?.contentDocument;
    if (!doc || doc.body.dataset.toastPreview) return;
    doc.body.dataset.toastPreview = 'true';
    doc.documentElement.lang = 'en';
    const base = doc.createElement('base'); base.href = document.baseURI; doc.head.append(base);
    for (const style of document.querySelectorAll('style, link[rel="stylesheet"]')) doc.head.append(style.cloneNode(true));
    const reset = doc.createElement('style'); reset.textContent = 'html,body{margin:0;min-height:100%;background:#eff3f6}'; doc.head.append(reset);
    setBody(doc.body);
  };
  return <section className="ds-toast-docs__device"><h3>{name} · {width} × {height}</h3><div ref={host} className="ds-toast-docs__device-host"><div style={{ width: width * scale, height: height * scale }}><iframe ref={frame} title={`${name} toast placement`} srcDoc="<!doctype html><html lang='en'><head><title>Toast placement</title></head><body></body></html>" onLoad={loaded} style={{ width, height, transform: `scale(${scale})` }} />{body && createPortal(<DeviceContent body={body} desktop={desktop} />, body)}</div></div></section>;
}
export function ToastResponsive() {
  return <div className="ds-toast-docs"><p className="ds-toast-docs__caption">Independent, scaled live browser viewports at the exact Figma dimensions. Each has its own provider and controls; the toast is fixed to that iframe’s viewport.</p><DeviceFrame name="Desktop" width={1440} height={900} desktop /><DeviceFrame name="Tablet" width={744} height={900} desktop={false} /><DeviceFrame name="Mobile" width={375} height={812} desktop={false} /></div>;
}

export function ToastMotionDemo() {
  return <ToastPlayground type="info" message="Added to “Energy” watchlist" showIcon={false} close action={false} timing="automatic" duration={4000} />;
}
export function ToastQueueDemo() {
  return <ToastPlayground type="purchase" message="Changes saved" showIcon close action={false} timing="automatic" duration={4000} />;
}
