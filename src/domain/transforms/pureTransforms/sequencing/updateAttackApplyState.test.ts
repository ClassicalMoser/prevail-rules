import { createEmptyGameState } from '@factories';
import { getMeleeResolutionState, getRangedAttackApplyState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updateAttackApplyState } from './updateAttackApplyState';

/**
 * An attack's results are carried out on its target after a shot in Phase 3
 * or a melee in Phase 4 (§7.5). A shot is one way and has one target
 * (§7.4.4); in a melee both units take results, each on its own side
 * (§7.2.1).
 */
describe('updateAttackApplyState function', () => {
  const blackUnit = createTestUnit('black', { attack: 2 });
  const whiteUnit = createTestUnit('white', { attack: 2 });

  it('writes a shot’s results on its target', () => {
    // Black's skirmishers on C-5 have shot white's unit on E-5, and the blow
    // reached nothing.
    const board = createGameStateWithUnits([
      placed(blackUnit, 'C-5', 'south'),
      placed(whiteUnit, 'E-5', 'north'),
    ]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithNothingDue(whiteUnit),
      attackingUnit: blackUnit,
      defendingUnit: whiteUnit,
    });
    const shooting = createGameStateResolvingCommand(shot, board);

    // The results are carried out.
    const done = createAttackApplyStateWithNothingDue(whiteUnit, {
      completed: true,
    });
    const after = updateAttackApplyState(shooting, done);

    // The shot's one apply is the finished one.
    expect(getRangedAttackApplyState(after)).toBe(done);
  });

  it('in a melee, writes the results on the side of the unit that takes them', () => {
    // Black holds the initiative; both blows have landed with nothing due.
    const onBlack = createAttackApplyStateWithNothingDue(blackUnit);
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState: onBlack,
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      'black',
    );

    // The results on white's unit are carried out.
    const done = createAttackApplyStateWithNothingDue(whiteUnit, {
      completed: true,
    });
    const melee = getMeleeResolutionState(
      updateAttackApplyState(fighting, done),
    );

    // White's unit is the second player's, so its side is the second; black's
    // is untouched.
    expect(melee.attackOnSecondPlayerApplyState).toBe(done);
    expect(melee.attackOnFirstPlayerApplyState).toBe(onBlack);
  });

  it('throws when the shot has not yet been measured, since there are no results to write over', () => {
    // A shot whose blow is still to be worked out.
    const empty = createEmptyGameState('standard');
    const aiming = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, { attackApplyState: 'pending' }),
      empty,
    );

    expect(() =>
      updateAttackApplyState(
        aiming,
        createAttackApplyStateWithNothingDue(whiteUnit),
      ),
    ).toThrow('No attack apply state found in ranged attack resolution state');
  });

  it('throws in a phase where no attack is carried out', () => {
    const playingCards = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() =>
      updateAttackApplyState(
        playingCards,
        createAttackApplyStateWithNothingDue(whiteUnit),
      ),
    ).toThrow('Attack apply state update not expected in phase: playCards');
  });
});
