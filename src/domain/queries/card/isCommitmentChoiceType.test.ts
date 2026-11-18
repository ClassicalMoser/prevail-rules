import { isCommitmentChoiceType } from './isCommitmentChoiceType';

describe('isCommitmentChoiceType function', () => {
  it('holds for each of the four moments a card may be committed', () => {
    // Before a move, by the shooter, by its target, and in a melee (§8.4).
    expect(isCommitmentChoiceType('commitToMovement')).toBe(true);
    expect(isCommitmentChoiceType('commitToRangedAttack')).toBe(true);
    expect(isCommitmentChoiceType('commitToRangedDefense')).toBe(true);
    expect(isCommitmentChoiceType('commitToMelee')).toBe(true);
  });

  it('fails for a choice that commits no card', () => {
    // Choosing the card to play is not a commitment: it is played, not discarded.
    expect(isCommitmentChoiceType('chooseCard')).toBe(false);
  });
});
