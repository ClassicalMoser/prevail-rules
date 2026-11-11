import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getAttackApplyStateOfPlayer } from './getAttackApplyStateOfPlayer';

/** An attack that reached none of the defender's thresholds. */
const nothingReached = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: false,
};

/**
 * A caller that knows whose unit it is about, and not what kind of attack is
 * being resolved, asks for that player's apply.
 */
describe('getAttackApplyStateOfPlayer function', () => {
  it('reads the one apply of a ranged attack, whoever is asked about', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, nothingReached);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          {
            attackApplyState: apply,
            defendingUnit: target,
          },
        ),
      }),
    );

    expect(getAttackApplyStateOfPlayer(state, 'white')).toBe(apply);
  });

  it('reads the apply on a player’s own side of a melee', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const white = createTestUnit('white', { attack: 2 });
    const black = createTestUnit('black', { attack: 2 });
    const whiteApply = createAttackApplyState(white, nothingReached);
    const blackApply = createAttackApplyState(black, nothingReached);
    // Black holds the initiative here, so black's apply is the first.
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          firstPlayerAttackApplyState: blackApply,
          secondPlayerAttackApplyState: whiteApply,
        }),
      }),
    );

    expect(getAttackApplyStateOfPlayer(state, 'black')).toBe(blackApply);
    expect(getAttackApplyStateOfPlayer(state, 'white')).toBe(whiteApply);
  });

  it('throws where no attack is being resolved', () => {
    expect(() =>
      getAttackApplyStateOfPlayer(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        'white',
      ),
    ).toThrow('No current phase state found');
  });
});
