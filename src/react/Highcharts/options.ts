import type H from 'highcharts/es-modules/masters/highstock.src.js';
import type { ChartPoint, ChartStudy, HighchartsProps, OhlcPoint } from './types';

export const STUDIES = {
  stochastic: { label: 'Stochastic', asset: 'stochastic', colors: ['#38e5e7', '#f1c50d', '#be2625'] },
  energy: { label: 'Energy Model', asset: 'energy', colors: ['#008236'] },
  movingAverage: { label: 'Moving Average', asset: 'moving-average', colors: ['#d1d5dc'] },
  priceChannel: { label: 'Price Channel', asset: 'price-channel', colors: ['#179af5', '#179af5'] },
  technicalLines: { label: 'Technical Lines', asset: 'technical-lines', colors: ['#ca3500', '#ca3500'] },
} as const;
export type ChartLayout = 'desktop' | 'tablet' | 'mobile';
export const CHART_HEIGHTS = {
  default: { desktop: 266, tablet: 210, mobile: 246 },
  'price sparkline': { desktop: 362, tablet: 366, mobile: 338 },
  homepage: { desktop: 372, tablet: 372, mobile: 372 },
} as const;
export const dateLabel = (value: number) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
}).format(value).toUpperCase();
export function escapeTooltip(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
export function validateData(data: readonly (ChartPoint | OhlcPoint)[], ohlc: boolean) {
  let previous = -Infinity;
  for (const p of data) {
    if (!Number.isFinite(p[0]) || p[0] <= previous || p.length !== (ohlc ? 5 : 2)) throw new Error('Chart points must have the expected shape and unique, increasing UTC timestamps.');
    if (p.slice(1).some(v => v !== null && !Number.isFinite(v))) throw new Error('Chart values must be finite numbers or null.');
    if (ohlc && (p.some(v => v === null) || p[2]! < Math.max(p[1]!, p[4]!) || p[3]! > Math.min(p[1]!, p[4]!))) throw new Error('OHLC high/low must contain both open and close.');
    previous = p[0];
  }
}
interface Configuration {
  layout: ChartLayout;
  redGreen: boolean;
  hidden: ReadonlySet<ChartStudy>;
  tooltipHidden: ReadonlySet<ChartStudy>;
  reducedMotion: boolean;
  fullscreen: boolean;
  onRange: (min: number, max: number, trigger?: string) => void;
}
export function createChartOptions(props: HighchartsProps, config: Configuration): H.Options {
  const variant = props.variant ?? 'default';
  const dark = variant !== 'homepage';
  const ohlc = variant === 'default';
  validateData(props.data, ohlc);
  if (props.valueRange && (!props.valueRange.every(Number.isFinite) || props.valueRange[0] >= props.valueRange[1])) throw new Error('valueRange must be an increasing finite domain.');
  const ink = dark ? '#ffffff' : '#697282';
  const grid = dark ? '#697282' : '#d1d5dc';
  const areaColor = dark ? '#008236' : '#28acff';
  const series: H.SeriesOptionsType[] = [ohlc ? {
    id: 'price', type: 'ohlc', name: props.title, data: props.data.map(p => [...p]) as number[][],
    color: config.redGreen ? '#be2625' : '#ffffff', upColor: config.redGreen ? '#008236' : '#ffffff', lineWidth: 1,
    visible: !config.hidden.has('priceChannel'), custom: { study: 'priceChannel' },
  } : {
    id: 'price', type: 'area', name: props.title, data: props.data.map(p => [...p]) as [number, number | null][],
    color: areaColor, lineWidth: 2, threshold: null,
    fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, dark ? 'rgba(0,130,54,0.2)' : 'rgba(40,172,255,0.2)'], [1, dark ? 'rgba(1,160,69,0)' : 'rgba(40,172,255,0)']] },
  }];
  const studies = props.studies ?? [];
  const ids = new Set(['price']);
  const counts = new Map<ChartStudy, number>();
  for (const study of studies) {
    if (ids.has(study.id) || !study.id) throw new Error('Study IDs must be nonempty, unique, and different from price.');
    ids.add(study.id);
    validateData(study.data, false);
    const spec = STUDIES[study.study];
    const index = counts.get(study.study) ?? 0;
    if (index >= spec.colors.length) throw new Error(`Figma defines at most ${spec.colors.length} series for ${spec.label}.`);
    counts.set(study.study, index + 1);
    const common = { id: study.id, name: study.name, data: study.data.map(p => [...p]) as [number, number | null][], color: spec.colors[index], visible: !config.hidden.has(study.study), custom: { study: study.study } };
    series.push(study.study === 'energy' ? { ...common, type: 'column', borderWidth: 0, pointPadding: 0.05, groupPadding: 0.1 } : { ...common, type: 'line', lineWidth: study.study === 'technicalLines' ? 1 : 0.9036970138549805 });
  }
  return {
    chart: { backgroundColor: 'transparent', height: config.fullscreen ? undefined : CHART_HEIGHTS[variant][config.layout],
      spacing: [0, 0, 0, 0], marginLeft: 0, marginRight: 0, marginTop: 16, marginBottom: dark ? 29 : 45,
      style: { fontFamily: 'Proxima Nova, Segoe UI, sans-serif' }, animation: false, panning: { enabled: false }, zooming: { type: undefined, mouseWheel: { enabled: false } } },
    time: { timezone: 'UTC' },
    title: { text: undefined }, subtitle: { text: undefined }, credits: { enabled: false }, legend: { enabled: false },
    accessibility: { enabled: true, description: props.description, screenReaderSection: { beforeChartFormat: '<h5>{chartTitle}</h5><div>{chartLongdesc}</div><div>{typeDescription}</div>' }, keyboardNavigation: { enabled: true }, landmarkVerbosity: 'one' },
    lang: { accessibility: { chartContainerLabel: props.title } },
    rangeSelector: { enabled: false },
    navigator: { enabled: dark, height: 40, margin: config.layout === 'mobile' ? 16 : 24,
      maskFill: 'rgba(255,255,255,0)', outlineColor: grid, outlineWidth: 1,
      handles: { backgroundColor: '#697282', borderColor: '#4a5565' },
      series: { type: 'line', color: 'transparent', lineWidth: 0, fillOpacity: 0, data: props.data.map(p => [p[0], ohlc ? p[4] : p[1]]) as [number, number | null][] },
      xAxis: { labels: { style: { color: ink, fontSize: '12px', fontWeight: '600' } }, gridLineWidth: 1, gridLineColor: grid },
      yAxis: { gridLineColor: grid, gridLineWidth: 1 } },
    scrollbar: { enabled: dark, height: 11, margin: 4, buttonsEnabled: false, barBackgroundColor: '#4a5565', barBorderColor: grid, trackBackgroundColor: grid, trackBorderColor: grid, rifleColor: grid },
    xAxis: { type: 'datetime', ordinal: false, lineColor: grid, tickColor: grid, tickLength: 9, gridLineWidth: 0, crosshair: false, minPadding: 0, maxPadding: 0,
      labels: { style: { color: ink, fontSize: '12px', fontWeight: '600' }, y: 23, formatter() { return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(Number(this.value)).toUpperCase(); } },
      events: { afterSetExtremes(e) { config.onRange(e.min, e.max, e.trigger); } } },
    yAxis: { title: { text: undefined }, opposite: true, min: props.valueRange?.[0], max: props.valueRange?.[1], startOnTick: true, endOnTick: true,
      gridLineWidth: 1, gridLineColor: grid, tickAmount: 5, lineWidth: 0, showLastLabel: true,
      labels: { align: 'right', x: -2, y: -5, reserveSpace: false, style: { color: ink, fontSize: '12px', fontWeight: '600' }, formatter() { return this.value === 0 ? '' : (props.formatValue ?? String)(Number(this.value)); } } },
    plotOptions: { series: { animation: config.reducedMotion ? false : { duration: 150 }, dataGrouping: { enabled: false }, enableMouseTracking: true, states: { inactive: { opacity: 1 }, hover: { lineWidthPlus: 0, halo: { size: 0 } } }, marker: { enabled: false, states: { hover: { enabled: false } } } } },
    tooltip: { enabled: Boolean(props.formatTooltip), shared: true, split: false, outside: false,
      backgroundColor: '#ffffff', borderWidth: 0, borderRadius: 4, padding: 12,
      shadow: { color: 'rgba(0,0,0,0.25)', offsetX: 0, offsetY: 15, width: 50 },
      style: { color: '#030712', fontSize: '12px', fontWeight: '400' },
      formatter() {
        const points = (this.points ?? [this]).filter(p => !config.tooltipHidden.has(p.series.options.custom?.study));
        return escapeTooltip(props.formatTooltip?.({ time: this.x ?? 0, points: points.map(p => {
          const values = p as H.Point & { open?: number; high?: number; low?: number; close?: number };
          return { name: p.series.name, value: p.y ?? null, open: values.open, high: values.high, low: values.low, close: values.close };
        }) }) ?? '').replace(/\n/g, '<br/>');
      } },
    series,
  };
}
