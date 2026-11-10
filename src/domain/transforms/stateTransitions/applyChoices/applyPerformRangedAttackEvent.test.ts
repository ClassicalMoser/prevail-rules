import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import {
  createPerformRangedAttackEvent,
  createEmptyGameState,
} from '@factories';
import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
} from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createUnitWithPlacement,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyPerformRangedAttackEvent } from './applyPerformRangedAttackEvent';

import { updateCurrentInitiative } from '@transforms/pureTransforms/state/updateCurrentInitiative';

/**
 * Aiming a shot (§4.3.11 steps 3–4): the target and supporters are written
 * into the shot `chooseShooter` opened, and the supporters' shots are
 * spent.
 */
describe('applyPerformRangedAttackEvent function', () => {
  /**
   * A Shoot order's shot, named and committed, waiting for its target: the
   * shooter has already left the order's units still to act, and refused to
   * commit, so nothing about the card is in play here.
   */
  function shotAwaitingTarget(
    step: 'firstPlayerResolveCommands' | 'secondPlayerResolveCommands',
    shooter: UnitInstance,
    remainingUnitsFirstPlayer: UnitInstance[],
    remainingUnitsSecondPlayer: UnitInstance[],
  ): GameState {
    // Black holds initiative, so black resolves first and white second.
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const shot = createRangedAttackResolutionState(state, {
      attackingCommitment: { commitmentType: 'declined' },
      attackingUnit: shooter,
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });
    const awaiting = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: shot,
        remainingUnitsFirstPlayer,
        remainingUnitsSecondPlayer,
        step,
      }),
    );
    return awaiting;
  }

  it('writes the target into the open shot, with no supporters, and leaves its commitments as they were', () => {
    // Black shoots from E-5 at a white unit; neither placement is judged here.
    const shooter = createUnitWithPlacement({
      coordinate: 'E-5',
      playerSide: 'black',
    });
    const target = createUnitWithPlacement({
      coordinate: 'E-7',
      facing: 'south',
      playerSide: 'white',
    });
    const state = shotAwaitingTarget(
      'firstPlayerResolveCommands',
      shooter.unit,
      [],
      [],
    );

    // Black aims at the white unit alone.
    const aimed = applyPerformRangedAttackEvent(
      createPerformRangedAttackEvent({
        eventNumber: 0,
        player: 'black',
        supportingUnits: [],
        targetUnit: target,
      }),
      state,
    );

    // The shot now knows its target, still waits on the target's
    // commitment, and keeps the shooter's refusal.
    const shot = getRangedAttackResolutionState(aimed);
    expect(shot.defendingUnit).toStrictEqual(target.unit);
    expect(shot.supportingUnits).toStrictEqual([]);
    expect(shot.attackingCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(shot.defendingCommitment).toStrictEqual({
      commitmentType: 'pending',
    });
  });

  it('a named supporter spends its shot: the shot records it and it no longer waits to act', () => {
    // Two more black units of the same order still wait to shoot; one
    // supports, the other does not.
    const shooter = createUnitWithPlacement({
      coordinate: 'E-5',
      playerSide: 'black',
    });
    const supporter = createUnitWithPlacement({
      coordinate: 'E-4',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const bystander = createUnitWithPlacement({
      coordinate: 'E-6',
      playerSide: 'black',
      unitOptions: { instanceNumber: 3 },
    });
    const target = createUnitWithPlacement({
      coordinate: 'C-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = shotAwaitingTarget(
      'firstPlayerResolveCommands',
      shooter.unit,
      [supporter.unit, bystander.unit],
      [],
    );

    // Black names one supporter (§7.3.4).
    const aimed = applyPerformRangedAttackEvent(
      createPerformRangedAttackEvent({
        eventNumber: 0,
        player: 'black',
        supportingUnits: [supporter],
        targetUnit: target,
      }),
      state,
    );

    // The supporter is in the shot; only the bystander is left to shoot.
    expect(getRangedAttackResolutionState(aimed).supportingUnits).toStrictEqual(
      [supporter.unit],
    );
    expect(
      getIssueCommandsPhaseState(aimed).remainingUnitsFirstPlayer,
    ).toStrictEqual([bystander.unit]);
  });
});
