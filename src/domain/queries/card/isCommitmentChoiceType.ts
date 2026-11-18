import type { CommitmentChoiceType, PlayerChoiceType } from '@events';
import { commitmentChoiceTypes } from '@events';

/**
 * Whether a choice is one of the four moments a card may be committed
 * (§8.4). All four are the same decision, a card from hand or none, so a
 * player can be offered them the same way whichever moment it is.
 *
 * @param choiceType - The choice asked for
 * @returns True when the choice is a commitment
 */
export function isCommitmentChoiceType(
  choiceType: PlayerChoiceType,
): choiceType is CommitmentChoiceType {
  // The four moments of the §8.4 table, before a move, in a shot and in a melee.
  const isCommitment = commitmentChoiceTypes.some(
    (commitmentChoiceType) => commitmentChoiceType === choiceType,
  );
  return isCommitment;
}
