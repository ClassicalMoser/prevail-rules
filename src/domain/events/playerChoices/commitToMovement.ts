import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to movement event. */
export const COMMIT_TO_MOVEMENT_CHOICE_TYPE = 'commitToMovement' as const;

const movementModifierTypes = ['speed', 'flexibility'] as const;
type MovementModifier = (typeof movementModifierTypes)[number];

// Type-level guarantee that MovementModifier extends StatModifier
const _assertMovementModifierExtendsStatModifier: [MovementModifier] extends [
  StatModifier,
]
  ? true
  : never = true;

/** An event to commit a card to a unit's movement — or refuse (`committedCard` null). */
export interface CommitToMovementEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_MOVEMENT_CHOICE_TYPE;
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
  modifierTypes: MovementModifier[];
}

const movementModifierTypesEnum: z.ZodEnum<{
  speed: 'speed';
  flexibility: 'flexibility';
}> = z.enum(movementModifierTypes);

const _commitToMovementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(COMMIT_TO_MOVEMENT_CHOICE_TYPE),
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
  modifierTypes: z.array(movementModifierTypesEnum),
});

type CommitToMovementEventSchemaType = z.infer<
  typeof _commitToMovementEventSchemaObject
>;

const _assertExactCommitToMovementEvent: AssertExact<
  CommitToMovementEvent,
  CommitToMovementEventSchemaType
> = true;

/** The schema for a commit to movement event. */
export const commitToMovementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToMovement'>;
  eventNumber: z.ZodNumber;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
  modifierTypes: z.ZodArray<typeof movementModifierTypesEnum>;
}> = _commitToMovementEventSchemaObject;
