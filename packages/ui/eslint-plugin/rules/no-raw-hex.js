/**
 * hues/no-raw-hex: raw hex colors outside @hues/tokens fail.
 * Colors arrive through token variables (or token imports), never as
 * literals in component, app, or script code.
 */
const HEX_PATTERN = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw hex colors outside the token package',
    },
    messages: {
      rawHex: 'Raw hex color {{value}} outside tokens. Use a token variable (var(--color-*)) or a @hues/tokens import.',
    },
    schema: [],
  },
  create(context) {
    const checkText = (node, text) => {
      const match = HEX_PATTERN.exec(text);
      if (match) {
        context.report({ node, messageId: 'rawHex', data: { value: match[0] } });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string') checkText(node, node.value);
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) checkText(node, quasi.value.cooked ?? '');
      },
    };
  },
};
