import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRout,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRoutOwingDiscard } from './findRoutOwingDiscard';

describe('findRoutOwingDiscard function', () => {
  it('passes over a rout already paid for to the side that still owes', () => {
    // A melee routs both units at once and resolves them one side at a time.
    // The settled rout stays on its apply, so the question has to be asked of
    // each side rather than answered by the first rout in sight.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const paid = createAttackApplyStateWithRout(whiteUnit, {
      completed: true,
      routState: createRoutState('white', whiteUnit, {
        cardsChosen: true,
        completed: true,
        numberToDiscard: 1,
      }),
    });
    const owed = createRoutState('black', blackUnit, { numberToDiscard: 2 });
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyStateWithRout(blackUnit, {
        routState: owed,
      }),
      firstPlayerAttackApplyState: paid,
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(findRoutOwingDiscard(state)).toBe(owed);
  });

  it('answers undefined while the penalty is still unknown', () => {
    // `resolveRout` has not run, so there is no count to discard against yet.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit('white', { attack: 2 });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRout(unit, {
        routState: createRoutState('white', unit),
      }),
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(findRoutOwingDiscard(state)).toBeUndefined();
  });

  it('answers undefined when nobody is routing', () => {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(findRoutOwingDiscard(state)).toBeUndefined();
  });
});
