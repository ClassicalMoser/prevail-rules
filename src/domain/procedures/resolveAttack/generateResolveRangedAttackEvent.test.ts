import type { GameState } from '@game';
import {
  createAttackApplyState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  getUnitByStatValue,
  getUnitByTrait,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateResolveRangedAttackEvent } from './generateResolveRangedAttackEvent';

import { createEmptyGameState } from '@factories';
/** Phalanx spearmen: default `inPlay` (+1 attack) keeps strike below retreat. */
const spearmenType = getUnitByTrait('formation', 'phalanx');
/** Low retreat so a cavalry strike forces the defender back. */
const lowRetreatType = getUnitByStatValue('retreat', 1);
/** Cavalry attacker for that low-retreat case. */
const cavalryType = getUnitByTrait('cavalry');

/**
 * `resolveRangedAttack` is the first ranged strike roll: attacker/defender commitments must be
 * settled, and there must be no attack-apply substep yet. Outcome exposes rout/retreat/reverse
 * flags; where a retreat may go is worked out when that retreat opens.
 */
describe('generateResolveRangedAttackEvent function', () => {
  /** Spearmen duel on E-5 under issueCommands ranged CRS; default commitments resolved. */
  function rangedResolutionGameState(): GameState {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { unitType: spearmenType });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackingUnit: createTestUnit('black', { unitType: spearmenType }),
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  it('given low-retreat defender vs cavalry attacker, retreated true with legal set', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { unitType: lowRetreatType });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackingUnit: createTestUnit('black', { unitType: cavalryType }),
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    const event = generateResolveRangedAttackEvent(full);
    expect(event.retreated).toBe(true);
  });

  it('given spearmen mirror below retreat threshold, retreated is false', () => {
    const full = rangedResolutionGameState();
    const event = generateResolveRangedAttackEvent(full);
    expect(event.effectType).toBe('resolveRangedAttack');
    expect(event.defenderWithPlacement.unit.playerSide).toBe('white');
    expect(event.defenderWithPlacement.placement.coordinate).toBe('E-5');
    expect(event.retreated).toBe(false);
  });

  it('given defending commitment pending on ranged CRS, throws defending commitment guard', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Defending commitment is still pending',
    );
  });

  it('given attacking commitment pending on ranged CRS, throws attacking commitment guard', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackingCommitment: { commitmentType: 'pending' },
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Attacking commitment is still pending',
    );
  });

  it('given ranged CRS already holding attackApplyState, throws attack apply already exists', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: createAttackApplyState(defendingUnit),
      defendingUnit,
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
