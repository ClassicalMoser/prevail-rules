import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * A player in the game.
 */
export interface Player {
  /** The unique identifier of the player. */
  id: string;
  /** The name of the player. */
  name: string;
  /** Whether the player is a bot. */
  isBot: boolean;
}

const _playerSchemaObject = z.object({
  /** The unique identifier of the player. */
  id: z.string().uuid(),
  /** The name of the player. */
  name: z.string(),
  /** Whether the player is a bot. */
  isBot: z.boolean(),
});

type PlayerSchemaType = z.infer<typeof _playerSchemaObject>;

/**
 * The schema for a player.
 */
export const playerSchema: z.ZodType<Player> = _playerSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayer: AssertExact<Player, PlayerSchemaType> = true;
