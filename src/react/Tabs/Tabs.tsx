import { Fragment, forwardRef, useId, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import '../../components/tabs/tabs.css';
import { tabsHTML } from '../../components/tabs/tabs.js';
import { TABS_TYPES, SMALL_TAB_MODES, TYPE_SLUG, TABS_DEFAULTS, PRO_LABEL } from '../../components/tabs/tabs.spec.js';
import { cx } from '../utils/cx';

export { TABS_TYPES, SMALL_TAB_MODES };

/** The three Figma tab bars. They are separate components in Figma, not variants of one. */
export type TabsType = 'tab' | 'General tab' | 'Small tab';
/** `Small tab` only: the bar comes in a light and a dark mode. */
export type TabsMode = 'light' | 'dark';

/** Native `data-*` attributes for the root element. */
type DataAttributes = { [key: `data-${string}`]: string | undefined };

export interface TabsItem {
  /** The tab text. */
  label: ReactNode;
  /** `General tab` and `Small tab` have a disabled state; `tab` does not, so it ignores this. */
  disabled?: boolean;
  /** Figma `right icon` on `tab`, `icon` on `General tab` and `Small tab`. */
  icon?: boolean;
  /** Figma `pro` (the "Upgrade" badge). `General tab` only. */
  pro?: boolean;
  /** Figma `divider`: a divider before this tab. */
  dividerBefore?: boolean;
  /** `General tab` only: the link target (default `#`, which does not navigate). */
  href?: string;
  /** `tab` and `Small tab`: the content shown when this tab is selected. */
  panel?: ReactNode;
  /** Documentation only: forces a look without interaction. */
  previewState?: 'hover' | 'pressed' | 'focus';
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children' | 'defaultValue' | 'onChange'>, DataAttributes {
  /** Which Figma bar to draw. */
  type?: TabsType;
  /** `Small tab` only. */
  mode?: TabsMode;
  /** The tabs, in order. */
  items: TabsItem[];
  /** Index of the selected tab; `null` selects none (used by the state previews). Makes the bar controlled. */
  value?: number | null;
  /** Index of the tab that starts selected when the bar is not controlled (default 0). */
  defaultValue?: number | null;
  /** Called when a tab is selected by click or keyboard. */
  onValueChange?: (index: number, item: TabsItem) => void;
  /** The accessible name of the tab bar (`tablist` or `nav`). */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

// The tab icons are drawn by the HTML builder (their path data is private to it). The markup is read from it once
// per type, so the geometry is not copied here.
const buildHtml = tabsHTML as (props: Record<string, unknown>) => string;
const iconCache = new Map<string, string>();
function iconSvg(type: TabsType): string {
  let svg = iconCache.get(type);
  if (svg === undefined) {
    const html = buildHtml({ type, items: [{ label: 'x', icon: true }], selected: 0 });
    svg = /<span class="ds-tabs__icon" aria-hidden="true">(<svg[\s\S]*?<\/svg>)<\/span>/.exec(html)?.[1] ?? '';
    iconCache.set(type, svg);
  }
  return svg;
}

// The `tab` icon sits after the label, the other two before it.
const ICON_AFTER: Record<TabsType, boolean> = { tab: true, 'General tab': false, 'Small tab': false };

/**
 * Test Design System tab bars. Same markup and classes as the HTML `tabsHTML()` builder, styled by the same `tabs.css`.
 *
 * `tab` and `Small tab` are real tabs (`tablist` / `tab` / `tabpanel`, roving tabindex, Arrow keys, Home and End,
 * selection follows focus). `General tab` is navigation: a `nav` with links, the current one marked `aria-current="page"`.
 *
 * Selection is controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`.
 */
export const Tabs = forwardRef<HTMLElement, TabsProps>(function Tabs(
  { type = TABS_DEFAULTS.type as TabsType, mode = 'light', items, value, defaultValue = 0, onValueChange, ariaLabel = TABS_DEFAULTS.ariaLabel, className, style, ...rest },
  ref,
) {
  const t: TabsType = (TABS_TYPES as string[]).includes(type) ? type : 'tab';
  const isNav = t === 'General tab';
  const uid = `ds-tabs-${useId()}`;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const list = items.map((item) => ({ ...item, disabled: Boolean(item.disabled) && t !== 'tab' }));
  const controlled = value !== undefined;
  const [inner, setInner] = useState<number | null>(defaultValue);
  const selected = controlled ? value : inner;

  let current = selected === null ? -1 : Math.min(Math.max(Number(selected) || 0, 0), list.length - 1);
  if (current >= 0 && list[current]?.disabled) current = list.findIndex((item) => !item.disabled);
  const tabStop = current >= 0 ? current : list.findIndex((item) => !item.disabled);

  const hasPanels = !isNav && list.some((item) => item.panel !== undefined);
  const modeClass = t === 'Small tab' ? ` ds-tabs--${(SMALL_TAB_MODES as string[]).includes(mode) ? mode : 'light'}` : '';
  const rootClass = cx(`ds-tabs ds-tabs--${TYPE_SLUG[t]}${modeClass}`, className);

  const select = (index: number) => {
    if (!controlled) setInner(index);
    onValueChange?.(index, items[index]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = list.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    const focused = tabRefs.current.findIndex((el) => el !== null && el === document.activeElement);
    const at = enabled.indexOf(focused);
    if (at < 0) return;
    let next: number;
    if (event.key === 'ArrowRight') next = enabled[(at + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') next = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    else return;
    event.preventDefault();
    if (next !== focused || next !== current) {
      select(next);
      tabRefs.current[next]?.focus();
    }
  };

  const icon = (
    <span className="ds-tabs__icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(t) }} />
  );

  const main = (item: TabsItem) => {
    const label = <span className="ds-tabs__label">{item.label}</span>;
    return (
      <span className="ds-tabs__main">
        {ICON_AFTER[t] ? (
          <>
            {label}
            {item.icon ? icon : null}
          </>
        ) : (
          <>
            {item.icon ? icon : null}
            {label}
          </>
        )}
      </span>
    );
  };

  const renderItem = (item: (typeof list)[number], i: number) => {
    const on = i === current;
    if (isNav) {
      const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (item.disabled) {
          event.preventDefault();
          return;
        }
        if ((item.href || '#') === '#') event.preventDefault();
        select(i);
      };
      return (
        <Fragment key={i}>
          {item.dividerBefore ? <span className="ds-tabs__divider" aria-hidden="true" /> : null}
          <a
            className="ds-tabs__item"
            href={item.href || '#'}
            aria-current={on ? 'page' : undefined}
            aria-disabled={item.disabled ? 'true' : undefined}
            tabIndex={item.disabled ? -1 : undefined}
            data-preview-state={item.previewState}
            onClick={onClick}
          >
            {main(item)}
            {item.pro ? <span className="ds-tabs__pro">{PRO_LABEL}</span> : null}
          </a>
        </Fragment>
      );
    }
    return (
      <Fragment key={i}>
        {item.dividerBefore ? <span className="ds-tabs__divider" aria-hidden="true" /> : null}
        <button
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          type="button"
          role="tab"
          className="ds-tabs__item"
          id={`${uid}-tab-${i}`}
          aria-selected={on}
          aria-controls={hasPanels ? `${uid}-panel-${i}` : undefined}
          tabIndex={i === tabStop ? 0 : -1}
          disabled={item.disabled}
          data-preview-state={item.previewState}
          onClick={() => {
            if (i !== current) select(i);
          }}
        >
          {main(item)}
        </button>
      </Fragment>
    );
  };

  const bar = (
    <div className="ds-tabs__scroll">
      <div
        className="ds-tabs__list"
        role={isNav ? undefined : 'tablist'}
        aria-label={isNav ? undefined : ariaLabel}
        onKeyDown={isNav ? undefined : onKeyDown}
      >
        {list.map(renderItem)}
      </div>
    </div>
  );

  if (isNav) {
    return (
      <nav ref={ref as React.Ref<HTMLElement>} className={rootClass} style={style} aria-label={ariaLabel} {...rest}>
        {bar}
      </nav>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={rootClass} style={style} {...rest}>
      {bar}
      {hasPanels
        ? list.map((item, i) => (
            <div
              key={i}
              className="ds-tabs__panel"
              role="tabpanel"
              id={`${uid}-panel-${i}`}
              aria-labelledby={`${uid}-tab-${i}`}
              tabIndex={0}
              hidden={i !== current}
            >
              {item.panel}
            </div>
          ))
        : null}
    </div>
  );
});
