import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent } from 'react';
import '../../components/dropdown/dropdown.css';
import { DROPDOWN_DEFAULTS, SAMPLE_OPTIONS } from '../../components/dropdown/dropdown.spec.js';
import { INPUT_ICON_PATHS } from '../../components/text-input/icons.js';
import { TextInput } from '../TextInput/TextInput';
import { cx } from '../utils/cx';

/** The values of the Figma `state` property of the trigger (`dropdown-input`). They are set with props, see the docs. */
export const DROPDOWN_STATE_LIST = ['default', 'hover', 'selected', 'disabled', 'error'] as const;
export type DropdownState = (typeof DROPDOWN_STATE_LIST)[number];
export { DROPDOWN_DEFAULTS, SAMPLE_OPTIONS };

/** One option. A string is both the value and the label. */
export type DropdownOption =
  | string
  | {
      label: string;
      /** Defaults to the label. */
      value?: string;
      /** Figma `Pro` on this item: `true` shows the default text, a string shows that text. */
      pro?: boolean | string;
      /** Figma `checkbox` on this item. */
      checkbox?: boolean;
      /** Figma `Right icons` on this item (a check mark, shown when the item is selected). */
      rightIcon?: boolean;
      /** Figma `Color` on this item: any CSS color, e.g. `var(--ds-color-alert-500)`. */
      color?: string;
    };

interface NormalizedOption {
  value: string;
  label: string;
  pro?: boolean | string;
  checkbox?: boolean;
  rightIcon?: boolean;
  color?: string;
}

export function normalizeOptions(options: DropdownOption[]): NormalizedOption[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : { ...o, value: o.value ?? o.label }));
}

// "icon / check_box" from the Figma icon library (24 x 24 artboard). The HTML component keeps it private; the parity
// story compares the two renderings, so a difference would show up there.
const CHECK_BOX = 'M3.50003 20.5V3.5H20.5V20.5H3.50003ZM5.00001 19H19V4.99998H5.00001V19Z';

