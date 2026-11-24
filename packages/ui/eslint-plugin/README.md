# eslint-plugin-hues

Anti-drift rules, shipped with `@hues/ui` and enabled in every app plus the
packages themselves. Mina §7 risk 1: without discipline each build hardcodes
"close enough" values — these rules fail the gate instead.

## Rules

- `hues/no-raw-hex` — raw hex colors outside `@hues/tokens` fail. Colors
  arrive through token variables or token imports.
- `hues/no-raw-px` — raw pixel values outside tokens fail: pure px strings,
  CSS declarations carrying px, and numeric px-implying style values
  (unitless properties excepted).
- `hues/no-anonymous-font-weight` — weights arrive through tokens. Flags
  `fontWeight` literals (only `var()` references and token imports pass)
  and weight utilities in `className`, including anonymous `font-[...]`
  instances and the Tailwind weight keywords (which resolve outside the
  named token weights and include Light, banned in UI).
- `hues/no-click-handler-nav` — navigation uses anchors only. Flags
  navigation calls inside inline `onClick` handlers, `onClick` on plain
  `div`/`span` hosts, and anchors that navigate through `onClick` with no
  `href`. Identifier handlers cannot be resolved statically and are out of
  scope by design.

## CSS coverage

ESLint parses JS/TS/TSX; the same four rules run over stylesheets through
`../scripts/drift-check.mjs`, which every package runs as part of
`npm run lint`. In CSS, `px` is additionally permitted only inside media
preludes at the spec bounds (391/500/767/768/1023/1024/1280), and
`font-weight` must reference a token variable — except inside `@font-face`
blocks, where the descriptor declares the face's own weight range (the font
package mechanism). `tokens/*.json` is the one place raw values may live;
test files hold ruling data and are exempt by config.

## Use in apps

```js
import hues from '@hues/ui/eslint-plugin';

export default [{ ...hues.configs.recommended }];
```
