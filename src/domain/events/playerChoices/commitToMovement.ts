import type { Board, Card, PlayerSide, StatModifier } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { COMMIT_TO_MOVEMENT_CHOICE_TYPE } from './playerChoice';

const movementModifierTypes = ['speed', 'flexibility'] as const;
type MovementModifier = (typeof movementModifierTypes)[number];

// Type-level guarantee that MovementModifier extends StatModifier
const _assertMovementModifierExtendsStatModifier: [MovementModifier] extends [
  StatModifier,
]
  ? true
  : never = true;

/** An event to commit a card to a unit's movement. */
export interface CommitToMovementEvent<_TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_MOVEMENT_CHOICE_TYPE;
  /** The player who is committing the card. */
  player: PlayerSide;
  /** The card to commit from the player's hand. */
  committedCard: Card;
  /** The modifier types the card applies. */
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
  /** The player who is committing the card. */
  player: playerSideSchema,
  /** The card to commit from the player's hand. */
  committedCard: cardSchema,
  /** The modifier types the card applies. */
  modifierTypes: z.array(movementModifierTypesEnum),
});

type CommitToMovementEventSchemaType = z.infer<
  typeof _commitToMovementEventSchemaObject
>;

const _assertExactCommitToMovementEvent: AssertExact<
  CommitToMovementEvent<Board>,
  CommitToMovementEventSchemaType
> = true;

/** The schema for a commit to movement event. */
export const commitToMovementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToMovement'>;
  player: typeof playerSideSchema;
  committedCard: typeof cardSchema;
  modifierTypes: z.ZodArray<typeof movementModifierTypesEnum>;
}> = _commitToMovementEventSchemaObject;
