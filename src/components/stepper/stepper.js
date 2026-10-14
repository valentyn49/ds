import './stepper.css';
import { iconSVG } from '../icons/icon-paths.js';
import { STEPPER_STATES, STEPPER_DEFAULTS } from './stepper.spec.js';

export { STEPPER_STATES, STEPPER_DEFAULTS };

const escapeHTML = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = (state) => state.replace(/\s+/g, '-');

/**
 * One step of a multi-step progress indicator. Props mirror the Figma component properties:
 *   state -> `state` (filled, active, next step, disabled)    number -> `number`    title -> `title`
 *   showDescription -> `short description`                      subtitle -> `subtitle`
 * Figma defines no click, hover or focus behavior, so the step is presentational. For assistive technology the
 * active step is marked with `aria-current="step"`, a disabled step with `aria-disabled`, and a filled step
 * (which shows a check mark instead of the number) with visually hidden text "Completed".
 */
export function stepperHTML({
  state = 'active',
  number = STEPPER_DEFAULTS.number,
  title = STEPPER_DEFAULTS.title,
  showDescription = true,
  subtitle = STEPPER_DEFAULTS.subtitle,
} = {}) {
  const current = STEPPER_STATES.includes(state) ? state : 'active';
  const attrs = [
    `class="ds-stepper ds-stepper--${slug(current)}"`,
    current === 'active' ? 'aria-current="step"' : '',
    current === 'disabled' ? 'aria-disabled="true"' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const indicator =
    current === 'filled'
      ? `<span class="ds-stepper__check">${iconSVG('check')}</span>`
      : `<span class="ds-stepper__number">${escapeHTML(number)}</span>`;
  const completed = current === 'filled' ? '<span class="ds-stepper__sr">Completed: </span>' : '';
  const description = showDescription ? `<span class="ds-stepper__description">${escapeHTML(subtitle)}</span>` : '';

  return `<div ${attrs}><span class="ds-stepper__marker"><span class="ds-stepper__circle">${indicator}</span></span><span class="ds-stepper__content"><span class="ds-stepper__title">${completed}${escapeHTML(title)}</span>${description}</span><span class="ds-stepper__connector-wrap" aria-hidden="true"><span class="ds-stepper__connector"></span></span></div>`;
}

export function createStepper(props = {}) {
  const template = document.createElement('template');
  template.innerHTML = stepperHTML(props);
  return template.content.firstElementChild;
}
