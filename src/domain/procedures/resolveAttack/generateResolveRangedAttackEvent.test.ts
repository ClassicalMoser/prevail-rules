import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import { tempUnits } from '@sampleValues';
import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveRangedAttackEvent } from './generateResolveRangedAttackEvent';

/** Spearmen (retreat 5): default test `inPlay` card (+1 attack) keeps total strike below retreat. */
const spearmenType = tempUnits[1]!;

describe('generateResolveRangedAttackEvent', () => {
  function rangedResolutionGameState(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { unitType: spearmenType });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackingUnit: createTestUnit('black', { unitType: spearmenType }),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  it('computes legal retreat options when defender is eligible to retreat', () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { unitType: tempUnits[4] }); // Balloons: retreat 0
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackingUnit: createTestUnit('black', { unitType: tempUnits[3] }), // Cavalry attack 4
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    const event = generateResolveRangedAttackEvent(full);
    expect(event.retreated).toBe(true);
    expect(event.legalRetreatOptions).toBeInstanceOf(Set);
  });

  it('returns resolveRangedAttack with defender placement, flags, and empty retreat set when strike is below retreat', () => {
    const full = rangedResolutionGameState();
    const event = generateResolveRangedAttackEvent(full);
    expect(event.effectType).toBe('resolveRangedAttack');
    expect(event.defenderWithPlacement.unit.playerSide).toBe('white');
    expect(event.defenderWithPlacement.placement.coordinate).toBe('E-5');
    expect(typeof event.routed).toBe('boolean');
    expect(typeof event.retreated).toBe('boolean');
    expect(typeof event.reversed).toBe('boolean');
    expect(event.retreated).toBe(false);
    expect(event.legalRetreatOptions).toBeInstanceOf(Set);
    expect(event.legalRetreatOptions.size).toBe(0);
  });

  it('throws when defending commitment is still pending', () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      defendingCommitment: { commitmentType: 'pending' },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Defending commitment is still pending',
    );
  });

  it('throws when attacking commitment is still pending', () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackingCommitment: { commitmentType: 'pending' },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Attacking commitment is still pending',
    );
  });

  it('throws when attack apply state already exists', () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackApplyState: createAttackApplyState(defendingUnit),
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Attack apply state already exists',
    );
  });
});
