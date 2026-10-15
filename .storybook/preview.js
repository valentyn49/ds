import theme from './theme.js';
import '../src/tokens/tokens.css';
import '../src/docs/docs.css';

/** @type {import('@storybook/html-vite').Preview} */
const preview = {
  parameters: {
    layout: 'fullscreen',
    docs: { theme },
    options: {
      storySort: {
        // Sidebar order mirrors the Figma page order. Do not edit by hand: run `npm run sidebar`.
        order:
      /* sidebar-order:start (generated from src/figma/structure.json by scripts/sync-sidebar-order.mjs) */
      [
        "Introduction",
        "Foundations",
        [
          "Colors",
          "Typography",
          "Spacing",
          "Shadows & Borders",
          "Icons"
        ],
        "Components",
        [
          "Accordion",
          [
            "collapse"
          ],
          "Badges",
          [
            "badge",
            "pro"
          ],
          "Buttons",
          [
            "Button",
            "cursor"
          ],
          "Breadcrumbs",
          [
            "Breadcrumb",
            "breadcrumbs-main"
          ],
          "Checkbox",
          [
            "checkbox"
          ],
          "Counter",
          [
            "counter"
          ],
          "Datepicker",
          [
            "datepicker-cell",
            "datepicker-overlay"
          ],
          "Dropdowns",
          [
            "dropdown-input",
            "dropdown item",
            "dropdown"
          ],
          "Email template",
          [
            "New Socrates Account"
          ],
          "Footer",
          [
            "footer"
          ],
          "Graphs",
          [
            "Grid",
            "OHLC chart",
            "Sparkline",
            "Line chart",
            "Bar chart"
          ],
          "Highchart",
          [
            "Chart"
          ],
          "Headers",
          [
            "Header",
            "Blur"
          ],
          "Inputs",
          [
            "input",
            "text-area",
            "input tag",
            "quantity adjuster"
          ],
          "Messages",
          [
            "notification"
          ],
          "Memberships",
          [
            "Membership"
          ],
          "Nav Tabs",
          [
            "Tabs",
            "tab-item",
            "menu item",
            "small menu item",
            "small menu item dark",
            "Small tab",
            "tab",
            "General tab"
          ],
          "News",
          [
            "news-item-card"
          ],
          "Popup",
          [
            "modal",
            "blur"
          ],
          "Pagination",
          [
            "table-breadcrumbs"
          ],
          "Radiobutton",
          [
            "radiobutton"
          ],
          "Stepper",
          [
            "stepper"
          ],
          "Table",
          [
            "table-cell",
            "Divider"
          ],
          "Toast",
          [
            "message"
          ],
          "Toggle",
          [
            "Toggle"
          ],
          "Tooltips",
          [
            "tooltip"
          ],
          "Links",
          [
            "link"
          ]
        ]
      ]
      /* sidebar-order:end */,
      },
    },
  },
};

export default preview;
