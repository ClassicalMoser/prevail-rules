import type { CommandCard, PlayerSide } from '@entities';
import type {
  CommitToRangedDefenseEvent,
  RangedDefenseModifier,
} from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A commitToRangedDefense event: the target of a shot commits a card for
 * Defence, or refuses (§4.3.11 step 5).
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `committedCard` card from hand to commit, or `null` to
 * refuse; `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `modifierTypes` the modifier types the card applies (empty
 * when refusing); `player` the target's owner
 * @returns The event
 */
export function createCommitToRangedDefenseEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  committedCard: CommandCard | null;
  modifierTypes: RangedDefenseModifier[];
}): CommitToRangedDefenseEvent {
  const event: CommitToRangedDefenseEvent = {
    choiceType: 'commitToRangedDefense',
    committedCard: fields.committedCard,
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    modifierTypes: fields.modifierTypes,
    player: fields.player,
  };
  return event;
}
