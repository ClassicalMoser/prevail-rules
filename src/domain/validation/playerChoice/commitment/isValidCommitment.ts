import type { CommandCard, PlayerSide } from '@entities';
import type { ValidationResult } from '@utils';
import { isActive, isNone } from '@utils';
import { isSameCard, isSameCardValue } from '@queries';

/** A commitment: a card committed from hand, or a refusal (§8.3). */
interface CommitmentChoice {
  /** The player committing. */
  player: PlayerSide;
  /** The card committed, or `'none'` for a refusal. */
  committedCard: CommandCard | 'none';
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
    // Only the player the moment asks may answer it: the shooter does not
    // commit for its target, and in a melee each player commits in turn
    // (§7.2.2, §7.4.5).
    if (option.player !== event.player) {
      return false;
    }

    // A refusal matches only a refusal. A player may always decline (§8.3),
    // and the enumerator offers that as its own option.
    if (isNone(option.committedCard) || isNone(event.committedCard)) {
      const bothRefuse =
        isNone(option.committedCard) && isNone(event.committedCard);
      return bothRefuse;
    }

    // A card matches the offered card it names. An army holds no card twice
    // (§3.1.5), so the id alone says which card it is; whether the stats
    // agree is the next check.
    const sameCard = isSameCard(option.committedCard, event.committedCard);
    return sameCard;
  });

  // Nothing offered matches: the card is not in hand, names no stat this
  // moment accepts (§8.4), or the player is not the one being asked. The
  // reason names the moment, so a player can tell which commitment it was.
  if (legalOption === undefined) {
    const cardLabel = isNone(event.committedCard)
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
  // A refusal names no card, so it has nothing more to check.
  if (isActive(legalOption.committedCard) && isActive(event.committedCard)) {
    const sameCard = isSameCardValue(
      legalOption.committedCard,
      event.committedCard,
    );
    // A copy that differs from the card held in any part, such as one
    // claiming a stat the card does not name, is refused with the first part
    // that differs.
    if (!sameCard.result) {
      return sameCard;
    }
  }

  // The player asked has made a commitment the moment offers: a card in
  // hand, as it is, or a refusal.
  const valid: ValidationResult = { result: true };
  return valid;
}
