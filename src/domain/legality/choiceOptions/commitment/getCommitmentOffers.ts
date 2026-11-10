import type { CommandCard, PlayerSide, StatModifier } from '@entities';
import type { CardState } from '@game';
import { findOwnedPlayerCardState } from '@queries';

/** One commitment a player may make: a card and the stats it applies, or a refusal. */
export interface CommitmentOffer<M extends StatModifier> {
  /** The card committed, or `null` to refuse without spending one. */
  committedCard: CommandCard | null;
  /** The card's stats that count here; empty for a refusal. */
  modifierTypes: M[];
}

/**
 * The stats on a card that count for this commitment, in the card's order.
 *
 * @param card - A card in the committing player's hand
 * @param accepted - The stats this commitment may apply
 * @returns The card's stats among them
 */
function acceptedModifiersOnCard<M extends StatModifier>(
  card: CommandCard,
  accepted: readonly M[],
): M[] {
  const kept: M[] = [];
  for (const modifier of card.modifiers) {
    const match = accepted.find((stat) => stat === modifier);
    if (match !== undefined) {
      kept.push(match);
    }
  }
  return kept;
}

/**
 * Every commitment a player may make when asked to commit a card (§8): each
 * card in hand naming a stat this commitment applies, with exactly those of
 * its stats (§8.4), and the refusal, which is always open (§8.3). A card
 * naming none of them is no use here and is not offered.
 *
 * A seat that cannot see this hand can still refuse; only the hand's owner
 * can name a card from it, so a hidden hand offers the refusal alone.
 *
 * @param cardState - The card state, under the asking view's visibility
 * @param player - The player asked to commit
 * @param accepted - The stats this commitment may apply
 * @returns Each card offer, then the refusal last
 */
export function getCommitmentOffers<M extends StatModifier>(
  cardState: CardState,
  player: PlayerSide,
  accepted: readonly M[],
): CommitmentOffer<M>[] {
  const hand = findOwnedPlayerCardState(cardState, player)?.inHand ?? [];

  const offers: CommitmentOffer<M>[] = [];
  for (const committedCard of hand) {
    const modifierTypes = acceptedModifiersOnCard(committedCard, accepted);
    if (modifierTypes.length > 0) {
      offers.push({ committedCard, modifierTypes });
    }
  }

  offers.push({ committedCard: null, modifierTypes: [] });
  return offers;
}
