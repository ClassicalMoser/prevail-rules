import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to melee event. */
export const COMMIT_TO_MELEE_CHOICE_TYPE = 'commitToMelee' as const;

const meleeModifierTypes = ['attack', 'defense', 'flexibility'] as const;
type MeleeModifier = (typeof meleeModifierTypes)[number];

// Type-level guarantee that MeleeModifier extends StatModifier
const _assertMeleeModifierExtendsStatModifier: [MeleeModifier] extends [
  StatModifier,
]
  ? true
  : never = true;

/** An event to commit a card to melee — or refuse (`committedCard` null). */
export interface CommitToMeleeEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_MELEE_CHOICE_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is committing (or refusing). */
  player: PlayerSide;
  /**
   * Card from hand to commit, or `null` to refuse / decline the commitment
   * without spending a card.
   */
  committedCard: CommandCard | null;
  /** The modifier types the card applies (empty when refusing). */
  modifierTypes: MeleeModifier[];
}

const meleeModifierTypesEnum: z.ZodEnum<{
  attack: 'attack';
  defense: 'defense';
  flexibility: 'flexibility';
}> = z.enum(meleeModifierTypes);

const _commitToMeleeEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(COMMIT_TO_MELEE_CHOICE_TYPE),
    /** The ordered index of the event in the round, zero-indexed. */
    eventNumber: z.number(),
    /** The player who is committing (or refusing). */
    player: playerSideSchema,
    /**
     * Card from hand to commit, or `null` to refuse / decline the commitment
     * without spending a card.
     */
    committedCard: commandCardSchema.nullable(),
    /** The modifier types the card applies (empty when refusing). */
    modifierTypes: z.array(meleeModifierTypesEnum),
  })
  .strict();

type CommitToMeleeEventSchemaType = z.infer<
  typeof _commitToMeleeEventSchemaObject
>;

const _assertExactCommitToMeleeEvent: AssertExact<
  CommitToMeleeEvent,
  CommitToMeleeEventSchemaType
> = true;

/** The schema for a commit to melee event. */
export const commitToMeleeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToMelee'>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
  modifierTypes: z.ZodArray<typeof meleeModifierTypesEnum>;
}> = _commitToMeleeEventSchemaObject;
