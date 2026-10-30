export const TOOLTIP_TYPES = ['bottom', 'right', 'top', 'left'] as const;
export type TooltipType = (typeof TOOLTIP_TYPES)[number];
export const TOOLTIP_WIDTHS: Record<TooltipType, number> = { bottom: 220, top: 220, right: 228, left: 228 };
export interface TooltipRect { left: number; top: number; right: number; bottom: number; width: number; height: number }
export interface TooltipViewport { left: number; top: number; width: number; height: number }
const opposite: Record<TooltipType, TooltipType> = { bottom: 'top', top: 'bottom', right: 'left', left: 'right' };
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, Math.max(low, high)));
export function tooltipMaxHeight(trigger: TooltipRect, viewport: TooltipViewport) {
  const leftRoom = trigger.left - viewport.left - 16;
  const rightRoom = viewport.left + viewport.width - trigger.right - 16;
  if (leftRoom >= 228 || rightRoom >= 235) return viewport.height - 16;
  // If neither side can hold a horizontal tooltip, reserve enough room above/below for the arrow and gap.
  return Math.min(viewport.height - 23, Math.max(trigger.top - viewport.top, viewport.top + viewport.height - trigger.bottom) - 23);
}
/** Types name the Figma POINTER edge, not the side of the trigger occupied by the tooltip. */
export function positionTooltip(trigger: TooltipRect, panel: { width: number; height: number }, viewport: TooltipViewport, preferred: TooltipType) {
  const inset = 8; // Collision clearance and trigger gap are adopted behavior, not Figma measurements.
  const gap = 8;
  const candidates = [preferred, opposite[preferred], ...TOOLTIP_TYPES.filter(type => type !== preferred && type !== opposite[preferred])];
  const bounds = { left: viewport.left + inset, top: viewport.top + inset, right: viewport.left + viewport.width - inset, bottom: viewport.top + viewport.height - inset };
  const place = (type: TooltipType) => {
    // The top and left source arrows extend seven pixels beyond their component frame.
    const extraLeft = type === 'left' ? 7 : 0;
    const extraTop = type === 'top' ? 7 : 0;
    const x = type === 'right' ? trigger.left - gap - panel.width : type === 'left' ? trigger.right + gap + 7 : trigger.left + (trigger.width - panel.width) / 2;
    const y = type === 'bottom' ? trigger.top - gap - panel.height : type === 'top' ? trigger.bottom + gap + 7 : trigger.top + (trigger.height - panel.height) / 2;
    const overflow = Math.max(0, bounds.left - (x - extraLeft)) + Math.max(0, x + panel.width - bounds.right) + Math.max(0, bounds.top - (y - extraTop)) + Math.max(0, y + panel.height - bounds.bottom);
    return { type, x, y, extraLeft, extraTop, overflow };
  };
  const positions = candidates.map(place);
  // Prefer a side that does not overlap the trigger after collision handling.
  const horizontal = (type: TooltipType) => type === 'top' || type === 'bottom';
  const axisOverflow = (p: ReturnType<typeof place>) => horizontal(p.type)
    ? Math.max(0, bounds.top - (p.y - p.extraTop)) + Math.max(0, p.y + panel.height - bounds.bottom)
    : Math.max(0, bounds.left - (p.x - p.extraLeft)) + Math.max(0, p.x + panel.width - bounds.right);
  const selected = positions.find(p => axisOverflow(p) === 0) ?? positions.reduce((best, p) => p.overflow < best.overflow ? p : best);
  const x = clamp(selected.x, bounds.left + selected.extraLeft, bounds.right - panel.width);
  const y = clamp(selected.y, bounds.top + selected.extraTop, bounds.bottom - panel.height);
  const halfArrow = selected.type === 'left' ? 8 : 8.5;
  const axisLength = horizontal(selected.type) ? panel.width : panel.height;
  const center = horizontal(selected.type) ? trigger.left + trigger.width / 2 - x : trigger.top + trigger.height / 2 - y;
  const arrow = clamp(center, halfArrow + 4, axisLength - halfArrow - 4);
  return { x, y, type: selected.type, arrow };
}
