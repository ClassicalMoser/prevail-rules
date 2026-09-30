# Contributing

## Checks

Use the scripts in `package.json`. Do not call `vitest`, `tsc`, `oxlint`, or `oxfmt` directly.

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint:fix
pnpm validate
```

`pnpm lint:fix` rewrites imports into the house shape. It cannot fix an import that is circular or that names a module which does not exist.

Lint is Oxlint. The config is [`oxlint.config.ts`](./oxlint.config.ts), built from `classicalmoser-oxlint-config`, with import boundaries from [`boundaries.ts`](./boundaries.ts) and camelCase filenames. Format is Oxfmt. In an editor that type-checks as you type and applies fixes on save, a lot of this happens before you notice it. Agents and other setups do not share those defaults. Run `pnpm lint:fix` and `pnpm validate` yourself.

`pnpm validate` is lint, format, and typecheck. Run it often, and before a commit.

## Standards

- [`STYLE.md`](./STYLE.md) — functions, files, commentary, tests
- [`DESIGN.md`](./DESIGN.md) — pure functions, immutability, events
- [`LAYERS.md`](./LAYERS.md) — what each layer is for
- [`boundaries.ts`](./boundaries.ts) — which package may import which
