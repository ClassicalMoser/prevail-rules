import type { PlayerSide } from '@entities/player';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities/player';
import { z } from 'zod';

export interface RoutDiscardState {
  /** The type of the substep. */
  substepType: 'routDiscard';
  /** The player that is discarding cards. */
  player: PlayerSide;
  /** The number of cards to discard. */
  numberToDiscard: number;
  /** Whether the cards have been chosen. */
  cardsChosen: boolean;
}

/** The schema for the state of the rout discard substep. */
const _routDiscardStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('routDiscard'),
  /** The player that is discarding cards. */
  player: playerSideSchema,
  /** The number of cards to discard. */
  numberToDiscard: z.number(),
  /** Whether the cards have been chosen. */
  cardsChosen: z.boolean(),
});

type RoutDiscardStateSchemaType = z.infer<typeof _routDiscardStateSchemaObject>;

const _assertExactRoutDiscardState: AssertExact<
  RoutDiscardState,
  RoutDiscardStateSchemaType
> = true;

/** The schema for the state of the rout discard substep. */
export const routDiscardStateSchema: z.ZodType<RoutDiscardState> =
  _routDiscardStateSchemaObject;
