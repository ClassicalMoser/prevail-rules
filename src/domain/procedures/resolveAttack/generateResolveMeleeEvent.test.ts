import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import { equites, punicCitizenSpearmen } from '@sampleValues';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateResolveMeleeEvent } from './generateResolveMeleeEvent';

import { createEmptyGameState } from '@factories';
/** Citizen spearmen (retreat 6, attack 3): with default test `inPlay` (+1 attack), strike stays below retreat. */
const spearmenType = punicCitizenSpearmen;

/**
 * `resolveMelee` compares strike vs retreat at a shared cell and sets rout/retreat
 * booleans. Commitments must be resolved first; the board must hold both combatants
 * at the melee coordinate.
 * TODO(misleading): legal retreat hex sets are no longer precomputed on this event.
 */
describe('generateResolveMeleeEvent function', () => {
  /** Default spearmen mirror match on E-5 with empty resolve-melee phase (no pending commitments). */
  function meleeResolutionGameState(): GameState {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { unitType: spearmenType });
    const blackUnit = createTestUnit('black', { unitType: spearmenType });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackWp = placed(blackUnit, 'E-5', 'south');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const phase = createResolveMeleePhaseState(s);
    return updatePhaseState(s, phase);
  }

  it('given cavalry vs cavalry on E-5, both retreated true', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { unitType: equites });
    const blackUnit = createTestUnit('black', { unitType: equites });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackWp = placed(blackUnit, 'E-5', 'south');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const phase = createResolveMeleePhaseState(s);
    const full = updatePhaseState(s, phase);
    const event = generateResolveMeleeEvent(full, 0);
    expect(event.whiteUnitRetreated).toBe(true);
    expect(event.blackUnitRetreated).toBe(true);
  });

  it('given spearmen mirror and in-play +1 attack still under retreat 5, no rout/retreat', () => {
    const full = meleeResolutionGameState();
    const event = generateResolveMeleeEvent(full, 0);
    expect(event.effectType).toBe('resolveMelee');
    expect(event.location).toBe('E-5');
    expect(event.whiteUnitWithPlacement.unit.playerSide).toBe('white');
    expect(event.blackUnitWithPlacement.unit.playerSide).toBe('black');
    expect(event.whiteUnitRetreated).toBe(false);
    expect(event.blackUnitRetreated).toBe(false);
  });

  it('given melee CRS with a second player commitment pending, throws that guard', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackWp = placed(blackUnit, 'E-5', 'south');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const melee = createMeleeResolutionState(s, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);
    expect(() => generateResolveMeleeEvent(full, 0)).toThrow(
      'Second player commitment is still pending',
    );
  });

  it('given playCards phase, throws not in resolveMelee', () => {
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveMeleeEvent(full, 0)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('given only white on E-5 in resolveMelee phase, throws units not found on board', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const s = {
      ...state,
      boardState: addUnitToBoard(state.boardState, whiteWp),
    };
    const phase = createResolveMeleePhaseState(s);
    const full = updatePhaseState(s, phase);
    expect(() => generateResolveMeleeEvent(full, 0)).toThrow(
      'Units not found on board',
    );
  });
});
