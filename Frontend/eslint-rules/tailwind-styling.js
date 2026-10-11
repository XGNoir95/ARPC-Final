// Keep layout and visual styling in discoverable Tailwind utility strings.
export default {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      stylesheet: "Use Tailwind utilities. Only src/main.jsx may import the global index.css entry point.",
      inline: "Use a Tailwind utility for '{{property}}'. Inline styles may only supply --custom-properties for data or measured animation geometry.",
      spread: "List inline --custom-properties explicitly so the Tailwind styling policy can validate them.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (!/\.css(?:\?|$)/.test(node.source.value)) return;
        const filename = context.filename.replaceAll("\\", "/");
        if (filename.endsWith("/src/main.jsx") && node.source.value === "./index.css") return;
        context.report({ node, messageId: "stylesheet" });
      },
      JSXAttribute(node) {
        if (node.name.name !== "style" || node.value?.type !== "JSXExpressionContainer") return;
        const expression = node.value.expression;
        // A helper may return data-driven custom properties (e.g. book bindingFor).
        if (expression.type !== "ObjectExpression") return;
        for (const property of expression.properties) {
          if (property.type === "SpreadElement" || property.computed) {
            context.report({ node: property, messageId: "spread" });
            continue;
          }
          const name = property.key.name ?? property.key.value;
          if (typeof name !== "string" || !name.startsWith("--")) {
            context.report({ node: property, messageId: "inline", data: { property: name } });
          }
        }
      },
    };
  },
};
