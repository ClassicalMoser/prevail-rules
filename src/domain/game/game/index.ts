// The game as the server keeps it.
export { gameSchema } from './game';
export type { Game } from './game';

// The game as one viewer may see it: one variant per view, then any view.
export {
  authoritativeProjectedGameSchema,
  blackSeenProjectedGameSchema,
  projectedGameSchema,
  spectatorProjectedGameSchema,
  whiteSeenProjectedGameSchema,
} from './projectedGame';
export type {
  AuthoritativeProjectedGame,
  BlackSeenProjectedGame,
  ProjectedGame,
  SpectatorProjectedGame,
  WhiteSeenProjectedGame,
} from './projectedGame';