function Svg({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

export interface DropdownItemsProps {
  options: DropdownOption[];
  /** Index of the selected option (`aria-selected`). */
  selectedIndex?: number;
  /** Index of the highlighted option (the Figma `hover` type of `dropdown item`). */
  activeIndex?: number;
  /** Prefix of the option ids: `{idPrefix}-option-{index}`. */
  idPrefix?: string;
  /** Figma `Pro`, `checkbox`, `Right icons` and `Color`, applied to every item that does not set its own. */
  showPro?: boolean;
  showCheckbox?: boolean;
  showRightIcon?: boolean;
  showColor?: boolean;
  proText?: string;
  /** Hides items (used by the search field). */
  isHidden?: (index: number) => boolean;
  onSelect?: (index: number) => void;
  onActivate?: (index: number) => void;
}

/** The rows of the menu (Figma `dropdown item`). Same markup as `dropdownItemsHTML()`. */
export function DropdownItems({
  options,
  selectedIndex = -1,
  activeIndex = -1,
  idPrefix,
  showPro,
  showCheckbox,
  showRightIcon,
  showColor,
  proText = DROPDOWN_DEFAULTS.proText,
  isHidden,
  onSelect,
  onActivate,
}: DropdownItemsProps) {
  const generated = useId();
  const base = idPrefix ?? generated;
  return (
    <>
      {normalizeOptions(options).map((opt, i) => {
        const selected = i === selectedIndex;
        const pro = opt.pro ?? showPro;
        const checkbox = opt.checkbox ?? showCheckbox;
        const rightIcon = (opt.rightIcon ?? showRightIcon) && selected;
        const color = opt.color ?? (showColor ? 'var(--ds-color-alert-500)' : null);
        return (
          <div
            key={i}
            className={cx('ds-dropdown__item', i === activeIndex && 'is-active')}
            role="option"
            id={`${base}-option-${i}`}
            aria-selected={selected}
            data-index={i}
            hidden={isHidden?.(i) || undefined}
            onClick={onSelect ? () => onSelect(i) : undefined}
            onMouseMove={onActivate ? () => i !== activeIndex && onActivate(i) : undefined}
          >
            {checkbox ? (
              <span className="ds-dropdown__item-icon">
                <Svg path={CHECK_BOX} />
              </span>
            ) : null}
            {color ? <span className="ds-dropdown__swatch" style={{ background: color }} /> : null}
            <span className="ds-dropdown__item-label">{opt.label}</span>
            {rightIcon ? (
              <span className="ds-dropdown__item-icon">
                <Svg path={INPUT_ICON_PATHS.check} />
              </span>
            ) : null}
            {pro ? <span className="ds-dropdown__pro">{typeof pro === 'string' ? pro : proText}</span> : null}
          </div>
        );
      })}
    </>
  );
}

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange' | 'id'> {
  /** Base for the generated ids (`{id}-trigger`, `{id}-menu`, ...). Generated when omitted. */
  id?: string;
  /** Written to `data-name` on the trigger, as in the HTML component. */
  name?: string;
  /** The choices. Strings, or objects with `label`, `value` and the optional item parts. Default: sample data. */
  options?: DropdownOption[];
  /** The chosen value (controlled). */
  value?: string;
  /** The chosen value when uncontrolled. */
  defaultValue?: string;
  /** Called when an option is chosen. */
  onValueChange?: (value: string, option: { value: string; label: string }) => void;
  /** Menu open (controlled). */
  open?: boolean;
  /** Menu open at the start (uncontrolled). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Figma state `disabled`. The trigger cannot be focused or opened. */
  disabled?: boolean;
  /** Figma state `error`. */
  validation?: 'error';
  /** Figma `title`. */
  showLabel?: boolean;
  /** Figma `title text`. */
  label?: string;
  /** Figma `info`: the info icon after the title. */
  info?: boolean;
  /** Figma `placeholder text`. */
  placeholder?: string;
  /** Figma `footnote`. */
  showFootnote?: boolean;
  /** Figma `footnote text`. */
  footnote?: string;
  /** Figma `Pro`, `checkbox`, `Right icons`, `Color` on `dropdown item`, applied to every item. */
  showPro?: boolean;
  showCheckbox?: boolean;
  showRightIcon?: boolean;
  showColor?: boolean;
  proText?: string;
  /** Figma `Search` on the menu. Typing narrows the list. */
  showSearch?: boolean;
  /** Extra attributes for the trigger button (`aria-*`, `data-*`, `onFocus`, ...). */
  triggerProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled' | 'id' | 'role' | 'onClick' | 'onKeyDown' | 'children'>;
}

/**
 * Socrates dropdown: a select-style combobox with a listbox (WAI-ARIA authoring practices). Same markup and classes as
 * the HTML `dropdownHTML()` builder, styled by the same `dropdown.css`.
 *
 * Click or Arrow Down / Arrow Up / Enter / Space on the trigger opens the menu. In the open menu Arrow Down / Arrow Up
 * move, Home / End jump, Enter / Space choose, Escape closes and returns focus to the trigger, Tab closes. A click
 * outside closes. Focus stays on the trigger (or on the search field) and the highlighted option is exposed with
 * `aria-activedescendant`. A bubbling `ds-dropdown-change` event with `detail: { value, label }` is also fired, like in
 * the HTML component.
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  {
    id,
    name,
    options = SAMPLE_OPTIONS,
    value,
    defaultValue,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    validation,
    showLabel = true,
    label = DROPDOWN_DEFAULTS.label,
    info = false,
    placeholder = DROPDOWN_DEFAULTS.placeholder,
    showFootnote = true,
    footnote = DROPDOWN_DEFAULTS.footnote,
    showPro = false,
    showCheckbox = false,
    showRightIcon = false,
    showColor = false,
    proText,
    showSearch = false,
    triggerProps,
    className,
    ...rest
  },
  ref,
) {
  const generated = useId();
  const base = id ?? generated;
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const error = validation === 'error';

  const isValueControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue);
  const currentValue = isValueControlled ? value : innerValue;
  const selectedIndex = opts.findIndex((o) => o.value === currentValue);

  const isOpenControlled = openProp !== undefined;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = (isOpenControlled ? openProp : innerOpen) && !disabled;

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(() => (isOpen ? (selectedIndex >= 0 ? selectedIndex : opts.length ? 0 : -1) : -1));

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const matches = (i: number, q: string) => !q || opts[i].label.toLowerCase().includes(q.toLowerCase());
  const visible = (q = query) => opts.map((_, i) => i).filter((i) => matches(i, q));

  const setOpen = (next: boolean) => {
    if (!isOpenControlled) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const openMenu = () => {
    if (isOpen || disabled) return;
    setOpen(true);
  };
  const closeMenu = (returnFocus = true) => {
    if (!isOpen) return;
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  const closeRef = useRef(closeMenu);
  closeRef.current = closeMenu;

  // Opening: start from a clean search and highlight the chosen option (or the first); the search field gets focus.
  // Closing: forget the search text. Skipped for the first render, so a menu that starts open does not steal focus.
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen === wasOpen.current) return;
    wasOpen.current = isOpen;
    setQuery('');
    if (searchRef.current) searchRef.current.value = '';
    if (isOpen) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : opts.length ? 0 : -1);
      searchRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // A mouse press outside the dropdown closes the menu without moving focus.
  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeRef.current(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [isOpen]);

  const select = (index: number) => {
    const opt = opts[index];
    if (!opt || disabled || !isOpen || !matches(index, query)) return;
    if (!isValueControlled) setInnerValue(opt.value);
    onValueChange?.(opt.value, { value: opt.value, label: opt.label });
    rootRef.current?.dispatchEvent(new CustomEvent('ds-dropdown-change', { bubbles: true, detail: { value: opt.value, label: opt.label } }));
    closeMenu();
  };

  // Options may be replaced while the menu is open. Never expose or select a stale option index.
  const visibleIndices = visible();
  const currentActive = visibleIndices.includes(activeIndex) ? activeIndex : (visibleIndices[0] ?? -1);

  const move = (delta: number) => {
    const items = visible();
    if (!items.length) return;
    const at = items.indexOf(currentActive);
    setActiveIndex(items[Math.min(items.length - 1, Math.max(0, at + delta))]);
  };

  const onListKey = (event: KeyboardEvent, isSearch: boolean) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        if (!isSearch) {
          event.preventDefault();
          setActiveIndex(visible()[0] ?? -1);
        }
        break;
      case 'End':
        if (!isSearch) {
          event.preventDefault();
          setActiveIndex(visible().at(-1) ?? -1);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (currentActive >= 0) select(currentActive);
        break;
      case ' ':
        if (!isSearch) {
          event.preventDefault();
          if (currentActive >= 0) select(currentActive);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu(false);
        break;
      default:
        break;
    }
  };

  const shown = selectedIndex >= 0 ? opts[selectedIndex].label : placeholder;
  const activeId = isOpen && currentActive >= 0 ? `${base}-option-${currentActive}` : undefined;

  return (
    <div
      {...rest}
      ref={setRootRef}
      onBlur={(event) => {
        rest.onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget)) closeMenu(false);
      }}
      className={cx('ds-dropdown', disabled && 'ds-dropdown--disabled', error && 'ds-dropdown--error', isOpen && 'ds-dropdown--open', className)}
    >
      {showLabel ? (
        <div className="ds-dropdown__label">
          <span className="ds-dropdown__label-text" id={`${base}-label`}>
            {label}
          </span>
          {info ? (
            <span className="ds-dropdown__info">
              <Svg path={INPUT_ICON_PATHS.info} />
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="ds-dropdown__control">
        <button
          {...triggerProps}
          ref={triggerRef}
          className="ds-dropdown__trigger"
          id={`${base}-trigger`}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${base}-listbox`}
          aria-labelledby={`${showLabel ? `${base}-label ` : ''}${base}-value`}
          aria-describedby={showFootnote ? `${base}-caption` : undefined}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          data-name={name}
          aria-activedescendant={showSearch ? undefined : activeId}
          onClick={() => (isOpen ? closeMenu() : openMenu())}
          onKeyDown={(event) => {
            if (!isOpen) {
              if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                openMenu();
              }
              return;
            }
            onListKey(event, false);
          }}
        >
          <span className={cx('ds-dropdown__value', selectedIndex < 0 && 'ds-dropdown__value--placeholder')} id={`${base}-value`}>
            {shown}
          </span>
          <span className="ds-dropdown__chevron">
            <Svg path={INPUT_ICON_PATHS.chevron} />
          </span>
        </button>
        <div className="ds-dropdown__menu" id={`${base}-menu`} hidden={!isOpen}>
          {showSearch ? (
            <div className="ds-dropdown__search">
              <TextInput
                ref={searchRef}
                id={`${base}-search`}
                label={DROPDOWN_DEFAULTS.searchPlaceholder}
                showLabel={false}
                leftIcon="search"
                placeholder={DROPDOWN_DEFAULTS.searchPlaceholder}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={`${base}-listbox`}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                onKeyDown={(event) => onListKey(event, true)}
                onChange={(event) => {
                  const next = event.target.value;
                  setQuery(next);
                  setActiveIndex(visible(next)[0] ?? -1);
                }}
              />
            </div>
          ) : null}
          <div
            className="ds-dropdown__list"
            role="listbox"
            id={`${base}-listbox`}
            aria-labelledby={showLabel ? `${base}-label` : `${base}-trigger`}
            onMouseDown={(event) => event.preventDefault()}
          >
            <DropdownItems
              options={options}
              selectedIndex={selectedIndex}
              activeIndex={isOpen ? currentActive : activeIndex}
              idPrefix={base}
              showPro={showPro}
              showCheckbox={showCheckbox}
              showRightIcon={showRightIcon}
              showColor={showColor}
              proText={proText}
              isHidden={(i) => !matches(i, query)}
              onSelect={select}
              onActivate={setActiveIndex}
            />
          </div>
        </div>
      </div>
      {showFootnote ? (
        <div className="ds-dropdown__caption" id={`${base}-caption`}>
          {footnote}
        </div>
      ) : null}
    </div>
  );
});
