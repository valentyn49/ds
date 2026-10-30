import type { CSSProperties } from 'react';

/** UTC milliseconds, value. Null values leave gaps. Data must be ordered by time. */
export type ChartPoint = readonly [time: number, value: number | null];
export type OhlcPoint = readonly [time: number, open: number, high: number, low: number, close: number];
export type ChartStudy = 'stochastic' | 'energy' | 'movingAverage' | 'priceChannel' | 'technicalLines';
export interface StudySeries {
  /** Stable and unique across updates. */
  id: string;
  name: string;
  /** Figma's Price Channel control is bound to the primary OHLC price, not a separate blue series. */
  study: Exclude<ChartStudy, 'priceChannel'>;
  data: readonly ChartPoint[];
}
export interface ChartTooltipPoint { name: string; value: number | null; open?: number; high?: number; low?: number; close?: number }
export interface ChartTooltipContext { time: number; points: readonly ChartTooltipPoint[] }
interface CommonProps {
  title: string;
  description: string;
  subtitle?: string;
  size?: 'auto' | 'desktop' | 'tablet' | 'mobile';
  /** Optional product domain; omitted domains adapt to the supplied data. */
  valueRange?: readonly [number, number];
  formatValue?: (value: number) => string;
  /** Plain text only. Figma does not specify financial data-tooltip content. */
  formatTooltip?: (context: ChartTooltipContext) => string;
  marketHref?: string;
  /** Advanced fullscreen workflow is provided by the consuming application. */
  onFullscreenRequest?: (mode: 'standard' | 'advanced', element: HTMLElement) => void;
  className?: string;
  style?: CSSProperties;
}
export type HighchartsProps = CommonProps & (
  | { variant?: 'default'; data: readonly OhlcPoint[]; studies?: readonly StudySeries[] }
  | { variant: 'price sparkline' | 'homepage'; data: readonly ChartPoint[]; studies?: never }
);
