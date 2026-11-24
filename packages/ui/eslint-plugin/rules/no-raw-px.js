/**
 * hues/no-raw-px: raw pixel values outside @hues/tokens fail.
 * Dimensions arrive through token variables. Flags pure px strings,
 * CSS declarations carrying px, and numeric px-implying values in style
 * objects (unitless properties excepted). Media-query bounds are checked
 * by the CSS drift pass, not here.
 */
const PURE_PX = /^-?\d+(\.\d+)?px$/;
const CSS_PX_DECLARATION = /:\s*[^;{}]*?\b-?\d+(\.\d+)?px\b/;
// React unitless style properties (subset that can legally hold numbers).
const UNITLESS = new Set([
  'opacity',
  'zIndex',
  'flex',
  'flexGrow',
  'flexShrink',
  'order',
  'fontWeight',
  'lineHeight',
  'scale',
  'tabSize',
]);

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw pixel values outside the token package',
    },
    messages: {
      rawPx: 'Raw pixel value outside tokens. Use a token variable (var(--space-*, --text-*, ...)).',
      numericStyle: 'Numeric style value implies pixels outside tokens. Use a token variable.',
    },
    schema: [],
  },
  create(context) {
    const checkText = (node, text) => {
      if (PURE_PX.test(text) || CSS_PX_DECLARATION.test(text)) {
        context.report({ node, messageId: 'rawPx' });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string') checkText(node, node.value);
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) checkText(node, quasi.value.cooked ?? '');
      },
      'JSXAttribute[name.name="style"] ObjectExpression > Property'(node) {
        const key = node.key;
        const name =
          key.type === 'Identifier' ? key.name : key.type === 'Literal' ? String(key.value) : null;
        if (name === null || UNITLESS.has(name)) return;
        if (node.value.type === 'Literal' && typeof node.value.value === 'number') {
          context.report({ node: node.value, messageId: 'numericStyle' });
        }
      },
    };
  },
};
