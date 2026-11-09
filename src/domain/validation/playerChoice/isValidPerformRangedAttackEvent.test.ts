import type { PerformRangedAttackEvent } from '@events';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { isValidPerformRangedAttackEvent } from './isValidPerformRangedAttackEvent';

import {
  createEmptyGameState,
  createPerformRangedAttackEvent,
} from '@factories';
/**
 * IsValidPerformRangedAttackEvent: one attacker, one defender, supporters
 * that independently can hit that defender.
 */
describe('isValidPerformRangedAttackEvent function', () => {
  /** In-play command must be rangedAttack for performRangedAttack to be expected. */
  const rangedCard = {
    ...createTestCard(),
    command: createTestCommand({ type: 'rangedAttack' }),
  };

  function stateWithUnits(
    remaining: ReturnType<typeof createUnitWithPlacement>[],
    board: ReturnType<typeof createUnitWithPlacement>[],
  ) {
    let state = createEmptyGameState('standard');
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
    // Every case in this file is the first event of the round.
    return createPerformRangedAttackEvent({
      eventNumber: 0,
      ...partial,
    });
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

  it('a supporter can be named only once, since naming it spends its shot', () => {
    // An attacker and one supporter that can both hit the defender.
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

    // The same supporter listed twice, to claim +2 for one shot.
    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [supporter, supporter],
          targetUnit: defender,
          unit: attacker,
        }),
        state,
      ),
    ).toStrictEqual({
      errorReason: 'Duplicate supporting unit',
      result: false,
    });
  });

  it('the shooter cannot also support its own shot', () => {
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

    // The attacker names itself as a supporter, to add +1 to its own shot.
    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [attacker],
          targetUnit: defender,
          unit: attacker,
        }),
        state,
      ),
    ).toStrictEqual({
      errorReason: 'Attacker cannot also be listed as a supporter',
      result: false,
    });
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
