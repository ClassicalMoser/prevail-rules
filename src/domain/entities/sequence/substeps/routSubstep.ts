import type { PlayerSide } from '@entities/player';
import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import { playerSideSchema } from '@entities/player';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';

export interface RoutState {
  /** The type of the substep. */
  substepType: 'rout';
  /** The player that is discarding cards. */
  player: PlayerSide;
  /** The units that are being routed. */
  unitsToRout: Set<UnitInstance>;
  /** The number of cards to discard. */
  numberToDiscard: number | undefined;
  /** Whether the cards have been chosen. */
  cardsChosen: boolean;
  /** Whether the cards have been discarded. */
  cardsDiscarded: boolean;
}

/** The schema for the state of the rout discard substep. */
const _routStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('rout'),
  /** The player that is discarding cards. */
  player: playerSideSchema,
  /** The units that are being routed. */
  unitsToRout: z.set(unitInstanceSchema),
  /** The number of cards to discard. */
  numberToDiscard: z.number().or(z.undefined()),
  /** Whether the cards have been chosen. */
  cardsChosen: z.boolean(),
  /** Whether the cards have been discarded. */
  cardsDiscarded: z.boolean(),
});

type RoutStateSchemaType = z.infer<typeof _routStateSchemaObject>;

const _assertExactRoutState: AssertExact<RoutState, RoutStateSchemaType> = true;

/** The schema for the state of the rout discard substep. */
export const routStateSchema: z.ZodType<RoutState> = _routStateSchemaObject;
