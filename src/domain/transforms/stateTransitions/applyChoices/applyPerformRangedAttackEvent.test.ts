import type { GameState, StandardBoard, UnitInstance } from '@entities';
import type { PerformRangedAttackEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
} from '@queries';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { isSameUnitInstance } from '@validation';
import { describe, expect, it } from 'vitest';
import { applyPerformRangedAttackEvent } from './applyPerformRangedAttackEvent';

describe('applyPerformRangedAttackEvent', () => {
  function createStateInResolveStep(
    step: 'firstPlayerResolveCommands' | 'secondPlayerResolveCommands',
    remainingUnitsFirstPlayer: Set<UnitInstance>,
    remainingUnitsSecondPlayer: Set<UnitInstance>,
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        step,
        remainingUnitsFirstPlayer,
        remainingUnitsSecondPlayer,
      }),
    );
  }

  it('creates ranged attack resolution state with pending commitments and removes attacker from remaining units', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const defender = createUnitWithPlacement({
      coordinate: 'E-7',
      facing: 'south',
      playerSide: 'white',
    });
    const state = createStateInResolveStep(
      'firstPlayerResolveCommands',
      new Set([attacker.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'performRangedAttack',
      player: 'black',
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const ranged = getRangedAttackResolutionState(newState);

    expect(ranged.commandResolutionType).toBe('rangedAttack');
    expect(isSameUnitInstance(ranged.attackingUnit, attacker.unit).result).toBe(
      true,
    );
    expect(isSameUnitInstance(ranged.defendingUnit, defender.unit).result).toBe(
      true,
    );
    expect(ranged.attackingCommitment).toEqual({ commitmentType: 'pending' });
    expect(ranged.defendingCommitment).toEqual({ commitmentType: 'pending' });
    expect(ranged.supportingUnits.size).toBe(0);

    const remainingFirst = phaseState.remainingUnitsFirstPlayer;
    expect(remainingFirst.size).toBe(0);
    expect(
      [...remainingFirst].some(
        (u) => isSameUnitInstance(u, attacker.unit).result,
      ),
    ).toBe(false);
  });

  it('keeps other attacker-side units in remaining when they are not attacking or supporting', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const otherUnit = createUnitWithPlacement({
      coordinate: 'D-4',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'E-7',
      facing: 'south',
      playerSide: 'white',
    });
    const state = createStateInResolveStep(
      'firstPlayerResolveCommands',
      new Set([attacker.unit, otherUnit.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'performRangedAttack',
      player: 'black',
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const remainingFirst = phaseState.remainingUnitsFirstPlayer;

    expect(remainingFirst.size).toBe(1);
    expect(
      [...remainingFirst].some(
        (u) => isSameUnitInstance(u, otherUnit.unit).result,
      ),
    ).toBe(true);
    expect(
      [...remainingFirst].some(
        (u) => isSameUnitInstance(u, attacker.unit).result,
      ),
    ).toBe(false);
  });

  it('removes defending unit from other player remaining units', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const defender = createUnitWithPlacement({
      coordinate: 'E-7',
      facing: 'south',
      playerSide: 'white',
    });
    const state = createStateInResolveStep(
      'firstPlayerResolveCommands',
      new Set([attacker.unit]),
      new Set([defender.unit]),
    );

    const event: PerformRangedAttackEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'performRangedAttack',
      player: 'black',
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);

    expect(phaseState.remainingUnitsSecondPlayer.size).toBe(0);
    expect(
      [...phaseState.remainingUnitsSecondPlayer].some(
        (u) => isSameUnitInstance(u, defender.unit).result,
      ),
    ).toBe(false);
  });

  it('removes supporting units from remaining units when present', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const supporter = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'E-7',
      facing: 'south',
      playerSide: 'white',
    });
    const state = createStateInResolveStep(
      'firstPlayerResolveCommands',
      new Set([attacker.unit, supporter.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'performRangedAttack',
      player: 'black',
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set([supporter]),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const ranged = getRangedAttackResolutionState(newState);

    expect(ranged.supportingUnits.size).toBe(1);
    expect(
      [...ranged.supportingUnits].some(
        (u) => isSameUnitInstance(u, supporter.unit).result,
      ),
    ).toBe(true);
    expect(phaseState.remainingUnitsFirstPlayer.size).toBe(0);
  });

  it('removes each supporting unit when multiple supporters', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const supporter1 = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    const supporter2 = createUnitWithPlacement({
      coordinate: 'F-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 3 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'E-7',
      facing: 'south',
      playerSide: 'white',
    });
    const state = createStateInResolveStep(
      'firstPlayerResolveCommands',
      new Set([attacker.unit, supporter1.unit, supporter2.unit]),
      new Set(),
    );

    const event: PerformRangedAttackEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'performRangedAttack',
      player: 'black',
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set([supporter1, supporter2]),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);
    const ranged = getRangedAttackResolutionState(newState);

    expect(ranged.supportingUnits.size).toBe(2);
    expect(phaseState.remainingUnitsFirstPlayer.size).toBe(0);
    expect(
      [...phaseState.remainingUnitsFirstPlayer].some(
        (u) => isSameUnitInstance(u, supporter1.unit).result,
      ),
    ).toBe(false);
    expect(
      [...phaseState.remainingUnitsFirstPlayer].some(
        (u) => isSameUnitInstance(u, supporter2.unit).result,
      ),
    ).toBe(false);
  });

  it('updates second player remaining units when attacker is second player', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'south',
      playerSide: 'white',
    });
    const defender = createUnitWithPlacement({
      coordinate: 'E-4',
      facing: 'north',
      playerSide: 'black',
    });
    const state = createStateInResolveStep(
      'secondPlayerResolveCommands',
      new Set(),
      new Set([attacker.unit]),
      'black',
    );

    const event: PerformRangedAttackEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'performRangedAttack',
      player: 'white',
      unit: attacker,
      targetUnit: defender,
      supportingUnits: new Set(),
    };

    const newState = applyPerformRangedAttackEvent(event, state);
    const phaseState = getIssueCommandsPhaseState(newState);

    expect(phaseState.remainingUnitsSecondPlayer.size).toBe(0);
    expect(
      getRangedAttackResolutionState(newState).attackingUnit,
    ).toBeDefined();
  });
});
