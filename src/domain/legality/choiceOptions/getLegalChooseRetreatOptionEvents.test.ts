import type { UnitPlacement, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { getLegalChooseRetreatOptionEvents } from './getLegalChooseRetreatOptionEvents';

/**
 * GetLegalChooseRetreatOptionEvents: full ChooseRetreatOptionEvent payloads from
 * an active retreat substep's legalRetreatOptions.
 */
describe(getLegalChooseRetreatOptionEvents, () => {
  const optionA: UnitPlacement = {
    coordinate: 'E-4',
    facing: 'north',
  };
  const optionB: UnitPlacement = {
    coordinate: 'E-6',
    facing: 'north',
  };

  function stateWithRangedRetreatOptions(
    options: readonly UnitPlacement[] = [optionA, optionB],
    finalPosition: UnitPlacement | 'pending' = 'pending',
  ) {
    const state = createEmptyGameState();
    const unit = createTestUnit('white');
    const placement: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit,
    };
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const attackApply = createAttackApplyStateWithRetreat(placement, {
      retreatState: createRetreatState(placement, {
        finalPosition,
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
        retreatOption: optionA,
      },
      {
        choiceType: 'chooseRetreatOption',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        retreatOption: optionB,
      },
    ]);
  });

  it('returns empty when finalPosition is already set', () => {
    const state = stateWithRangedRetreatOptions([optionA, optionB], optionA);
    expect(getLegalChooseRetreatOptionEvents(state)).toStrictEqual([]);
  });

  it('returns empty when not in a retreat-choice context', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalChooseRetreatOptionEvents(state)).toStrictEqual([]);
  });

  it('returns one event per option for a front-engagement nested retreat', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('white');
    const placement: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit,
    };
    const withUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const engagementState = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        currentCommandResolutionState: createMovementResolutionState(
          withUnit,
          {
            engagementState: createFrontEngagementState({
              defendingUnitRetreats: true,
              retreatState: createRetreatState(placement, {
                finalPosition: 'pending',
                legalRetreatOptions: [optionA, optionB],
              }),
            }),
          },
        ),
      }),
    );

    expect(getLegalChooseRetreatOptionEvents(engagementState)).toStrictEqual([
      {
        choiceType: 'chooseRetreatOption',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        retreatOption: optionA,
      },
      {
        choiceType: 'chooseRetreatOption',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
        retreatOption: optionB,
      },
    ]);
  });
});
