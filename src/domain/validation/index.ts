// A game record checked against the armies that fought it: each card and
// each unit accounted for once.
export { eachCardPresentOnce, eachUnitPresentOnce } from './gameState';
// The game and game-state schemas with the game rules, from `@legality`, for
// the application, which may not import that layer itself.
export { legalGameSchema, legalGameStateSchema } from './game/legalGameSchemas';
// The validation engine's entry point for a player's choice, and the legal
// options a UI or bot is offered for it.
export {
  getLegalPlayerChoiceOptions,
  validatePlayerChoice,
} from './playerChoice';
// The shapes of those options: for whichever choice is expected, keyed by
// choice, and for one choice or a few.
export type {
  LegalPlayerChoiceOptions,
  LegalPlayerChoiceOptionsByChoice,
  LegalPlayerChoiceOptionsFor,
} from './playerChoice';
