/** Boundary schemas: game shape plus the game rules. */
// Re-exported, not defined, here: the rules belong to `@legality`, and
// `@application` reads a game through `@validation` because it may not import
// `@legality` (`boundaries.ts`). Its caller is `parseLegalGameForMode`.
export { legalGameSchema, legalGameStateSchema } from '@legality';
