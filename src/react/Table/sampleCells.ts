import type { TableCellData } from './Table';

// One sample cell per Figma variant, with the texts of the Figma component. Used by the stories and the parity check.
// These values are sample content, not Figma specifications.
const NAME = 'Australia BMK 10 Yr YLD (AUD)';

export const SAMPLES: Record<string, TableCellData> = {
  'market name': { type: 'market name', name: NAME, flag: '🇦🇺', country: 'Australia' },
  text: { type: 'text', text: 'SCHZ' },
  'text|1 element': { type: 'text', text: '4.05', textType: '1 element', badge: '1', suffix: '(1%)' },
  'text|2 element': { type: 'text', text: '4.05', textType: '2 element', badge: '1', suffix: '(1%)' },
  text_new: { type: 'text_new', label: 'New', text: 'Text' },
  text_label: { type: 'text_label', textType: '1 element', count: '1', label: 'New', text: 'Alert' },
  link: { type: 'link', text: 'Link' },
  toggle: { type: 'toggle', text: 'Status' },
  blank: { type: 'blank' },
  icon: { type: 'icon', icon: 'drag24' },
  'icon+text': { type: 'icon+text', icon: 'drag20', text: 'SCHZ' },
  metric: { type: 'metric', text: '3.99\n3/18/2024' },
  'metric+comment|1 element': { type: 'metric+comment', text: '103.49', counts: 1, count: '1', comment: 'Bearish' },
  'metric+comment|2 elements': { type: 'metric+comment', text: '103.49', counts: 2, count: '1', comment: 'Bearish' },
  button: { type: 'button', variant: 'purchase', text: 'Purchase Analysis' },
  'graph-green': { type: 'graph-green' },
  'graph-red': { type: 'graph-red' },
  bar: { type: 'bar', label: '15 May' },
};

/** The sample for a variant of the table-cell component set (`mode` does not change the content). */
export const sampleFor = (v: { type: string; metricType: string; textType: string }): TableCellData => {
  const extra = v.type === 'text' ? v.textType : v.type === 'metric+comment' ? v.metricType : null;
  return SAMPLES[extra && extra !== 'default' ? `${v.type}|${extra}` : v.type];
};
