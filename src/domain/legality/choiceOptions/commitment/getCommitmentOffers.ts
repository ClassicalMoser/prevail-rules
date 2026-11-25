import type { CommandCard, PlayerSide } from '@entities';
import type { StatModifier } from '@ruleValues';
import type { CardState } from '@game';
import { findOwnedPlayerCardState } from '@queries';

/** One commitment a player may make: a card from hand, or a refusal. */
export interface CommitmentOffer {
  /** The card committed, or `'none'` to refuse without spending one. */
  committedCard: CommandCard | 'none';
}

/**
 * Whether a card names a stat this commitment applies (§8.4): a card naming
 * none of them is no use here.
 *
 * @param card - A card in the committing player's hand
 * @param accepted - The stats this commitment may apply
 * @returns True when the card names at least one of them
 */
function namesAnAcceptedStat<M extends StatModifier>(
  card: CommandCard,
  accepted: readonly M[],
): boolean {
  // A card names one stat, or at most two (§8.2); one of them accepted here is
  // enough, and a second stat the moment does not use is simply ignored.
  const names = card.modifiers.some((modifier) =>
    accepted.some((stat) => stat === modifier),
  );

  // Whether committing this card could add anything at this moment.
  return names;
}

/**
 * Every commitment a player may make when asked to commit a card (§8): each
 * card in hand naming a stat this commitment applies (§8.4), and the refusal, which is always open (§8.3). A card
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
): CommitmentOffer[] {
  // Only cards in hand can be committed (§8.6). A hand this view cannot see
  // reads as empty here, so no card of it is named.
  const hand = findOwnedPlayerCardState(cardState, player)?.inHand ?? [];

  // Each card that names a stat this moment accepts is one commitment the
  // player may make (§8.4); the rest are no use here and are not offered.
  const offers: CommitmentOffer[] = [];
  for (const committedCard of hand) {
    if (namesAnAcceptedStat(committedCard, accepted)) {
      offers.push({ committedCard });
    }
  }

  // Commitment is always optional (§8.3), so refusing is always offered, and
  // offered last.
  offers.push({ committedCard: 'none' });

  // Every commitment the player may make here; each `getLegalCommitTo*Events`
  // turns these into the events its validator checks membership against.
  return offers;
}
