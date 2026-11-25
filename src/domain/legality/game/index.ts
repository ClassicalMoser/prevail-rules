// Both sides' armies keep the army rules and the mode's limits, as Zod issues.
export { refineGameArmyComposition } from './refineGameArmyComposition';
// A game is played on the board size its mode calls for, as a Zod issue.
export { refineGameModeBoardSize } from './refineGameModeBoardSize';
// A game state's index says what its board and lists say, as Zod issues.
export { refineGameStateIndex } from './refineGameStateIndex';
// Every rule a whole game keeps, and the schemas for a game and a lone state.
export {
  legalGameSchema,
  legalGameStateSchema,
  refineGameRules,
} from './refineGameRules';
