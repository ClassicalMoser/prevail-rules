import type { MoveDelta } from '@entities';
import {
  createPlayCardsPhaseState,
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  enemyBlockingStraightBack,
  legalRetreatsOf,
  placed,
  replaceBoard,
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
   * White's unit on E-5 facing north, with a black unit on F-5, its back to
   * white's, barring the straight step back and leaving two equal ways round
   * it (§9.1.3). Answers the board, the retreating unit, and its tied paths.
   */
  function whiteBarredFromStepBack() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    const blocker = enemyBlockingStraightBack(placement);
    const withUnit = replaceBoard(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, placement), blocker),
    );
    const tiedPaths = legalRetreatsOf(placement, [blocker]);
    const barred = { placement, tiedPaths, withUnit };
    return barred;
  }

  /**
   * A shot has driven white's unit back from E-5, and it has two equally
   * small retreats; `chosenRetreatPath` is its choice, if made.
   */
  function stateWithRangedRetreatOptions(
    chosenRetreatPath: MoveDelta[] | 'pending' = 'pending',
  ) {
    // A black unit on F-5, its back to white's, bars the straight step back
    // and leaves two equal ways round it (§9.1.3).
    const { placement, tiedPaths, withUnit } = whiteBarredFromStepBack();
    const attackApply = createAttackApplyStateWithRetreat(
      placement.unit,
      tiedPaths,
      {
        retreatState: createRetreatState(placement.unit, tiedPaths, {
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
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    expect(() => getLegalChooseRetreatOptionEvents(state)).toThrow(
      'No retreat is awaiting its owner’s choice of destination',
    );
  });

  it('returns one event per option for a front-engagement nested retreat', () => {
    // A black unit on F-5, its back to white's, bars the straight step back
    // and leaves two equal ways round it (§9.1.3).
    const { placement, tiedPaths, withUnit } = whiteBarredFromStepBack();
    const engagementState = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        currentCommandResolutionState: createMovementResolutionState(withUnit, {
          engagementState: createFrontEngagementState({
            defendingUnitRetreats: true,
            retreatState: createRetreatState(placement.unit, tiedPaths),
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
