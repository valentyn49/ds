import './manager-fonts.css';
import '../src/tokens/tokens.css';
import './manager.css';
import { addons } from 'storybook/manager-api';
import theme from './theme.js';

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
  },
  toolbar: {
    zoom: { hidden: true },
    eject: { hidden: true },
    copy: { hidden: true },
  },
});
