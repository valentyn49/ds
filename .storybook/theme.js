import { create } from 'storybook/theming/create';
import tokens from '../src/tokens/tokens.json';

const c = (family, step) => tokens.colors[family].steps[step];

// Every value below comes from the Figma tokens. See src/tokens/tokens.json.
export default create({
  base: 'light',

  brandTitle: 'Test Design System',
  brandUrl: 'https://www.figma.com/design/spBZF1HWrU83CHRMF8q3mU/-AEGL-AUG--Design-Library',
  brandTarget: '_blank',

  colorPrimary: c('primary', '600'),
  colorSecondary: c('secondary', '900'),

  appBg: c('background', '900'),
  appContentBg: c('gray', '50'),
  appPreviewBg: c('gray', '50'),
  appBorderColor: c('gray', '200'),
  appBorderRadius: tokens.radius['4x'],

  textColor: c('gray', '900'),
  textInverseColor: c('gray', '50'),
  textMutedColor: c('gray', '500'),

  barBg: c('gray', '50'),
  barTextColor: c('secondary', '700'),
  barHoverColor: c('primary', '700'),
  barSelectedColor: c('primary', '700'),

  buttonBg: c('gray', '50'),
  buttonBorder: c('gray', '200'),
  booleanBg: c('gray', '100'),
  booleanSelectedBg: c('gray', '50'),

  inputBg: c('gray', '50'),
  inputBorder: c('gray', '200'),
  inputTextColor: c('gray', '900'),
  inputBorderRadius: tokens.radius['3x'],

  fontBase: tokens.fontFamily.stack,
  fontCode: tokens.fontFamily.mono,
});
