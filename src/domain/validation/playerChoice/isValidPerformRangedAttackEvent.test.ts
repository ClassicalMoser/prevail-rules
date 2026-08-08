import type { PerformRangedAttackEvent } from '@events';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { isValidPerformRangedAttackEvent } from './isValidPerformRangedAttackEvent';

/**
 * IsValidPerformRangedAttackEvent: one attacker, one defender, supporters
 * that independently can hit that defender.
 */
describe(isValidPerformRangedAttackEvent, () => {
  const rangedCard = tempCommandCards[15];

  function stateWithUnits(
    remaining: ReturnType<typeof createUnitWithPlacement>[],
    board: ReturnType<typeof createUnitWithPlacement>[],
  ) {
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
    });
    for (const unit of board) {
      state = updateBoardState(state, addUnitToBoard(state.boardState, unit));
    }
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: remaining.map((u) => u.unit),
        step: 'firstPlayerResolveCommands',
      }),
    );
  }

  function event(
    partial: Omit<
      PerformRangedAttackEvent,
      'choiceType' | 'eventType' | 'eventNumber'
    >,
  ): PerformRangedAttackEvent {
    return {
      choiceType: 'performRangedAttack',
      eventNumber: 0,
      eventType: 'playerChoice',
      ...partial,
    };
  }

  it('accepts a sole attacker vs a legal defender with no supporters', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = stateWithUnits([attacker], [attacker, defender]);

    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [],
          targetUnit: defender,
          unit: attacker,
        }),
        state,
      ),
    ).toStrictEqual({ result: true });
  });

  it('accepts a supporter that can also hit the target', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 1, range: 2 },
    });
    const supporter = createUnitWithPlacement({
      coordinate: 'E-4',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2, range: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = stateWithUnits(
      [attacker, supporter],
      [attacker, supporter, defender],
    );

    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [supporter],
          targetUnit: defender,
          unit: attacker,
        }),
        state,
      ),
    ).toStrictEqual({ result: true });
  });

  it('rejects a supporter that cannot hit the target', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 1, range: 2 },
    });
    const facingAway = createUnitWithPlacement({
      coordinate: 'E-4',
      facing: 'south',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2, range: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = stateWithUnits(
      [attacker, facingAway],
      [attacker, facingAway, defender],
    );

    const result = isValidPerformRangedAttackEvent(
      event({
        player: 'black',
        supportingUnits: [facingAway],
        targetUnit: defender,
        unit: attacker,
      }),
      state,
    );
    expect(result.result).toBe(false);
  });

  it('rejects an out-of-range target', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 1 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'C-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = stateWithUnits([attacker], [attacker, defender]);

    const result = isValidPerformRangedAttackEvent(
      event({
        player: 'black',
        supportingUnits: [],
        targetUnit: defender,
        unit: attacker,
      }),
      state,
    );
    expect(result.result).toBe(false);
  });
});
