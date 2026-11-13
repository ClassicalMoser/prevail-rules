import type { Command } from '@entities';
import type { AssertExact } from '@utils';
import { commandSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/**
 * Literal discriminator for {@link CompleteMoveCommandersPhaseEvent.effectType}.
 *
 * Phase transition: move commanders → issue commands. Next phase needs each player’s remaining
 * command set from in-play cards; that derivation stays in the procedure so apply only writes
 * the sets onto state.
 */
export const COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE =
  'completeMoveCommandersPhase' as const;

/**
 * Ends Phase 2, Move Commanders, and begins Phase 3, Issue Commands (§4.3).
 * Each player's orders for the phase come from the command on their card in
 * play (§4.3.1). The event records them, so applying it reads no cards.
 *
 * `generateCompleteMoveCommandersPhaseEvent` writes it, and `applyCompleteMoveCommandersPhaseEvent` applies it.
 */
export interface CompleteMoveCommandersPhaseEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE;
  /**
   * Remaining commands for the initiative player for the new issue-commands phase.
   * Derived from that player's in-play card when the procedure runs; apply trusts the log.
   */
  remainingCommandsFirstPlayer: Command[];
  /**
   * Remaining commands for the non-initiative player for the new issue-commands phase.
   */
  remainingCommandsSecondPlayer: Command[];
}

const _completeMoveCommandersPhaseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE>;
  remainingCommandsFirstPlayer: z.ZodArray<typeof commandSchema>;
  remainingCommandsSecondPlayer: z.ZodArray<typeof commandSchema>;
}> = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE),
    /** Mirrors `remainingCommandsFirstPlayer` on {@link CompleteMoveCommandersPhaseEvent}. */
    remainingCommandsFirstPlayer: z.array(commandSchema),
    /** Mirrors `remainingCommandsSecondPlayer` on {@link CompleteMoveCommandersPhaseEvent}. */
    remainingCommandsSecondPlayer: z.array(commandSchema),
  })
  .strict();

type CompleteMoveCommandersPhaseEventSchemaType = z.infer<
  typeof _completeMoveCommandersPhaseEventSchemaObject
>;

const _assertExactCompleteMoveCommandersPhaseEvent: AssertExact<
  CompleteMoveCommandersPhaseEvent,
  CompleteMoveCommandersPhaseEventSchemaType
> = true;

/** The schema for a complete move commanders phase event. */
export const completeMoveCommandersPhaseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeMoveCommandersPhase'>;
  remainingCommandsFirstPlayer: z.ZodArray<typeof commandSchema>;
  remainingCommandsSecondPlayer: z.ZodArray<typeof commandSchema>;
}> = _completeMoveCommandersPhaseEventSchemaObject;
