import theme from '../.storybook/theme.js';
import '../src/tokens/fonts.css';
import '../src/tokens/tokens.css';
import '../src/docs/docs.css';
import '../src/docs/button-docs.css';
import '../.storybook/preview.css';

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  parameters: {
    layout: 'fullscreen',
    docs: { theme },
    options: { storySort: { order: ['Foundations', ['Icons'], 'Components'] } },
  },
};

export default preview;
