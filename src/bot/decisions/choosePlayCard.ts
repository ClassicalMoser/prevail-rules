import type { ChooseCardEvent } from '@events';
import type { BotContext } from './botContext';
import { appraiseCard, pickBest } from '@bot/appraisal';

/**
 * Picks the card to lay face down this round (§4.1.1). Both players choose
 * at once, and a seat is offered only its own hand, so every offer here is
 * the bot's own. It plays the card that does most for it now, holding back
 * cards worth keeping as far as its thrift says.
 *
 * @param offers - The cards it may play, one event each
 * @param context - What the bot decides from
 * @returns The card it plays
 */
export function choosePlayCard(
  offers: readonly ChooseCardEvent[],
  context: BotContext,
): ChooseCardEvent {
  const { view, seat, temperament, random } = context;
  const choice = pickBest(
    offers,
    (offer) => appraiseCard(view, seat, offer.card, temperament),
    temperament,
    random,
  );
  return choice;
}
