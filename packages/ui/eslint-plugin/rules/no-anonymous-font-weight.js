/**
 * hues/no-anonymous-font-weight: font weights arrive through tokens.
 * Flags fontWeight literals in style objects (only var() references and
 * token imports pass) and weight utilities in className strings, including
 * anonymous font-[...] instances and the Tailwind weight keywords (which
 * resolve outside the named token weights and include Light, banned in UI).
 */
const VAR_CALL = /^var\(--[^)]+\)$/;
const WEIGHT_UTILITY = /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[[^\]]*\])/;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow font weights that do not come from tokens',
    },
    messages: {
      anonymousWeight:
        'Anonymous font weight. Named weights (400/560/600/700) and role weights arrive through tokens: var(--weight-*, --text-*-weight).',
      weightUtility: 'Weight utility {{value}} resolves outside tokens. Use a token-driven class or style.',
    },
    schema: [],
  },
  create(context) {
    return {
      'JSXAttribute[name.name="style"] ObjectExpression > Property'(node) {
        const key = node.key;
        const name =
          key.type === 'Identifier' ? key.name : key.type === 'Literal' ? String(key.value) : null;
        if (name !== 'fontWeight') return;
        const value = node.value;
        if (value.type === 'Literal') {
          if (typeof value.value === 'string' && VAR_CALL.test(value.value)) return;
          context.report({ node: value, messageId: 'anonymousWeight' });
        }
      },
      'JSXAttribute[name.name="className"] Literal'(node) {
        if (typeof node.value !== 'string') return;
        const match = WEIGHT_UTILITY.exec(node.value);
        if (match) {
          context.report({ node, messageId: 'weightUtility', data: { value: match[0] } });
        }
      },
      'JSXAttribute[name.name="className"] TemplateLiteral'(node) {
        for (const quasi of node.quasis) {
          const match = WEIGHT_UTILITY.exec(quasi.value.cooked ?? '');
          if (match) {
            context.report({ node, messageId: 'weightUtility', data: { value: match[0] } });
          }
        }
      },
    };
  },
};
