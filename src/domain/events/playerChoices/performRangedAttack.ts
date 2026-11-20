import type { PlayerSide, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitInstanceSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the perform ranged attack player choice. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = 'performRangedAttack' as const;

/**
 * The shot itself, under a Shoot order (§4.3.11 steps 3–4): the target, and
 * any supporters who spend their own shots to add +1 each. The shooter
 * was named by `chooseShooter` and its card committed by
 * `commitToRangedAttack`, so this event carries only what is aimed at.
 *
 * `getLegalShooterTargets` enumerates the legal targets, and
 * `applyPerformRangedAttackEvent` applies the choice.
 */
export interface PerformRangedAttackEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE;
  /** The shooting player. */
  player: PlayerSide;
  /**
   * The enemy unit being shot at, named by who it is. Where it stands, and so
   * whether it is in range and sight, is the board's to say.
   */
  targetUnit: UnitInstance;
  /**
   * Other units of the same order spending their shots on this one
   * (§7.3.4), named by who they are; where each stands is read on the board.
   */
  supportingUnits: UnitInstance[];
}

const _performRangedAttackEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
    /** The shooting player. */
    player: playerSideSchema,
    /** Other units of the same order spending their shots on this one (§7.3.4). */
    supportingUnits: z.array(unitInstanceSchema),
    /** The enemy unit being shot at, named by who it is. */
    targetUnit: unitInstanceSchema,
  })
  .strict();

type PerformRangedAttackEventSchemaType = z.infer<
  typeof _performRangedAttackEventSchemaObject
>;

const _assertExactPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEvent,
  PerformRangedAttackEventSchemaType
> = true;

/** The schema for a perform ranged attack event. */
export const performRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  supportingUnits: z.ZodArray<typeof unitInstanceSchema>;
  targetUnit: typeof unitInstanceSchema;
}> = _performRangedAttackEventSchemaObject;
