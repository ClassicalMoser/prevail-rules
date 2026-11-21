// The game as the server keeps it.
export { gameSchema } from './game';
export type { Game } from './game';

// The game as one viewer may see it: one variant per view, then any view.
export {
  authoritativeProjectedGameSchema,
  whiteSeenProjectedGameSchema,
  blackSeenProjectedGameSchema,
  spectatorProjectedGameSchema,
  projectedGameSchema,
} from './projectedGame';
export type {
  AuthoritativeProjectedGame,
  WhiteSeenProjectedGame,
  BlackSeenProjectedGame,
  SpectatorProjectedGame,
  ProjectedGame,
} from './projectedGame';
