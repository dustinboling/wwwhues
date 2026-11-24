import noAnonymousFontWeight from './rules/no-anonymous-font-weight.js';
import noClickHandlerNav from './rules/no-click-handler-nav.js';
import noRawHex from './rules/no-raw-hex.js';
import noRawPx from './rules/no-raw-px.js';

/**
 * eslint-plugin-hues: anti-drift rules shipped with @hues/ui and enabled in
 * every app plus the packages themselves (flat config).
 *
 * CSS files are covered by scripts/drift-check.mjs (same four rules as file
 * checks); this plugin covers JS/TS/TSX through the AST.
 */
const plugin = {
  rules: {
    'no-raw-hex': noRawHex,
    'no-raw-px': noRawPx,
    'no-anonymous-font-weight': noAnonymousFontWeight,
    'no-click-handler-nav': noClickHandlerNav,
  },
};

plugin.configs = {
  recommended: {
    plugins: { hues: plugin },
    rules: {
      'hues/no-raw-hex': 'error',
      'hues/no-raw-px': 'error',
      'hues/no-anonymous-font-weight': 'error',
      'hues/no-click-handler-nav': 'error',
    },
  },
};

export default plugin;
