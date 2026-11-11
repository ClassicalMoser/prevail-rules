import type { PerformRangedAttackEvent } from '@events';
import type { Commitment } from '@game';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
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
 * that independently can hit that defender. The shooter is the one its
 * `chooseShooter` named, and its committed card counts toward its Range;
 * supporters are judged at their own.
 */
describe('isValidPerformRangedAttackEvent function', () => {
  /** In-play command must be rangedAttack for performRangedAttack to be expected. */
  const rangedCard = {
    ...createTestCard(),
    command: createTestCommand({ type: 'rangedAttack' }),
  };

  /**
   * Black's Shoot order with its shooter already named, so the shot waits
   * for its target: the shooter has left the order's units still to act,
   * and its commitment is the one given (refused unless a case says
   * otherwise).
   */
  function shotAwaitingTarget(
    shooter: ReturnType<typeof createUnitWithPlacement>,
    stillToAct: ReturnType<typeof createUnitWithPlacement>[],
    board: ReturnType<typeof createUnitWithPlacement>[],
    attackingCommitment?: Commitment,
  ) {
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
    });
    for (const unit of board) {
      state = updateBoardState(state, addUnitToBoard(state.boardState, unit));
    }
    const shot = createRangedAttackResolutionState(state, {
      // Refused unless the case commits a card.
      attackingCommitment: attackingCommitment ?? {
        commitmentType: 'declined',
      },
      attackingUnit: shooter.unit,
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: shot,
        remainingUnitsFirstPlayer: stillToAct.map((u) => u.unit),
        step: 'firstPlayerResolveCommands',
      }),
    );
  }

  function event(
    partial: Omit<PerformRangedAttackEvent, 'choiceType' | 'eventType'>,
  ): PerformRangedAttackEvent {
    // Every case in this file is the first event of the round.
    return createPerformRangedAttackEvent({
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
    const state = shotAwaitingTarget(attacker, [], [attacker, defender]);

    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [],
          targetUnit: defender,
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
    const state = shotAwaitingTarget(
      attacker,
      [supporter],
      [attacker, supporter, defender],
    );

    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [supporter],
          targetUnit: defender,
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
    const state = shotAwaitingTarget(
      attacker,
      [facingAway],
      [attacker, facingAway, defender],
    );

    const result = isValidPerformRangedAttackEvent(
      event({
        player: 'black',
        supportingUnits: [facingAway],
        targetUnit: defender,
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
    const state = shotAwaitingTarget(
      attacker,
      [supporter],
      [attacker, supporter, defender],
    );

    // The same supporter listed twice, to claim +2 for one shot.
    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [supporter, supporter],
          targetUnit: defender,
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
    const state = shotAwaitingTarget(attacker, [], [attacker, defender]);

    // The attacker names itself as a supporter, to add +1 to its own shot.
    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [attacker],
          targetUnit: defender,
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
    const state = shotAwaitingTarget(attacker, [], [attacker, defender]);

    const result = isValidPerformRangedAttackEvent(
      event({
        player: 'black',
        supportingUnits: [],
        targetUnit: defender,
      }),
      state,
    );
    expect(result.result).toBe(false);
  });

  it('accepts a target one space beyond the shooter’s Range when its committed card names Range', () => {
    // A Range-2 shooter, and a target three ranks out.
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'B-5',
      facing: 'south',
      playerSide: 'white',
    });
    // Black committed a Range card before aiming (§4.3.11 step 2).
    const state = shotAwaitingTarget(attacker, [], [attacker, defender], {
      card: createTestCard({ modifiers: ['range'] }),
      commitmentType: 'completed',
    });

    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [],
          targetUnit: defender,
        }),
        state,
      ),
    ).toStrictEqual({ result: true });
  });

  it('the shooter’s Range card does not stretch a supporter’s arc', () => {
    // Two Range-2 units of the order, side by side, and a target three
    // ranks ahead of the shooter.
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
      coordinate: 'B-5',
      facing: 'south',
      playerSide: 'white',
    });
    // The shooter's Range card reaches B-5 for the shooter alone (§8.4.1).
    const state = shotAwaitingTarget(
      attacker,
      [supporter],
      [attacker, supporter, defender],
      {
        card: createTestCard({ modifiers: ['range'] }),
        commitmentType: 'completed',
      },
    );

    expect(
      isValidPerformRangedAttackEvent(
        event({
          player: 'black',
          supportingUnits: [supporter],
          targetUnit: defender,
        }),
        state,
      ),
    ).toStrictEqual({
      errorReason:
        'Supporting unit cannot independently ranged-attack the target',
      result: false,
    });
  });
});
