// Visibility helpers
export type {
  CardStateForVisibility,
  GameStateVisibility,
} from './gameStateVisibility';

// Shared shape
export type { GameStateForVisibility } from './gameStateForVisibility';

// Authoritative
export { authoritativeGameStateSchema } from './authoritativeGameState';

// White seen
export { whiteSeenGameStateSchema } from './whiteSeenGameState';

// Black seen
export { blackSeenGameStateSchema } from './blackSeenGameState';

// Union
export { gameStateSchema } from './gameState';
export type {
  GameState,
  OwnedPlayerForGameState,
  UnownedPlayerForGameState,
} from './gameState';
