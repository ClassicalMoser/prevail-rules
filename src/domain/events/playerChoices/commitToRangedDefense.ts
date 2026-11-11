import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to ranged defense event. */
export const COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE =
  'commitToRangedDefense' as const;

/**
 * The stats a shot's target may commit a card for (§8.4, B1): Defence, which
 * raises all three of its thresholds against this shot (§8.5); and
 * Flexibility, which shrinks a terrain deficit, and with it the penalty a
 * deficit puts on those same thresholds (§2.5.2). Flexibility adds nothing
 * until terrain lands. Range and Attack are not here: they belong to the
 * shooter, which commits on its own (`commitToRangedAttack`).
 */
export const rangedDefenseModifierTypes = ['defense', 'flexibility'] as const;
/** A stat the target's commitment may apply. */
export type RangedDefenseModifier = (typeof rangedDefenseModifierTypes)[number];

// Type-level guarantee that RangedDefenseModifier extends StatModifier
const _assertRangedDefenseModifierExtendsStatModifier: [
  RangedDefenseModifier,
] extends [StatModifier]
  ? true
  : never = true;

/**
 * The target's commitment in a ranged attack (§4.3.11 step 5, §7.4.5): once
 * the shooter has committed and named its target, the target's owner may
 * commit a card for Defence or Flexibility, or refuse (`committedCard` null). A separate
 * event from the shooter's, so a shooter can never commit Defence and a
 * target can never commit Range.
 */
export interface CommitToRangedDefenseEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE;
  /** The target's owner, committing (or refusing). */
  player: PlayerSide;
  /**
   * Card from hand to commit, or `null` to refuse / decline the commitment
   * without spending a card.
   */
  committedCard: CommandCard | null;
  /** The modifier types the card applies (empty when refusing). */
  modifierTypes: RangedDefenseModifier[];
}

const rangedDefenseModifierTypesEnum: z.ZodEnum<{
  defense: 'defense';
  flexibility: 'flexibility';
}> = z.enum(rangedDefenseModifierTypes);

const _commitToRangedDefenseEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE),
    /** The target's owner, committing (or refusing). */
    player: playerSideSchema,
    /**
     * Card from hand to commit, or `null` to refuse / decline the commitment
     * without spending a card.
     */
    committedCard: commandCardSchema.nullable(),
    /** The modifier types the card applies (empty when refusing). */
    modifierTypes: z.array(rangedDefenseModifierTypesEnum),
  })
  .strict();

type CommitToRangedDefenseEventSchemaType = z.infer<
  typeof _commitToRangedDefenseEventSchemaObject
>;

const _assertExactCommitToRangedDefenseEvent: AssertExact<
  CommitToRangedDefenseEvent,
  CommitToRangedDefenseEventSchemaType
> = true;

/** The schema for a commit to ranged defense event. */
export const commitToRangedDefenseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToRangedDefense'>;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
  modifierTypes: z.ZodArray<typeof rangedDefenseModifierTypesEnum>;
}> = _commitToRangedDefenseEventSchemaObject;
