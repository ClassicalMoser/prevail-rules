import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@entities';
import { tempUnits } from '@sampleValues';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveMeleeEvent } from './generateResolveMeleeEvent';

/** Spearmen (retreat 5): with default test `inPlay` command card (+1 attack), total strike stays below retreat. */
const spearmenType = tempUnits[1]!;

/**
 * `resolveMelee` compares strike vs retreat at a shared cell, sets rout/retreat booleans, and
 * precomputes legal retreat hex sets when retreat is allowed. Commitments must be resolved
 * first; the board must hold both combatants at the melee coordinate.
 */
describe('generateResolveMeleeEvent', () => {
  /** Default spearmen mirror match on E-5 with empty resolve-melee phase (no pending commitments). */
  function meleeResolutionGameState(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const whiteUnit = createTestUnit('white', { unitType: spearmenType });
    const blackUnit = createTestUnit('black', { unitType: spearmenType });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const phase = createResolveMeleePhaseState(s);
    return updatePhaseState(s, phase);
  }

  it('given cavalry vs cavalry on E-5, both retreated true and each gets a non-empty legal set', () => {
    const state = createEmptyGameState();
    const whiteUnit = createTestUnit('white', { unitType: tempUnits[3] }); // Cavalry: attack 4, retreat 4
    const blackUnit = createTestUnit('black', { unitType: tempUnits[3] });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const phase = createResolveMeleePhaseState(s);
    const full = updatePhaseState(s, phase);
    const event = generateResolveMeleeEvent(full);
    expect(event.whiteUnitRetreated).toBe(true);
    expect(event.blackUnitRetreated).toBe(true);
    expect(event.whiteLegalRetreatOptions).toBeInstanceOf(Set);
    expect(event.blackLegalRetreatOptions).toBeInstanceOf(Set);
  });

  it('given spearmen mirror and in-play +1 attack still under retreat 5, no rout/retreat and empty sets', () => {
    const full = meleeResolutionGameState();
    const event = generateResolveMeleeEvent(full);
    expect(event.effectType).toBe('resolveMelee');
    expect(event.location).toBe('E-5');
    expect(event.whiteUnitWithPlacement.unit.playerSide).toBe('white');
    expect(event.blackUnitWithPlacement.unit.playerSide).toBe('black');
    expect(typeof event.whiteUnitRouted).toBe('boolean');
    expect(typeof event.blackUnitRouted).toBe('boolean');
    expect(event.whiteUnitRetreated).toBe(false);
    expect(event.blackUnitRetreated).toBe(false);
    expect(event.whiteLegalRetreatOptions).toBeInstanceOf(Set);
    expect(event.blackLegalRetreatOptions).toBeInstanceOf(Set);
    expect(event.whiteLegalRetreatOptions.size).toBe(0);
    expect(event.blackLegalRetreatOptions.size).toBe(0);
  });

  it('given melee CRS with white commitment pending, throws white commitment guard', () => {
    const state = createEmptyGameState();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const melee = createMeleeResolutionState(s, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);
    expect(() => generateResolveMeleeEvent(full)).toThrow(
      'White commitment is still pending',
    );
  });

  it('given playCards phase, throws not in resolveMelee', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveMeleeEvent(full)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('given only white on E-5 in resolveMelee phase, throws units not found on board', () => {
    const state = createEmptyGameState();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const s = {
      ...state,
      boardState: addUnitToBoard(state.boardState, whiteWp),
    };
    const phase = createResolveMeleePhaseState(s);
    const full = updatePhaseState(s, phase);
    expect(() => generateResolveMeleeEvent(full)).toThrow(
      'Units not found on board',
    );
  });
});
