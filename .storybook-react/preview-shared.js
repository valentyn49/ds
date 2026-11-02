import theme from '../.storybook/theme.js';

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  parameters: {
    layout: 'fullscreen',
    docs: { theme },
    options: { storySort: { order: ['Foundations', ['Icons'], 'Components'] } },
  },
};

export default preview;
