import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { TOOLTIP_TYPES } from './position';
import type { TooltipType } from './position';
import '../../docs/button-docs.css';
import '../../docs/tooltip-docs.css';

export const TOOLTIP_SAMPLE = { title: 'Tooltip text', subtitle: 'Small tooltips provide the additional information.' };
export function TooltipDemo({ title, subtitle, showSubtitle, type }: { title: string; subtitle: string; showSubtitle: boolean; type: TooltipType }) {
  const [clicks, setClicks] = useState(0);
  return <div className="ds-td"><div className="ds-td__stage"><Tooltip title={title} subtitle={subtitle} showSubtitle={showSubtitle} type={type}><Button variant="secondary" size={36} onClick={() => setClicks(value => value + 1)}>Hover or focus</Button></Tooltip></div><p className="ds-td__caption">Hover, Tab to focus, or press Escape. The trigger remains clickable. Activations: {clicks}.</p></div>;
}
export function TooltipVariants() {
  return <div className="ds-td"><div className="ds-td__grid">{TOOLTIP_TYPES.map(type => <section key={type}><header><code>type={type}</code><span>Pointer edge</span></header><div className="ds-td__stage"><Tooltip {...TOOLTIP_SAMPLE} type={type}><Button variant="secondary" size={36}>{type}</Button></Tooltip></div></section>)}</div>
    <h3>Optional subtitle</h3><div className="ds-td__stage"><Tooltip {...TOOLTIP_SAMPLE} showSubtitle={false}><Button variant="secondary" size={36}>Title only</Button></Tooltip></div>
    <p className="ds-td__caption">All specimens use the production component. Hover or focus to inspect each direction; near an edge, collision handling may select another verified pointer direction.</p></div>;
}
export function TooltipAnatomy() {
  const [markers, setMarkers] = useState<{ x: number; y: number; number: number }[]>([]);
  useEffect(() => {
    let frame = 0;
    let attached: HTMLElement | null = null;
    const measure = () => {
      const node = document.querySelector<HTMLElement>('.ds-td__annotated');
      if (!node || node.hidden || node.dataset.open !== 'true') { setMarkers(old => old.length ? [] : old); return; }
      const rect = node.getBoundingClientRect();
      const text = node.querySelector('.ds-tooltip__title')!.getBoundingClientRect();
      const arrow = node.querySelector('.ds-tooltip__arrow')!.getBoundingClientRect();
      const next = [{ number: 1, x: rect.left - 14, y: rect.top + 12 }, { number: 2, x: text.right + 22, y: text.top + 10 }, { number: 3, x: arrow.right + 16, y: arrow.top + arrow.height / 2 }];
      setMarkers(old => JSON.stringify(old) === JSON.stringify(next) ? old : next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new MutationObserver(() => {
      const node = document.querySelector<HTMLElement>('.ds-td__annotated');
      if (node && node !== attached) { attached = node; observer.disconnect(); observer.observe(node, { attributes: true, subtree: true, attributeFilter: ['style', 'hidden', 'data-open'] }); }
      schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule); document.addEventListener('scroll', schedule, true);
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', schedule); document.removeEventListener('scroll', schedule, true); };
  }, []);
  return <div className="ds-td"><div className="ds-bd-anatomy__stage ds-td__anatomy"><Tooltip {...TOOLTIP_SAMPLE} className="ds-td__annotated"><Button variant="secondary" size={36}>Inspect anatomy</Button></Tooltip></div>
    <ol className="ds-bd-anatomy__legend">{[['Container', 'White Gray 50 surface, 4 px radius, shadow-2xl and 8/12 px padding.'], ['Content', 'Semibold 14/20 title; optional Regular 12/18 subtitle.'], ['Pointer', 'Original Figma vector, centered on the trigger and shifted only to stay within the surface.']].map(([name, text], i) => <li key={name}><b>{i + 1}</b><div><strong>{name}</strong><span>{text}</span></div></li>)}</ol>
    <p className="ds-td__caption">Hover or focus Inspect anatomy to reveal the actual tooltip and measured annotations. The Button is a documented trigger composition, not part of the Figma Tooltip asset.</p>
    {typeof document !== 'undefined' && createPortal(<div aria-hidden="true" className="ds-td__annotations">{markers.map(marker => <span key={marker.number} className="ds-bd-marker ds-td__marker" style={{ left: marker.x, top: marker.y }}><b>{marker.number}</b></span>)}</div>, document.body)}
  </div>;
}
export function TooltipExamples() {
  return <div className="ds-td">
    <h3>Icon button</h3><div className="ds-td__stage"><Tooltip title="Market information" subtitle="Read supplementary context for this market."><Button variant="secondary" size={36} leftIcon={<Icon name="icon/info" color="currentColor" />} aria-label="Market information" /></Tooltip></div>
    <h3>Text label</h3><div className="ds-td__stage"><Tooltip title="Settlement price" subtitle="The reference price recorded at the end of the trading period."><span tabIndex={0} className="ds-td__label">Settlement price</span></Tooltip></div>
    <h3>Scrollable container and boundaries</h3><p className="ds-td__caption">Hover or focus the control, then scroll its container or resize the canvas. The tooltip uses a body portal and follows the trigger without being clipped by the scrolling surface.</p>
    <div className="ds-td__scroll"><div><Tooltip title="Latest closing price" subtitle="Demonstration text for boundary handling." type="left"><Button variant="secondary" size={36}>Near the edge</Button></Tooltip><p>Scrollable example content</p></div></div>
    <h3>Longer text</h3><div className="ds-td__stage"><Tooltip title="A deliberately long title demonstrates the verified single-line truncation" subtitle="This demonstration subtitle contains more contextual information. It wraps within the source width and remains visible while either the trigger or tooltip is hovered. It does not expire on a timer."><Button variant="secondary" size={36}>Read more context</Button></Tooltip></div>
    <h3>Independent instances</h3><div className="ds-td__stage ds-td__stage--row"><Tooltip title="First tooltip" subtitle="Focus this trigger while hovering the other."><Button size={36} variant="secondary">First trigger</Button></Tooltip><Tooltip title="Second tooltip" subtitle="Each instance has independent IDs and interaction state."><Button size={36} variant="secondary">Second trigger</Button></Tooltip></div>
  </div>;
}
