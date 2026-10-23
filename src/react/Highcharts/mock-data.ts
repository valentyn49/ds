/** Deterministic, synthetic financial fixtures for documentation only. Not market data or indicator calculations. */
import type { ChartPoint, ChartTooltipContext, OhlcPoint, StudySeries } from './types';
const week = 7 * 86400000;
export const MOCK_OHLC: readonly OhlcPoint[] = Array.from({ length: 157 }, (_, i) => {
  const open = 72 + i * 0.44 + Math.sin(i * 0.61) * 8;
  const close = open + Math.cos(i * 0.83) * 4;
  return [Date.UTC(2022, 9, 31) + i * week, open, Math.max(open, close) + 3.5, Math.min(open, close) - 3, close];
});
export const MOCK_AREA: readonly ChartPoint[] = MOCK_OHLC.map(p => [p[0], p[4]]);
export const MOCK_ALTERNATE: readonly ChartPoint[] = MOCK_AREA.map(([time, value], i) => [time, value! * 0.84 + Math.sin(i * 0.24) * 14]);
const line = (fn: (i: number) => number): ChartPoint[] => MOCK_AREA.map(([time], i) => [time, fn(i)]);
export const MOCK_STUDIES: readonly StudySeries[] = [
  { id: 'stochastic-cyan', name: 'Stochastic 1', study: 'stochastic', data: line(i => 60 + Math.sin(i * 0.12) * 18 + i * 0.2) },
  { id: 'stochastic-yellow', name: 'Stochastic 2', study: 'stochastic', data: line(i => 50 + Math.sin(i * 0.12 + 1) * 10 + i * 0.2) },
  { id: 'stochastic-red', name: 'Stochastic 3', study: 'stochastic', data: line(i => 40 + Math.sin(i * 0.11 + 2) * 8 + i * 0.2) },
  { id: 'energy', name: 'Energy Model', study: 'energy', data: line(i => 8 + Math.abs(Math.sin(i * 0.8)) * (14 + i * 0.25)) },
  { id: 'average', name: 'Moving Average', study: 'movingAverage', data: line(i => 76 + i * 0.44 + Math.sin(i * 0.13) * 4) },
  { id: 'technical-orange', name: 'Technical Lines 1', study: 'technicalLines', data: line(i => 45 + i * 0.65) },
  { id: 'technical-green', name: 'Technical Lines 2', study: 'technicalLines', data: line(i => 32 + i * 0.65) },
];
export function mockTooltip({ time, points }: ChartTooltipContext) {
  return [new Date(time).toISOString().slice(0, 10), ...points.map(p => p.open === undefined
    ? `${p.name}: ${p.value?.toFixed(2) ?? '—'}`
    : `${p.name}: O ${p.open.toFixed(2)} · H ${p.high?.toFixed(2)} · L ${p.low?.toFixed(2)} · C ${p.close?.toFixed(2)}`)].join('\n');
}
