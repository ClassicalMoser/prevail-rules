import type { GameState } from '@game';
import type { MoveDelta } from '@entities';
import {
  createChooseRetreatOptionEvent,
  createEmptyGameState,
} from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createGameStateResolvingCommand,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  enemyBlockingStraightBack,
  legalRetreatsOf,
  placed,
  replaceBoard,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { isValidChooseRetreatOptionEvent } from './isValidChooseRetreatOptionEvent';

/**
 * Where several equally small retreats tie, the retreating unit's owner
 * chooses among them (§9.1.3), naming one by its path.
 *
 * White's unit on E-5, facing north, has been shot and must fall back. A
 * black unit on F-5, its back to White's, bars the straight step back and
 * leaves two equal ways round it: a 45° turn either way, then a step.
 */
describe('isValidChooseRetreatOptionEvent function', () => {
  // The two tied ways back the engine offers, each named by its moves.
  const optionA: MoveDelta[] = ['turnLeft', 'step'];
  const optionB: MoveDelta[] = ['turnRight', 'step'];

  /** The shot's retreat open on White's unit, its way back not yet chosen. */
  function stateWithRangedRetreat(): GameState {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    const blocker = enemyBlockingStraightBack(placement);
    const withUnits = replaceBoard(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, placement), blocker),
    );

    // The engine, not the spec, works out the tied retreats.
    const tiedPaths = legalRetreatsOf(placement, [blocker]);

    // White's unit is the target of the shot, and its retreat is open.
    const attackApply = createAttackApplyStateWithRetreat(unit, tiedPaths);
    const shot = createRangedAttackResolutionState(withUnits, {
      attackApplyState: attackApply,
      defendingUnit: unit,
    });
    const retreating = createGameStateResolvingCommand(shot, withUnits);
    return retreating;
  }

  it('accepts either of the tied retreats from the unit’s owner', () => {
    // The owner chooses among equally small retreats by where they end
    // (§9.1.3); either is theirs to pick.
    const state = stateWithRangedRetreat();
    const turningLeft = createChooseRetreatOptionEvent({
      path: optionA,
      player: 'white',
    });
    const turningRight = createChooseRetreatOptionEvent({
      path: optionB,
      player: 'white',
    });

    expect(isValidChooseRetreatOptionEvent(turningLeft, state)).toStrictEqual({
      result: true,
    });
    expect(isValidChooseRetreatOptionEvent(turningRight, state)).toStrictEqual({
      result: true,
    });
  });

  it('refuses a way back that is not one of the smallest retreats', () => {
    // An about-face is never part of a retreat (§9.1.4), so this path was not
    // offered.
    const event = createChooseRetreatOptionEvent({
      path: ['turnAbout', 'step'],
      player: 'white',
    });

    expect(
      isValidChooseRetreatOptionEvent(event, stateWithRangedRetreat()),
    ).toStrictEqual({
      errorReason: 'Retreat path turnAbout, step is not one offered to white',
      result: false,
    });
  });

  it('refuses a choice from the player whose unit is not retreating', () => {
    // Black shot White's unit, but the way back is White's to choose
    // (§9.1.3).
    const event = createChooseRetreatOptionEvent({
      path: optionB,
      player: 'black',
    });

    expect(
      isValidChooseRetreatOptionEvent(event, stateWithRangedRetreat()),
    ).toStrictEqual({
      errorReason: 'Retreat path turnRight, step is not one offered to black',
      result: false,
    });
  });

  it('throws when no retreat awaits a choice, which the expected check rules out first', () => {
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseRetreatOptionEvent({
      path: optionA,
      player: 'white',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidChooseRetreatOptionEvent(event, state)).toThrow(
      'No retreat is awaiting its owner’s choice of destination',
    );
  });
});
