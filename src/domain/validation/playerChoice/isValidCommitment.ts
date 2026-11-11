import type { CommandCard, PlayerSide } from '@entities';
import type { ValidationResult } from '@utils';
import { isSameCard, isSameCardValue } from '@queries';

/** A commitment: a card committed from hand, or a refusal (§8.3). */
interface CommitmentChoice {
  /** The player committing. */
  player: PlayerSide;
  /** The card committed, or `null` for a refusal. */
  committedCard: CommandCard | null;
}

/**
 * Whether a commitment is one the player is offered: the same player, and
 * either the same refusal or the same card, by id. A card is committed from
 * hand for the stat it names at that moment (§8.4), and a player may always
 * refuse (§8.3).
 *
 * The four moments a card may be committed (a move, a melee, a shot, and the
 * answer to a shot) differ in which cards they offer and not in how a
 * commitment is judged, so each asks its own enumerator and this judges the
 * answer.
 *
 * @param event - The commitment the player sent
 * @param legalOptions - The commitments the moment offers
 * @param moment - What the commitment is for, as a player says it, for a refusal
 * @returns Success, or why the commitment is not one offered
 */
export function isValidCommitment(
  event: CommitmentChoice,
  legalOptions: readonly CommitmentChoice[],
  moment: string,
): ValidationResult {
  // The same player, and the same card (or the same refusal).
  const legalOption = legalOptions.find((option) => {
    if (option.player !== event.player) {
      return false;
    }
    if (option.committedCard === null || event.committedCard === null) {
      return option.committedCard === event.committedCard;
    }
    return isSameCard(option.committedCard, event.committedCard);
  });
  if (legalOption === undefined) {
    const cardLabel =
      event.committedCard === null
        ? 'refuse'
        : `card ${event.committedCard.id}`;
    const illegal: ValidationResult = {
      errorReason: `Commit to ${moment} is not legal for ${event.player} with ${cardLabel}`,
      result: false,
    };
    return illegal;
  }

  // The id names a card the player holds; what the event says that card is
  // must be what it is, since the commitment's stats are read from it.
  if (legalOption.committedCard !== null && event.committedCard !== null) {
    const sameCard = isSameCardValue(
      legalOption.committedCard,
      event.committedCard,
    );
    if (!sameCard.result) {
      return sameCard;
    }
  }

  const valid: ValidationResult = { result: true };
  return valid;
}
