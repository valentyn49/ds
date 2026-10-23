import { useState } from 'react';
import { Highcharts } from './Highcharts';
import { MOCK_ALTERNATE, MOCK_AREA, MOCK_OHLC, MOCK_STUDIES, mockTooltip } from './mock-data';
import '../../docs/button-docs.css';
import '../../docs/highcharts-docs.css';

const description = 'Mock weekly financial prices and illustrative precomputed studies. All values are synthetic.';
const layouts = ['desktop', 'tablet', 'mobile'] as const;
const widths = { default: [1087, 604, 343], 'price sparkline': [1087, 604, 343], homepage: [1055, 597, 340] } as const;

export function ChartVariants() {
  const [size, setSize] = useState<(typeof layouts)[number]>('desktop');
  return <div className="ds-chart-docs"><label className="ds-chart-docs__field">Figma layout<select value={size} onChange={e => setSize(e.target.value as typeof size)}>{layouts.map(v => <option key={v}>{v}</option>)}</select></label>
    {(['default', 'price sparkline', 'homepage'] as const).map(variant => <section className="ds-chart-docs__variant" key={variant}>
      <header><code>type={variant}</code><span>Source: {widths[variant][layouts.indexOf(size)]} px wide · {size}</span></header>
      <div style={{ width: widths[variant][layouts.indexOf(size)], maxWidth: '100%' }}>
        <Highcharts title="S&P 500 Materials Sector" description={description} size="auto" formatTooltip={mockTooltip}
          {...(variant === 'default' ? { variant, data: MOCK_OHLC, studies: MOCK_STUDIES } : { variant, data: MOCK_AREA })} />
      </div>
    </section>)}
    <p className="ds-chart-docs__caption">All nine Figma type × size combinations are represented. Preview widths shrink to fit the documentation canvas; Auto chooses the corresponding layout from actual container width.</p>
  </div>;
}

export function ChartAnatomy() {
  return <div className="ds-chart-docs">
    <div className="ds-bd-anatomy__stage"><div className="ds-bd-anatomy__figure ds-chart-docs__anatomy">
      <Highcharts title="S&P 500 Materials Sector" description={description} data={MOCK_OHLC} studies={MOCK_STUDIES} formatTooltip={mockTooltip} size="auto" />
      <span className="ds-bd-marker ds-chart-docs__marker" style={{ left: '2%', top: '2%' }}><b>1</b></span>
      <span className="ds-bd-marker ds-chart-docs__marker" style={{ left: '44%', top: '46%' }}><b>2</b></span>
      <span className="ds-bd-marker ds-chart-docs__marker" style={{ left: '98%', top: '33%' }}><b>3</b></span>
      <span className="ds-bd-marker ds-chart-docs__marker" style={{ left: '20%', top: '62%' }}><b>4</b></span>
      <span className="ds-bd-marker ds-chart-docs__marker" style={{ left: '65%', top: '73%' }}><b>5</b></span>
      <span className="ds-bd-marker ds-chart-docs__marker" style={{ left: '28%', top: '84%' }}><b>6</b></span>
    </div></div>
    <ol className="ds-chart-docs__legend"><li><strong>Container and heading.</strong> Dark surface, 16 px corners, title and weekly USD subtitle.</li><li><strong>Plot.</strong> White OHLC bars, study lines and green Energy Model columns share the plot.</li><li><strong>Y-axis and horizontal grid.</strong> Labels sit inside the right plot edge.</li><li><strong>X-axis.</strong> Uppercase day/month labels and 9 px ticks.</li><li><strong>Navigator.</strong> Time overview and scrollbar control the displayed range.</li><li><strong>Studies.</strong> Label buttons show/hide studies; adjacent icons include/exclude their tooltip values.</li></ol>
    <p className="ds-chart-docs__caption">Annotations overlay the actual component. Hover a study tooltip icon to inspect the verified Show/Hide hint. Data-tooltip values are a clearly identified mock integration.</p>
  </div>;
}

export function ChartExamples() {
  const [alternate, setAlternate] = useState(false);
  const [narrow, setNarrow] = useState(false);
  return <div className="ds-chart-docs">
    <h3>Dynamic data updates</h3><p>Replace the array while retaining series IDs. This updates the existing chart instance.</p>
    <button type="button" className="ds-chart-docs__control" onClick={() => setAlternate(v => !v)}>Update mock dataset</button>
    <Highcharts variant="price sparkline" title="S&P 500 Materials Sector" description={description} data={alternate ? MOCK_ALTERNATE : MOCK_AREA} formatTooltip={mockTooltip} />
    <h3>Responsive container</h3><p>Resize the parent independently of the Storybook window. This second instance has independent data and controls.</p>
    <button type="button" className="ds-chart-docs__control" onClick={() => setNarrow(v => !v)}>{narrow ? 'Expand container' : 'Narrow container'}</button>
    <div style={{ width: narrow ? 340 : 597, maxWidth: '100%' }}><Highcharts variant="homepage" title="Mock weekly prices" description={description} data={MOCK_AREA} formatTooltip={mockTooltip} /></div>
    <h3>Default study interactions</h3><p>Change OHLC paint, range, navigator selection, study visibility, and tooltip inclusion. Standard Fullscreen uses the browser fullscreen API; Advanced Fullscreen requires the product callback.</p>
    <Highcharts title="S&P 500 Materials Sector" description={description} data={MOCK_OHLC} studies={MOCK_STUDIES} formatTooltip={mockTooltip} />
  </div>;
}
