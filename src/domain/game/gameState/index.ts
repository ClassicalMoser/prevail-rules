// Visibility
export type { GameStateVisibility } from './gameStateVisibility';

// Authoritative
export { authoritativeGameStateSchema } from './authoritativeGameState';
export type { AuthoritativeGameState } from './authoritativeGameState';

// White seen
export { whiteSeenGameStateSchema } from './whiteSeenGameState';
export type { WhiteSeenGameState } from './whiteSeenGameState';

// Black seen
export { blackSeenGameStateSchema } from './blackSeenGameState';
export type { BlackSeenGameState } from './blackSeenGameState';

// Spectator (both hands hidden)
export { spectatorGameStateSchema } from './spectatorGameState';
export type { SpectatorGameState } from './spectatorGameState';

// Union
export { gameStateSchema } from './gameState';
export type {
  GameState,
  OwnedPlayerForGameState,
  UnownedPlayerForGameState,
} from './gameState';

// Index of where every piece is
export { gameStateIndexSchema } from './gameStateIndex';
export type {
  CommanderIndexEntry,
  GameStateIndex,
  UnitIndexEntry,
  UnitIndexKey,
} from './gameStateIndex';
