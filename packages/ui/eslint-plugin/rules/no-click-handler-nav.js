/**
 * hues/no-click-handler-nav: navigation uses anchors only.
 * Flags navigation calls and location assignments inside inline onClick
 * handlers, onClick on plain div/span hosts (use button or anchor), and
 * anchors that navigate through onClick with no href. Identifier handlers
 * cannot be resolved statically and are out of scope by design.
 */
const NAVIGATE_CALL = /^(navigate|assign|replace)$/;
const NAVIGATE_RECEIVER = /^(router|history|location|window)$/;

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow navigation through click handlers instead of anchors',
    },
    messages: {
      handlerNav: 'Navigation inside a click handler. Navigating controls are anchors (the Link component).',
      clickableHost: 'onClick on a {{host}} with no role. Use a button, an anchor, or a labelled host.',
      anchorNoHref: 'Anchor navigates through onClick with no href. Give it an href or use a button.',
    },
    schema: [],
  },
  create(context) {
    const handlerFunctions = new Set();

    const isNavigationCall = (node) => {
      if (node.type !== 'CallExpression') return false;
      const callee = node.callee;
      if (callee.type === 'Identifier' && NAVIGATE_CALL.test(callee.name)) return true;
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.property.type === 'Identifier' &&
        NAVIGATE_CALL.test(callee.property.name) &&
        callee.object.type === 'Identifier' &&
        NAVIGATE_RECEIVER.test(callee.object.name)
      ) {
        return true;
      }
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.property.type === 'Identifier' &&
        (callee.property.name === 'pushState' || callee.property.name === 'replaceState') &&
        callee.object.type === 'MemberExpression'
      ) {
        return true;
      }
      return false;
    };

    return {
      'JSXAttribute[name.name="onClick"]'(node) {
        const expression = node.value?.expression;
        if (
          expression &&
          (expression.type === 'ArrowFunctionExpression' || expression.type === 'FunctionExpression')
        ) {
          handlerFunctions.add(expression);
        }
        const opening = node.parent;
        const host = opening?.name?.name;
        if ((host === 'div' || host === 'span') && !opening.attributes.some((attr) => attr.name?.name === 'role')) {
          context.report({ node, messageId: 'clickableHost', data: { host } });
        }
        if (host === 'a' && !opening.attributes.some((attr) => attr.name?.name === 'href')) {
          context.report({ node, messageId: 'anchorNoHref' });
        }
      },
      CallExpression(node) {
        let current = node.parent;
        while (current) {
          if (handlerFunctions.has(current)) {
            if (isNavigationCall(node)) context.report({ node, messageId: 'handlerNav' });
            return;
          }
          current = current.parent;
        }
      },
      AssignmentExpression(node) {
        const target = node.left;
        const isLocationRef = (expr) =>
          (expr.type === 'Identifier' && expr.name === 'location') ||
          (expr.type === 'MemberExpression' &&
            !expr.computed &&
            expr.object.type === 'Identifier' &&
            expr.object.name === 'window' &&
            expr.property.type === 'Identifier' &&
            expr.property.name === 'location');
        const assignsLocation =
          isLocationRef(target) || (target.type === 'MemberExpression' && isLocationRef(target.object));
        if (!assignsLocation) return;
        let current = node.parent;
        while (current) {
          if (handlerFunctions.has(current)) {
            context.report({ node, messageId: 'handlerNav' });
            return;
          }
          current = current.parent;
        }
      },
    };
  },
};
