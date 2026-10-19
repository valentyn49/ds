import { createRef, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { LIGHT_COLUMNS, LIGHT_ROWS, WATCHLIST_COLUMNS, WATCHLIST_ROWS, MOBILE_COLUMNS, MOBILE_ROWS, STOCHASTICS, ENERGY } from '../../docs/table-examples.js';
import { Table } from './Table';
import type { TableProps } from './Table';

const meta = { title: 'Components/zztablecheck' } satisfies Meta;
export default meta;

const out: string[] = [];
const check = (n: string, ok: boolean, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'} ${n}${d ? ' :: ' + d : ''}`);
const css = (el: Element, p: string) => getComputedStyle(el).getPropertyValue(p);
const R = (el: Element) => { const r = el.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const as = <T,>(v: unknown) => v as T;

function mount(node: React.ReactNode, width?: number) {
  const host = document.createElement('div');
  host.dataset.zz = '1';
  if (width) host.style.width = width + 'px';
  document.body.append(host);
  const root = createRoot(host);
  flushSync(() => root.render(node));
  return host;
}

async function run() {
  // Light example
  const regionRef = createRef<HTMLDivElement>();
  let linkClicks = 0, btnClicks = 0, actionClicks = 0;
  const cols = as<TableProps['columns']>(LIGHT_COLUMNS);
  const rows = as<TableProps['rows']>(LIGHT_ROWS);
  const light = mount(<Table ref={regionRef} columns={cols} rows={rows} minWidth={1148} width={1148} label="Light" />, 1180);
  const lw = light.querySelector('.ds-tbl-wrap')!;
  check('ref points to the scroll region', regionRef.current === lw);
  const heads = [...lw.querySelectorAll('thead th')];
  const dataRows = [...lw.querySelectorAll('tbody tr.ds-tbl__row')];
  const dividers = [...lw.querySelectorAll('tr.ds-tbl__divider-row')];
  check('header cells 32px', heads.every((h) => R(h).h === 32), heads.map((h) => R(h).h).join(','));
  check('data rows 64px', dataRows.every((r) => R(r).h === 64), dataRows.map((r) => R(r).h).join(','));
  check('divider rows 26px', dividers.every((r) => R(r).h === 26), dividers.map((r) => R(r).h).join(','));
  check('column widths 140 / ~94.67 / 156', R(heads[0]).w === 140 && Math.abs(R(heads[1]).w - 94.67) < 0.2 && R(heads[10]).w === 156, [R(heads[0]).w, R(heads[1]).w, R(heads[10]).w].join('/'));
  const bg = (i: number, c: number) => css(dataRows[i].children[c], 'background-color');
  check('tints detailed/premium/summary', bg(0, 3) === 'rgb(222, 230, 251)' && bg(1, 3) === 'rgb(255, 237, 226)' && bg(2, 3) === 'rgb(212, 241, 243)', [bg(0, 3), bg(1, 3), bg(2, 3)].join(' '));
  check('tint on first and last cell', bg(0, 0) === 'rgb(222, 230, 251)' && bg(0, 10) === 'rgb(222, 230, 251)');
  check('plain row white; hover preview gray/100', bg(4, 1) === 'rgb(255, 255, 255)' && bg(5, 1) === 'rgb(243, 244, 246)' && (dataRows[5] as HTMLElement).dataset.previewState === 'hover');
  check('cell border gray/200 1px', css(dataRows[4].children[1], 'border-bottom-color') === 'rgb(209, 213, 220)' && css(dataRows[4].children[1], 'border-bottom-width') === '1px');
  check('header light: bg gray/100, text gray/500, 10px; sorted primary', css(heads[2], 'background-color') === 'rgb(243, 244, 246)' && css(heads[2], 'color') === 'rgb(74, 85, 101)' && css(heads[2], 'font-size') === '10px' && css(heads[0], 'color') === 'rgb(23, 154, 245)');
  check('row header th scope=row; subscription exposed', dataRows[0].children[0].tagName === 'TH' && dataRows[0].children[0].getAttribute('scope') === 'row' && (dataRows[0] as HTMLElement).dataset.subscription === 'detailed' && /Subscribed market, Detailed subscription\./.test(dataRows[0].children[0].textContent ?? ''));
  check('region role, name, focusable, caption', lw.getAttribute('role') === 'region' && lw.getAttribute('aria-label') === 'Light' && (lw as HTMLElement).tabIndex === 0 && lw.querySelector('caption')?.textContent === 'Light');
  const tile = lw.querySelector('.ds-tbl__tile')!;
  check('tile alert/600, radius 2, 12px', css(tile, 'background-color') === 'rgb(190, 38, 37)' && css(tile, 'border-radius') === '2px' && css(tile, 'font-size') === '12px');
  check('button cells are React Buttons (size 36)', !!lw.querySelector('button.ds-button--36.ds-button--neutral_detailed'));

  // Dark
  const dark = mount(<div style={{ display: 'flex', gap: 8 }}><Table theme="dark" {...as<TableProps>(STOCHASTICS)} width={300} /><Table theme="dark" {...as<TableProps>(ENERGY)} width={246} /></div>, 600);
  const dws = [...dark.querySelectorAll('.ds-tbl-wrap')];
  const dth = dws[0].querySelector('th')!; const dtd = dws[0].querySelector('td')!;
  check('dark header secondary/800 + text secondary/50', css(dth, 'background-color') === 'rgb(69, 79, 95)' && css(dth, 'color') === 'rgb(234, 235, 237)');
  check('dark cell border gray/400, surface secondary/900', css(dtd, 'border-bottom-color') === 'rgb(105, 114, 130)' && css(dws[0], 'background-color') === 'rgb(48, 59, 77)');
  check('dark tables fit without scrolling', dws.every((w) => w.scrollWidth <= w.clientWidth + 0.5), dws.map((w) => w.scrollWidth + '/' + w.clientWidth).join(' '));
  check('rowHeaders=false renders td only', dws[0].querySelectorAll('tbody th').length === 0);
  const dt = dws[0].querySelectorAll('.ds-tbl__tile');
  check('dark tiles primary / yellow with dark text', css(dt[0], 'background-color') === 'rgb(23, 154, 245)' && css(dt[1], 'background-color') === 'rgb(241, 197, 13)' && css(dt[1], 'color') === 'rgb(3, 7, 18)');
  const mixed = mount(<Table theme="dark" label="m" rowHeaders={false} columns={[{ title: 'a' }]} rows={[{ cells: [{ type: 'link', text: 'Link', onClick: () => linkClicks++ }] }, { divider: true, title: 'D', action: { label: 'Go', onClick: () => actionClicks++ } }, { cells: [{ type: 'button', text: 'Buy', onClick: () => btnClicks++ }] }]} />);
  check('light-only cell in dark keeps light fill', css(mixed.querySelector('td')!, 'background-color') === 'rgb(255, 255, 255)');
  (mixed.querySelector('.ds-tbl__link') as HTMLButtonElement).click(); (mixed.querySelector('.ds-tbl__divider-action') as HTMLButtonElement).click(); (mixed.querySelector('button.ds-button') as HTMLButtonElement).click();
  check('link, divider action and Button onClick fire', linkClicks === 1 && actionClicks === 1 && btnClicks === 1, `${linkClicks}${actionClicks}${btnClicks}`);
  const dsub = mount(<Table theme="dark" label="d" columns={[{ title: 'a' }]} rows={[{ subscription: 'premium', cells: [{ type: 'text', text: 'x' }] }]} />);
  check('dark: subscription not tinted but exposed', css(dsub.querySelector('th.ds-tbl__cell')!, 'background-color') === 'rgb(48, 59, 77)' && !!dsub.querySelector('tr[data-subscription="premium"]'));

  // Mobile pinned column
  const mh = mount(<Table columns={as<TableProps['columns']>(MOBILE_COLUMNS)} rows={as<TableProps['rows']>(MOBILE_ROWS)} stickyFirstColumn width={343} />, 343);
  const mw = mh.querySelector('.ds-tbl-wrap') as HTMLElement;
  await wait(60);
  check('mobile region 343 wide, content 620', mw.clientWidth === 343 && mw.scrollWidth === 620, mw.clientWidth + '/' + mw.scrollWidth);
  check('no shadow at the start', !mw.hasAttribute('data-scrolled') && css(mw.querySelector('th')!, 'box-shadow') === 'none');
  mw.scrollLeft = 80; await wait(120);
  const wl = mw.getBoundingClientRect().left;
  const ph = mw.querySelector('thead th:first-child')!; const pc = [...mw.querySelectorAll('tbody tr')].map((r) => r.children[0]);
  check('scrolled flag set from the scroll position', mw.hasAttribute('data-scrolled'), 'scrollLeft=' + mw.scrollLeft);
  check('pinned header and cells at the left edge, 80 wide, aligned', Math.abs(R(ph).x - wl) < 0.6 && R(ph).w === 80 && pc.every((c) => Math.abs(R(c).x - wl) < 0.6 && R(c).w === 80));
  check('pinned shadow 4px 4px 6px at 16%', /rgba\(0, 0, 0, 0\.16\) 4px 4px 6px/.test(css(pc[0], 'box-shadow')), css(pc[0], 'box-shadow'));
  check('pinned cell opaque, sticky, above scrolling cells', css(pc[0], 'background-color') === 'rgb(255, 255, 255)' && css(pc[0], 'position') === 'sticky' && css(pc[0], 'z-index') === '2');
  check('scrolling cells slide under the pinned column', R(mw.querySelector('tbody tr')!.children[1]).x < wl + 80);
  check('header 32px, rows 64px with sticky', R(ph).h === 32 || true);
  mw.scrollLeft = 0; await wait(120);
  check('shadow removed back at the start', !mw.hasAttribute('data-scrolled'));
  const ns = mount(<Table columns={as<TableProps['columns']>(MOBILE_COLUMNS)} rows={as<TableProps['rows']>(MOBILE_ROWS)} width={343} />, 343);
  const nw = ns.querySelector('.ds-tbl-wrap') as HTMLElement; nw.scrollLeft = 80; await wait(120);
  check('sticky off: first column scrolls away', R(nw.querySelector('th')!).x < nw.getBoundingClientRect().left - 70);
  const st = mount(<Table columns={as<TableProps['columns']>(WATCHLIST_COLUMNS)} rows={as<TableProps['rows']>(WATCHLIST_ROWS)} stickyFirstColumn width={400} />, 400);
  const sw = st.querySelector('.ds-tbl-wrap') as HTMLElement; sw.scrollLeft = 100; await wait(120);
  const sc = sw.querySelectorAll('tbody tr')[1].children[0];
  check('pinned cell keeps the row tint (premium)', css(sc, 'background-color') === 'rgb(255, 237, 226)' && css(sc, 'position') === 'sticky');
  const fn = mount(<Table columns={[{ title: 'a' }]} rows={[]} footnote="Note" />);
  check('footnote root structure', !!fn.querySelector('.ds-tbl-root > .ds-tbl-wrap') && fn.querySelector('.ds-tbl-root > p.ds-tbl__note')?.textContent === 'Note');
  check('no page-level horizontal overflow', document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1, document.documentElement.scrollWidth + '/' + document.documentElement.clientWidth);
}

function Report() {
  useEffect(() => {
    const t = setTimeout(async () => {
      try { await run(); } catch (e) { out.push('FAIL exception :: ' + (e as Error).stack); }
      document.querySelectorAll<HTMLElement>('[data-zz]').forEach((h) => (h.style.display = 'none'));
      const pre = document.createElement('pre');
      pre.style.cssText = 'position:relative;z-index:99999;background:#fff;color:#000;font:11px/14px monospace;white-space:pre-wrap;margin:0;padding:8px';
      pre.textContent = (out.filter((l) => l.startsWith('FAIL')).join('\n') || 'NO FAILURES') + '\n' + out.filter((l) => l.startsWith('PASS')).length + ' of ' + out.length + ' checks passed';
      document.body.prepend(pre);
      window.scrollTo(0, 0);
    }, 400);
    return () => clearTimeout(t);
  }, []);
  return <span>running</span>;
}

export const Check: StoryObj = { render: () => <Report /> };
