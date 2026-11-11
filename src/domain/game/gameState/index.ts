// Visibility
export type { GameStateVisibility } from './gameStateVisibility';

// What every view shares
export type { GameStateBase } from './gameStateBase';

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
