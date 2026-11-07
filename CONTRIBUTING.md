# Contributing

## Checks

Use the scripts in `package.json`. Do not call `vitest`, `tsc`, `oxlint`, or `oxfmt` directly.

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint:fix
pnpm validate
pnpm check:commentary
```

`pnpm lint:fix` rewrites imports into the house shape. It cannot fix an import that is circular or that names a module which does not exist.

Lint is Oxlint. The config is [`oxlint.config.ts`](./oxlint.config.ts), built from `classicalmoser-oxlint-config`, with import boundaries from [`boundaries.ts`](./boundaries.ts) and camelCase filenames. Format is Oxfmt. In an editor that type-checks as you type and applies fixes on save, a lot of this happens before you notice it. Agents and other setups do not share those defaults. Run `pnpm lint:fix` and `pnpm validate` yourself.

`pnpm validate` is lint, formatting, typecheck, and the self-proof check that no spec reaches its own subject. Run it often, and before a commit. A pre-commit hook runs it, so a commit that does not pass does not land.

`pnpm check:commentary` reports in-body commentary density per layer. It cannot fail, and it is not a target to hit: padding a body raises the number and makes the file worse.

## Standards

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — pure functions, immutability, events
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which
