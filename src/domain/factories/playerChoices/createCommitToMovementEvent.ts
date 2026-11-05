import type { CommandCard, PlayerSide } from '@entities';
import type { CommitToMovementEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A commitToMovement event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - committedCard, eventNumber, modifierTypes, player
 * @returns The event
 */
export function createCommitToMovementEvent(fields: {
  committedCard: CommandCard | null;
  eventNumber: number;
  modifierTypes: CommitToMovementEvent['modifierTypes'];
  player: PlayerSide;
}): CommitToMovementEvent {
  return {
    choiceType: 'commitToMovement',
    committedCard: fields.committedCard,
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    modifierTypes: fields.modifierTypes,
    player: fields.player,
  };
}
