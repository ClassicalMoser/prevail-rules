import type { MoveDelta } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  placed,
  legalRetreatsOf,
  enemyBlockingStraightBack,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { getLegalChooseRetreatOptionEvents } from './getLegalChooseRetreatOptionEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalChooseRetreatOptionEvents: full ChooseRetreatOptionEvent payloads from
 * an active retreat substep's legalRetreatPaths.
 */
describe('getLegalChooseRetreatOptionEvents function', () => {
  // The two tied ways back the engine offers, each named by its moves.
  const optionA: MoveDelta[] = ['turnLeft', 'step'];
  const optionB: MoveDelta[] = ['turnRight', 'step'];

  /**
   * A shot has driven white's unit back from E-5, and it has two equally
   * small retreats; `chosenRetreatPath` is its choice, if made.
   */
  function stateWithRangedRetreatOptions(
    chosenRetreatPath: MoveDelta[] | 'pending' = 'pending',
  ) {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    // A black unit on F-5, its back to white's, bars the straight step back
    // and leaves two equal ways round it (§9.1.3).
    const blocker = enemyBlockingStraightBack(placement);
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(
        addUnitToBoard(state.boardState, placement),
        blocker,
      ),
    };
    const tiedPaths = legalRetreatsOf(placement, [blocker]);
    const attackApply = createAttackApplyStateWithRetreat(
      placement,
      tiedPaths,
      {
        retreatState: createRetreatState(placement, tiedPaths, {
          chosenRetreatPath,
        }),
      },
    );
    return updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          withUnit,
          { attackApplyState: attackApply },
        ),
      }),
    );
  }

  it('returns one event per legalRetreatOption for the retreating player', () => {
    const state = stateWithRangedRetreatOptions();
    const events = getLegalChooseRetreatOptionEvents(state);

    expect(events).toStrictEqual([
      {
        choiceType: 'chooseRetreatOption',
        eventType: 'playerChoice',
        player: 'white',
        path: optionA,
      },
      {
        choiceType: 'chooseRetreatOption',
        eventType: 'playerChoice',
        player: 'white',
        path: optionB,
      },
    ]);
  });

  it('throws when the retreat is already chosen, since no choice is owed', () => {
    const state = stateWithRangedRetreatOptions(optionA);
    expect(() => getLegalChooseRetreatOptionEvents(state)).toThrow(
      'No retreat is awaiting its owner’s choice of destination',
    );
  });

  it('throws when no retreat is under way, where nothing asks', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(() => getLegalChooseRetreatOptionEvents(state)).toThrow(
      'No retreat is awaiting its owner’s choice of destination',
    );
  });

  it('returns one event per option for a front-engagement nested retreat', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    // A black unit on F-5, its back to white's, bars the straight step back
    // and leaves two equal ways round it (§9.1.3).
    const blocker = enemyBlockingStraightBack(placement);
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(
        addUnitToBoard(state.boardState, placement),
        blocker,
      ),
    };
    const tiedPaths = legalRetreatsOf(placement, [blocker]);
    const engagementState = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        currentCommandResolutionState: createMovementResolutionState(withUnit, {
          engagementState: createFrontEngagementState({
            defendingUnitRetreats: true,
            retreatState: createRetreatState(placement, tiedPaths),
          }),
        }),
      }),
    );

    expect(getLegalChooseRetreatOptionEvents(engagementState)).toStrictEqual([
      {
        choiceType: 'chooseRetreatOption',
        eventType: 'playerChoice',
        player: 'white',
        path: optionA,
      },
      {
        choiceType: 'chooseRetreatOption',
        eventType: 'playerChoice',
        player: 'white',
        path: optionB,
      },
    ]);
  });
});
