import type { CommandCard } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import type { LegalRoutDiscardCards } from '@legality';
import type { BotContext } from './botContext';
import { getOwnedPlayerCardState } from '@queries';
import { appraiseKeeping } from '@bot/appraisal';

/**
 * Pays for a routed unit by discarding as many cards as its Morale (§9.3.2).
 * The cards are the owner's free choice, so the bot gives up the ones least
 * worth keeping. Whether it can pay at all is the rules' business: a hand too
 * small to pay loses the game (§11), and the offer says how many are owed.
 *
 * @param offer - How many cards are owed and which may pay
 * @param context - What the bot decides from
 * @returns The cards it discards
 */
export function chooseRoutDiscard(
  offer: LegalRoutDiscardCards,
  context: BotContext,
): ChooseRoutDiscardEvent {
  const hand = getOwnedPlayerCardState(
    context.view.cardState,
    offer.player,
  ).inHand;
  // The cards that may pay, cheapest to lose first.
  const payable: CommandCard[] = hand
    .filter((card) => offer.cardIds.includes(card.id))
    .toSorted((a, b) => appraiseKeeping(a) - appraiseKeeping(b));
  const event: ChooseRoutDiscardEvent = {
    cards: payable.slice(0, offer.numberToDiscard),
    choiceType: 'chooseRoutDiscard',
    eventType: 'playerChoice',
    player: offer.player,
  };
  return event;
}
