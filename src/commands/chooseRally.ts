import type { PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities';
import { z } from 'zod';

/** A command to choose a rally from the player's hand. */
export interface ChooseRallyCommand {
  /** The player who is choosing whether to perform a rally. */
  player: PlayerSide;
  /** Whether the player is performing a rally. */
  performRally: boolean;
}

const _chooseRallyCommandSchemaObject = z.object({
  /** The player who is choosing whether to perform a rally. */
  player: playerSideSchema,
  /** Whether the player is performing a rally. */
  performRally: z.boolean(),
});

type ChooseRallyCommandSchemaType = z.infer<
  typeof _chooseRallyCommandSchemaObject
>;

/** The schema for a choose rally command. */
export const chooseRallyCommandSchema: z.ZodType<ChooseRallyCommand> =
  _chooseRallyCommandSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseRallyCommand: AssertExact<
  ChooseRallyCommand,
  ChooseRallyCommandSchemaType
> = true;
