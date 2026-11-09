import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to ranged attack event. */
export const COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE =
  'commitToRangedAttack' as const;

/**
 * The stats a shooter's card may be committed for (§8.4): Range, which
 * reaches one space further out when the target is chosen (§4.3.11); Attack,
 * which hits harder; and Flexibility, which will shrink a shooter's terrain
 * deficit once terrain lands (§2.5.2) and adds nothing until then. Defence is
 * not here: it belongs to the target, which commits on its own
 * (`commitToRangedDefense`).
 */
export const rangedAttackModifierTypes = [
  'range',
  'attack',
  'flexibility',
] as const;
/** A stat the shooter's commitment may apply. */
export type RangedAttackModifier = (typeof rangedAttackModifierTypes)[number];

// Type-level guarantee that RangedAttackModifier extends StatModifier
const _assertRangedAttackModifierExtendsStatModifier: [
  RangedAttackModifier,
] extends [StatModifier]
  ? true
  : never = true;

/**
 * The shooter's one commitment in a ranged attack (§4.3.11, §7.4.5): after
 * the firing unit is named and before its target is, its owner may commit a
 * card, or refuse (`committedCard` null). The card counts for the whole shot:
 * its Range when the target is chosen, its Attack when the shot lands.
 */
export interface CommitToRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE;
  /** The shooting player, committing (or refusing). */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /**
   * Card from hand to commit, or `null` to refuse / decline the commitment
   * without spending a card.
   */
  committedCard: CommandCard | null;
  /** The modifier types the card applies (empty when refusing). */
  modifierTypes: RangedAttackModifier[];
}

const rangedAttackModifierTypesEnum: z.ZodEnum<{
  range: 'range';
  attack: 'attack';
  flexibility: 'flexibility';
}> = z.enum(rangedAttackModifierTypes);

const _commitToRangedAttackEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE),
    /** The player who is committing (or refusing). */
    player: playerSideSchema,
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
    /**
     * Card from hand to commit, or `null` to refuse / decline the commitment
     * without spending a card.
     */
    committedCard: commandCardSchema.nullable(),
    /** The modifier types the card applies (empty when refusing). */
    modifierTypes: z.array(rangedAttackModifierTypesEnum),
  })
  .strict();

type CommitToRangedAttackEventSchemaType = z.infer<
  typeof _commitToRangedAttackEventSchemaObject
>;

const _assertExactCommitToRangedAttackEvent: AssertExact<
  CommitToRangedAttackEvent,
  CommitToRangedAttackEventSchemaType
> = true;

/** The schema for a commit to ranged attack event. */
export const commitToRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToRangedAttack'>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
  modifierTypes: z.ZodArray<typeof rangedAttackModifierTypesEnum>;
}> = _commitToRangedAttackEventSchemaObject;
