import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StockChart } from '@highcharts/react/Stock.js';
import type { HighchartsReactRefObject } from '@highcharts/react/Stock.js';
import 'highcharts/es-modules/masters/modules/accessibility.src.js';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { CHART_HEIGHTS, createChartOptions, dateLabel, STUDIES } from './options';
import type { ChartLayout } from './options';
import type { ChartStudy, HighchartsProps } from './types';
import '../../components/highcharts/highcharts.css';

const assets = import.meta.glob('../../components/highcharts/assets/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const glyph = (name: string) => assets[`../../components/highcharts/assets/${name}.svg`];
const inputDate = (value: number) => Number.isFinite(value) ? new Date(value).toISOString().slice(0, 10) : '';
const toggleSet = <T,>(current: ReadonlySet<T>, value: T) => { const next = new Set(current); if (!next.delete(value)) next.add(value); return next; };

function DateField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="ds-chart__date"><span>{Number.isFinite(value) ? dateLabel(value) : '—'}</span><img src={glyph('calendar')} alt="" />
    <input type="date" aria-label={label} value={inputDate(value)} min={inputDate(min)} max={inputDate(max)} onChange={e => { const next = e.target.valueAsNumber; if (Number.isFinite(next)) onChange(next); }} />
  </label>;
}

/** Figma Chart: three configurations, each with desktop/tablet/mobile layouts. Data is never generated here. */
export function Highcharts(props: HighchartsProps) {
  const variant = props.variant ?? 'default';
  const root = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HighchartsReactRefObject>(null);
  const lifetime = useRef(0);
  const [autoLayout, setAutoLayout] = useState<ChartLayout>('desktop');
  const layout = !props.size || props.size === 'auto' ? autoLayout : props.size;
  const [redGreen, setRedGreen] = useState(false);
  const [hidden, setHidden] = useState<ReadonlySet<ChartStudy>>(new Set());
  const [tooltipHidden, setTooltipHidden] = useState<ReadonlySet<ChartStudy>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const [range, setRange] = useState<readonly [number, number]>([NaN, NaN]);
  const [zoom, setZoom] = useState('All');
  const start = props.data[0]?.[0] ?? NaN;
  const end = props.data.at(-1)?.[0] ?? NaN;
  const onRange = useCallback((min: number, max: number, trigger?: string) => {
    setRange(old => old[0] === min && old[1] === max ? old : [min, max]);
    if (trigger === 'navigator' || trigger === 'scrollbar') setZoom('');
  }, []);
  useEffect(() => {
    if (!fullscreen) return;
    const engine = root.current?.querySelector<HTMLElement>('.ds-chart__engine');
    if (!engine) return;
    const resize = () => {
      const chart = chartRef.current?.chart;
      const height = Math.round(engine.getBoundingClientRect().height);
      if (chart && height > 0 && chart.chartHeight !== height) chart.setSize(undefined, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(engine);
    return () => observer.disconnect();
  }, [fullscreen]);
  const options = useMemo(() => createChartOptions(props, { layout, hidden, tooltipHidden, redGreen, reducedMotion, fullscreen, onRange }),
    [props.data, props.studies, props.title, props.description, props.variant, props.valueRange, props.formatValue, props.formatTooltip, layout, hidden, tooltipHidden, redGreen, reducedMotion, fullscreen, onRange]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const update = () => { const width = element.getBoundingClientRect().width; if (width) setAutoLayout(width <= 576 ? 'mobile' : width <= 992 ? 'tablet' : 'desktop'); };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion(); motion.addEventListener('change', updateMotion);
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === element);
    document.addEventListener('fullscreenchange', updateFullscreen);
    const generation = ++lifetime.current;
    const chart = chartRef.current?.chart;
    return () => {
      observer.disconnect(); motion.removeEventListener('change', updateMotion);
      document.removeEventListener('fullscreenchange', updateFullscreen);
      // Official wrapper 5.1 updates in place but does not destroy on unmount.
      // Deferral distinguishes real unmount from React StrictMode's effect replay.
      queueMicrotask(() => { if (lifetime.current === generation && chart?.container) chart.destroy(); });
    };
  }, []);
  useEffect(() => { setZoom('All'); setRange([start, end]); chartRef.current?.chart.xAxis[0]?.setExtremes(undefined, undefined); }, [start, end, variant]);
  const setExtremes = (min: number, max: number) => {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return;
    setZoom(''); chartRef.current?.chart.xAxis[0]?.setExtremes(Math.max(start, min), Math.min(end, max), true, false, { trigger: 'design-system-range' });
  };
  const selectZoom = (label: string) => {
    const date = new Date(end);
    if (label === '3M' || label === '6M') date.setUTCMonth(date.getUTCMonth() - Number(label[0]));
    else if (label === '1y' || label === '3y') date.setUTCFullYear(date.getUTCFullYear() - Number(label[0]));
    const all = label === 'All' || label === 'Reset';
    if (all) chartRef.current?.chart.xAxis[0]?.setExtremes(undefined, undefined, true, false, { trigger: 'design-system-range' });
    else setExtremes(date.getTime(), end);
    setZoom(all ? 'All' : label);
  };
  const requestFullscreen = async (mode: 'standard' | 'advanced') => {
    const element = root.current;
    if (!element) return;
    if (props.onFullscreenRequest) return props.onFullscreenRequest(mode, element);
    if (mode === 'advanced') return;
    try { if (document.fullscreenElement === element) await document.exitFullscreen(); else await element.requestFullscreen(); setFullscreenError(''); }
    catch { setFullscreenError('Fullscreen is unavailable in this preview.'); }
  };
  const presentStudies = (Object.keys(STUDIES) as ChartStudy[]).filter(kind => kind === 'priceChannel' ? variant === 'default' : props.studies?.some(s => s.study === kind));
  const currentMin = Number.isFinite(range[0]) ? range[0] : start;
  const currentMax = Number.isFinite(range[1]) ? range[1] : end;
  return <div ref={root} className={`ds-chart ds-chart--${variant === 'price sparkline' ? 'sparkline' : variant} ${props.className ?? ''}`} data-layout={layout} style={props.style}>
    {variant !== 'homepage' && <header className="ds-chart__header">
      <div className="ds-chart__heading"><div><h3>{props.title}</h3><p>{props.subtitle ?? 'Expressed in USD, Weekly'}</p></div>
        {variant === 'default' && <div className="ds-chart__mode"><span>OHLC bars</span><img src={glyph('ohlc-monochrome')} alt="" /><button type="button" role="switch" aria-label="Red–green OHLC bars" aria-checked={redGreen} onClick={() => setRedGreen(v => !v)}><Icon color="currentColor" name={redGreen ? 'icon/toggle_on' : 'icon/toggle_off'} /></button><img src={glyph('ohlc-red-green')} alt="" /></div>}
        {props.marketHref && <a className="ds-chart__market" href={props.marketHref}>Go to Market Page</a>}
      </div>
      <div className="ds-chart__range"><div className="ds-chart__zoom"><span>ZOOM</span>{['3M', '6M', '1y', '3y', 'All', 'Reset'].map(label => <button type="button" key={label} disabled={!props.data.length} aria-pressed={label === 'Reset' ? undefined : zoom === label} onClick={() => selectZoom(label)}>{label}</button>)}</div>
        <div className="ds-chart__dates"><DateField label="Range start date" value={currentMin} min={start} max={currentMax} onChange={v => setExtremes(v, currentMax)} /><img src={glyph('range-arrow')} alt="" /><DateField label="Range end date" value={currentMax} min={currentMin} max={end} onChange={v => setExtremes(currentMin, v)} /></div>
      </div>
    </header>}
    <div className="ds-chart__engine" style={{ height: fullscreen ? '100%' : CHART_HEIGHTS[variant][layout] }}><StockChart ref={chartRef} options={options} containerProps={{ className: 'ds-chart__canvas' }} /></div>
    {variant === 'default' && <footer className="ds-chart__footer">
      {presentStudies.length > 0 && <div className="ds-chart__studies">{presentStudies.map(kind => <div className="ds-chart__study" key={kind}>
        <button type="button" className="ds-chart__study-label" aria-pressed={!hidden.has(kind)} onClick={() => setHidden(v => toggleSet(v, kind))}><img src={glyph(STUDIES[kind].asset)} alt="" />{STUDIES[kind].label}</button>
        <button type="button" className="ds-chart__tooltip-toggle" disabled={!props.formatTooltip} aria-label={`${tooltipHidden.has(kind) ? 'Show' : 'Hide'} tooltip chart: ${STUDIES[kind].label}`} aria-pressed={!tooltipHidden.has(kind)} onClick={() => setTooltipHidden(v => toggleSet(v, kind))}><Icon name={tooltipHidden.has(kind) ? 'icon/chart_tooltip_off' : 'icon/chart_tooltip'} color="currentColor" /><span role="tooltip" className="ds-chart__hint">{tooltipHidden.has(kind) ? 'Show' : 'Hide'} tooltip chart</span></button>
      </div>)}</div>}
      <div className="ds-chart__fullscreen"><Button variant="secondary" size={36} onClick={() => requestFullscreen('standard')}>Standard Fullscreen</Button><Button variant="secondary" size={36} disabled={!props.onFullscreenRequest} onClick={() => requestFullscreen('advanced')}>Advanced Fullscreen</Button></div>
      <p className="ds-chart__note">Note: some numbers may not fit into mouse over display when all or multiple studies are turned on. Click on any study to turn on/off.</p>
    </footer>}
    <a className="ds-chart__credits" href="https://www.highcharts.com/" target="_blank" rel="noreferrer">Highcharts.com</a>
    <span className="ds-chart__sr" role="status">{fullscreenError}</span>
  </div>;
}
