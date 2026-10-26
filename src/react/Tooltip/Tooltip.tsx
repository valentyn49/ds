import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { HTMLAttributes, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { createTooltipController } from './tooltip-controller';
import { positionTooltip, tooltipMaxHeight } from './position';
import type { TooltipType } from './position';
import bottom from '../../components/tooltip/assets/bottom.svg';
import top from '../../components/tooltip/assets/top.svg';
import right from '../../components/tooltip/assets/right.svg';
import left from '../../components/tooltip/assets/left.svg';
import '../../components/tooltip/tooltip.css';

const arrows = { bottom, top, right, left };
export interface TooltipProps {
  /** Figma title property. Plain informational text; no interactive content. */
  title: string;
  subtitle?: string;
  showSubtitle?: boolean;
  /** Exact Figma pointer edge. bottom means the tooltip is above its trigger. */
  type?: TooltipType;
  /** One focusable element that forwards aria-describedby, such as Button or a native button. */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  id?: string;
  className?: string;
}

export function Tooltip({ title, subtitle, showSubtitle = true, type = 'bottom', children, id, className }: TooltipProps) {
  const generated = useId();
  const tooltipId = id ?? `ds-tooltip-${generated}`;
  const trigger = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [controller] = useState(createTooltipController);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [painted, setPainted] = useState(false);
  const [actualType, setActualType] = useState(type);
  const generation = useRef(0);
  const active = state.phase !== 'hidden';
  useEffect(() => {
    setTarget(trigger.current?.ownerDocument.body ?? null);
    const current = ++generation.current;
    return () => { queueMicrotask(() => { if (generation.current === current) controller.reset(); }); };
  }, [controller]);
  useEffect(() => {
    const view = target?.ownerDocument.defaultView;
    if (!view) return;
    const media = view.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => controller.setReducedMotion(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [target, controller]);
  useEffect(() => {
    if (!target || !state.open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault(); event.stopPropagation(); controller.dismiss();
    };
    const doc = target.ownerDocument;
    doc.addEventListener('keydown', escape, true);
    return () => doc.removeEventListener('keydown', escape, true);
  }, [target, state.open, controller]);
  useLayoutEffect(() => {
    const node = panel.current;
    const anchor = trigger.current;
    const view = target?.ownerDocument.defaultView;
    if (!active || !node || !anchor || !view) { setPainted(false); return; }
    let frame = 0;
    let paintFrame = 0;
    let disposed = false;
    const update = () => {
      if (disposed) return;
      const visual = view.visualViewport;
      const viewport = { left: visual?.offsetLeft ?? 0, top: visual?.offsetTop ?? 0, width: visual?.width ?? view.document.documentElement.clientWidth, height: visual?.height ?? view.innerHeight };
      const rect = anchor.getBoundingClientRect();
      if (rect.bottom < viewport.top || rect.top > viewport.top + viewport.height || rect.right < viewport.left || rect.left > viewport.left + viewport.width) { controller.dismiss(); return; }
      const maxHeight = tooltipMaxHeight(rect, viewport);
      if (maxHeight < 36) { controller.dismiss(); return; }
      node.style.setProperty('--tooltip-max-height', `${maxHeight}px`);
      let candidate = type;
      let result;
      // A flip can change source width. Measure the actual candidate before placing it.
      for (let pass = 0; pass < 4; pass++) {
        node.dataset.type = candidate;
        node.style.maxWidth = `${Math.max(1, viewport.width - 16 - (candidate === 'left' ? 7 : 0))}px`;
        result = positionTooltip(rect, node.getBoundingClientRect(), viewport, candidate);
        if (result.type === candidate) break;
        candidate = result.type;
      }
      if (!result) return;
      node.dataset.type = result.type;
      node.style.left = `${result.x}px`;
      node.style.top = `${result.y}px`;
      node.style.setProperty('--tooltip-arrow', `${result.arrow}px`);
      node.style.visibility = 'visible';
      setActualType(result.type);
    };
    const schedule = () => { view.cancelAnimationFrame(frame); frame = view.requestAnimationFrame(update); };
    update();
    paintFrame = view.requestAnimationFrame(() => { if (!disposed) setPainted(true); });
    const observer = new ResizeObserver(schedule);
    observer.observe(anchor); observer.observe(node);
    view.addEventListener('resize', schedule);
    view.document.addEventListener('scroll', schedule, true);
    view.visualViewport?.addEventListener('resize', schedule);
    view.visualViewport?.addEventListener('scroll', schedule);
    void view.document.fonts?.ready.then(() => { if (!disposed) schedule(); });
    return () => {
      disposed = true; observer.disconnect(); view.cancelAnimationFrame(frame); view.cancelAnimationFrame(paintFrame);
      view.removeEventListener('resize', schedule); view.document.removeEventListener('scroll', schedule, true);
      view.visualViewport?.removeEventListener('resize', schedule); view.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, [active, target, type, title, subtitle, showSubtitle, controller]);
  const describedBy = [...new Set([...(children.props['aria-describedby']?.split(/\s+/).filter(Boolean) ?? []), tooltipId])].join(' ');
  const description = <><span className="ds-tooltip__title" dir="auto">{title}</span>{showSubtitle && subtitle && <span className="ds-tooltip__subtitle" dir="auto">{subtitle}</span>}</>;
  return <>
    <span ref={trigger} className="ds-tooltip-trigger"
      onPointerEnter={event => { if (event.pointerType !== 'touch') controller.enter('trigger'); }} onPointerLeave={() => controller.leave('trigger')}
      onFocusCapture={() => controller.enter('focus')}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) controller.leave('focus'); }}>
      {cloneElement(children, { 'aria-describedby': describedBy })}
      {!target && <span id={tooltipId} hidden>{description}</span>}
    </span>
    {target && createPortal(<div ref={panel} id={tooltipId} role="tooltip" className={`ds-tooltip ${className ?? ''}`}
      hidden={!active} data-type={actualType} data-open={state.open && painted} data-phase={state.phase}
      style={{ visibility: painted ? 'visible' : 'hidden' }}
      onPointerEnter={() => controller.enter('tooltip')} onPointerLeave={() => controller.leave('tooltip')}>
      <div className="ds-tooltip__content">{description}</div>
      <span className="ds-tooltip__arrow" aria-hidden="true"><img src={arrows[actualType]} alt="" /></span>
    </div>, target)}
  </>;
}
