import type { Board, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';

import { unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE = 'resolveRetreat' as const;

/** An event to resolve a retreat.
 * A retreat is a unit's smallest legal backward movement.
 *
 * This event is the **convergence event** that completes the retreat by actually
 * moving the unit on the board. It is generated after:
 * - The final position has been determined (either by player choice via `chooseRetreatOption`
 *   if multiple options exist, or automatically set when state is created if only one option)
 *
 * The unit will move from startingPosition to finalPosition on the board.
 * This event completes the retreat substep.
 *
 * **No phase / subtree tag**: Which retreat substep is active is already fixed by round
 * sequencing and prior choices; apply uses narrowing helpers from current state.
 */
export interface ResolveRetreatEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveRetreat' = 'resolveRetreat',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RETREAT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The starting position of the unit. */
  startingPosition: UnitWithPlacement<Board>;
  /** The final position the unit is retreating to (determined by player choice or auto-selected). */
  finalPosition: UnitWithPlacement<Board>;
}

const _resolveRetreatEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: z.number(),
  /** The starting position of the unit. */
  startingPosition: unitWithPlacementSchema,
  /** The final position the unit is retreating to (determined by player choice or auto-selected). */
  finalPosition: unitWithPlacementSchema,
});

type ResolveRetreatEventSchemaType = z.infer<
  typeof _resolveRetreatEventSchemaObject
>;

const _assertExactResolveRetreatEvent: AssertExact<
  ResolveRetreatEvent<Board>,
  ResolveRetreatEventSchemaType
> = true;

/** The schema for a resolve retreat event. */
export const resolveRetreatEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRetreat'>;
  eventNumber: z.ZodNumber;
  startingPosition: typeof unitWithPlacementSchema;
  finalPosition: typeof unitWithPlacementSchema;
}> = _resolveRetreatEventSchemaObject;
