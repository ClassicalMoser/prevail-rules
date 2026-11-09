import { PLAY_CARDS_PHASE } from '@game';
import type { RetreatOption } from '@game';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { getLegalChooseRetreatOptionEvents } from './getLegalChooseRetreatOptionEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalChooseRetreatOptionEvents: full ChooseRetreatOptionEvent payloads from
 * an active retreat substep's legalRetreatOptions.
 */
describe('getLegalChooseRetreatOptionEvents function', () => {
  // Two tied ways back, each reached by its own path.
  const optionA: RetreatOption = {
    path: ['turnLeft', 'step'],
    placement: { coordinate: 'F-6', facing: 'northWest' },
  };
  const optionB: RetreatOption = {
    path: ['turnRight', 'step'],
    placement: { coordinate: 'F-4', facing: 'northEast' },
  };

  function stateWithRangedRetreatOptions(
    options: readonly RetreatOption[] = [optionA, optionB],
    chosenRetreat: RetreatOption | 'pending' = 'pending',
  ) {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const attackApply = createAttackApplyStateWithRetreat(placement, {
      retreatState: createRetreatState(placement, {
        chosenRetreat,
        legalRetreatOptions: [...options],
      }),
    });
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
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        path: optionA.path,
      },
      {
        choiceType: 'chooseRetreatOption',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        path: optionB.path,
      },
    ]);
  });

  it('returns empty when the retreat is already chosen', () => {
    const state = stateWithRangedRetreatOptions([optionA, optionB], optionA);
    expect(getLegalChooseRetreatOptionEvents(state)).toStrictEqual([]);
  });

  it('returns empty when not in a retreat-choice context', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalChooseRetreatOptionEvents(state)).toStrictEqual([]);
  });

  it('returns one event per option for a front-engagement nested retreat', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const engagementState = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        currentCommandResolutionState: createMovementResolutionState(withUnit, {
          engagementState: createFrontEngagementState({
            defendingUnitRetreats: true,
            retreatState: createRetreatState(placement, {
              chosenRetreat: 'pending',
              legalRetreatOptions: [optionA, optionB],
            }),
          }),
        }),
      }),
    );

    expect(getLegalChooseRetreatOptionEvents(engagementState)).toStrictEqual([
      {
        choiceType: 'chooseRetreatOption',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        path: optionA.path,
      },
      {
        choiceType: 'chooseRetreatOption',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        path: optionB.path,
      },
    ]);
  });
});
