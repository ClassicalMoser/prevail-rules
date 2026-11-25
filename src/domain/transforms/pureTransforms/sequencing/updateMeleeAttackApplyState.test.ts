import { createEmptyGameState } from '@factories';
import { getMeleeResolutionState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createTestUnit,
} from '@testing';

import { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';

/**
 * Both units in a melee strike at once, and each takes its own results
 * (§7.2.1). The two slots are named for whose unit takes the blow: the first
 * player's, holding the initiative, or the second's.
 */
describe('updateMeleeAttackApplyState function', () => {
  const blackUnit = createTestUnit('black', { attack: 2 });
  const whiteUnit = createTestUnit('white', { attack: 2 });

  // Black holds the initiative, and both blows have landed with nothing due.
  const onBlack = createAttackApplyStateWithNothingDue(blackUnit);
  const onWhite = createAttackApplyStateWithNothingDue(whiteUnit);
  const fighting = createGameStateResolvingMelee(
    createMeleeResolutionState(createEmptyGameState('standard'), {
      attackOnFirstPlayerApplyState: onBlack,
      attackOnSecondPlayerApplyState: onWhite,
    }),
    'black',
  );

  it('writes the first player’s unit’s results to the first slot', () => {
    const done = createAttackApplyStateWithNothingDue(blackUnit, {
      completed: true,
    });

    const melee = getMeleeResolutionState(
      updateMeleeAttackApplyState(fighting, 'black', done),
    );

    // Black holds the initiative, so its unit's results are the first; the
    // white unit's are untouched.
    expect(melee.attackOnFirstPlayerApplyState).toBe(done);
    expect(melee.attackOnSecondPlayerApplyState).toBe(onWhite);
  });

  it('writes the second player’s unit’s results to the second slot', () => {
    const done = createAttackApplyStateWithNothingDue(whiteUnit, {
      completed: true,
    });

    const melee = getMeleeResolutionState(
      updateMeleeAttackApplyState(fighting, 'white', done),
    );

    // White is the second player, so its unit's results are the second; the
    // black unit's are untouched.
    expect(melee.attackOnSecondPlayerApplyState).toBe(done);
    expect(melee.attackOnFirstPlayerApplyState).toBe(onBlack);
  });
});
