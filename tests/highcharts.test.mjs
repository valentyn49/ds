import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import HC from 'highcharts/es-modules/masters/highstock.src.js';
import 'highcharts/es-modules/masters/modules/accessibility.src.js';
import { StockChart } from '@highcharts/react/Stock.js';

const bundle = await build({ stdin: { contents: `export * from './src/react/Highcharts/options'; export * from './src/react/Highcharts/mock-data';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', write: false });
const mod = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const { createChartOptions, MOCK_OHLC, MOCK_AREA, MOCK_STUDIES, mockTooltip, escapeTooltip, validateData } = mod.exports;
const config = (extra = {}) => ({ layout: 'desktop', hidden: new Set(), tooltipHidden: new Set(), redGreen: false, reducedMotion: true, fullscreen: false, onRange() {}, ...extra });
const props = { title: 'Weekly prices', description: 'Synthetic weekly prices.', data: MOCK_OHLC, studies: MOCK_STUDIES };

test('official Stock runtime, OHLC renderer, React wrapper, and accessibility module load together', () => {
  assert.equal(HC.version, '12.6.2');
  assert.equal(typeof HC.stockChart, 'function');
  assert.equal(HC.SeriesRegistry.seriesTypes.ohlc.prototype.type, 'ohlc');
  assert.equal(HC.getOptions().accessibility.enabled, true);
  assert.ok(StockChart);
});
test('all nine verified layouts produce supported series and independent options', () => {
  for (const variant of ['default', 'price sparkline', 'homepage']) for (const layout of ['desktop', 'tablet', 'mobile']) {
    const options = createChartOptions({ ...props, variant, data: variant === 'default' ? MOCK_OHLC : MOCK_AREA, studies: variant === 'default' ? MOCK_STUDIES : undefined }, config({ layout }));
    assert.equal(options.series[0].type, variant === 'default' ? 'ohlc' : 'area');
    assert.equal(options.navigator.enabled, variant !== 'homepage');
    assert.equal(options.scrollbar.enabled, variant !== 'homepage');
    assert.equal(options.accessibility.description, props.description);
    assert.equal(options.accessibility.keyboardNavigation.enabled, true);
    assert.equal(options.chart.animation, false);
    assert.equal(options.chart.panning.enabled, false);
    assert.equal(options.xAxis.crosshair, false);
    assert.equal(options.series[0].id, 'price');
    assert.ok(options.chart.height > 0);
  }
});
test('supplied data is copied and updates preserve stable IDs without calculating studies', () => {
  const before = JSON.stringify(props);
  const options = createChartOptions(props, config());
  options.series[0].data[0][1] = -100;
  assert.equal(JSON.stringify(props), before);
  const next = createChartOptions({ ...props, data: MOCK_OHLC.map(p => [p[0], ...p.slice(1).map(v => v + 1)]) }, config());
  assert.deepEqual(next.series.map(s => s.id), options.series.map(s => s.id));
  assert.equal(next.series[0].data[0][1], MOCK_OHLC[0][1] + 1);
  const none = createChartOptions({ ...props, studies: [] }, config());
  assert.equal(none.series.length, 1);
});
test('OHLC paint and study visibility are isolated across configurations', () => {
  const first = createChartOptions(props, config({ redGreen: true, hidden: new Set(['stochastic']) }));
  const second = createChartOptions(props, config());
  assert.equal(first.series[0].color, '#be2625');
  assert.equal(first.series[0].upColor, '#008236');
  assert.equal(second.series[0].color, '#ffffff');
  assert.equal(first.series.filter(s => s.custom?.study === 'stochastic').every(s => !s.visible), true);
  assert.equal(second.series.filter(s => s.custom?.study === 'stochastic').every(s => s.visible), true);
  assert.deepEqual(first.series.filter(s => s.custom?.study === 'stochastic').map(s => s.color), ['#38e5e7', '#f1c50d', '#be2625']);
  const priceOff = createChartOptions(props, config({ hidden: new Set(['priceChannel']) }));
  assert.equal(priceOff.series[0].visible, false);
  assert.equal(priceOff.series[0].custom.study, 'priceChannel');
  assert.equal(first.series.filter(s => s.custom?.study === 'technicalLines').every(s => s.color === '#ca3500'), true);
});
test('null area values preserve gaps, invalid OHLC/data order and duplicate IDs are rejected', () => {
  assert.doesNotThrow(() => validateData([[1, null], [2, 3]], false));
  for (const data of [[[1, 1], [1, 2]], [[2, 1], [1, 2]], [[1, Infinity]], [[NaN, 2]]]) assert.throws(() => validateData(data, false));
  assert.throws(() => validateData([[1, 10, 9, 8, 11]], true));
  assert.throws(() => createChartOptions({ ...props, studies: [MOCK_STUDIES[0], MOCK_STUDIES[0]] }, config()), /unique/);
  assert.throws(() => createChartOptions({ ...props, valueRange: [100, 0] }, config()), /domain/);
  assert.throws(() => createChartOptions({ ...props, studies: [0, 1].map(i => ({ ...MOCK_STUDIES[3], id: `energy-${i}` })) }, config()), /at most/);
});
test('financial tooltip is opt-in, escapes markup, and excludes only requested studies', () => {
  assert.equal(createChartOptions(props, config()).tooltip.enabled, false);
  const options = createChartOptions({ ...props, formatTooltip: ({ points }) => `<script>${points.map(p => p.name).join(',')}\nvalue` }, config({ tooltipHidden: new Set(['stochastic']) }));
  const point = (name, study) => ({ x: 1, y: 2, series: { name, options: { custom: { study } } } });
  const html = options.tooltip.formatter.call({ x: 1, points: [point('Price'), point('Stochastic', 'stochastic'), point('Energy', 'energy')] });
  assert.equal(html, '&lt;script&gt;Price,Energy<br/>value');
  assert.equal(escapeTooltip('"&\''), '&quot;&amp;&#39;');
  assert.match(mockTooltip({ time: 1, points: [{ name: 'Price', value: null }] }), /—/);
});
test('native range events report actual chart extremes and do not affect another instance', () => {
  const received = [];
  const options = createChartOptions(props, config({ onRange: (min, max) => received.push([min, max]) }));
  options.xAxis.events.afterSetExtremes({ min: 100, max: 200 });
  assert.deepEqual(received, [[100, 200]]);
  assert.equal(createChartOptions(props, config()).plotOptions.series.animation, false);
});
test('both built Storybooks index Highcharts in the existing Highchart sidebar group', () => {
  for (const folder of ['storybook-static', 'storybook-static-react']) {
    const index = JSON.parse(readFileSync(`${folder}/index.json`, 'utf8'));
    const entries = Object.values(index.entries).filter(e => e.title.startsWith('Components/Highchart/'));
    assert.ok(entries.some(e => e.type === 'docs'));
    for (const name of ['Playground', 'Variants', 'Anatomy', 'Examples']) assert.ok(entries.some(e => e.name === name), `${folder}: ${name}`);
  }
});
