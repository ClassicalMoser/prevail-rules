import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  getUnitByTrait,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateResolveMeleeEvent } from './generateResolveMeleeEvent';

import { createEmptyGameState } from '@factories';
/** Phalanx spearmen: with default test `inPlay` (+1 attack), strike stays below retreat. */
const spearmenType = getUnitByTrait('formation', 'phalanx');
/** Cavalry mirror match. */
const cavalryType = getUnitByTrait('cavalry');

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
    const whiteUnit = createTestUnit('white', { unitType: cavalryType });
    const blackUnit = createTestUnit('black', { unitType: cavalryType });
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

  describe('a Defence card committed to the melee (§8.5)', () => {
    /**
     * Two cavalry units engaged on E-5 (Attack 4; Retreat 3, Reverse 5,
     * Rout 7). Black, the first player, commits a card for +1 Attack, so its
     * blow on white is 5. White commits a card naming `whiteCommits`.
     */
    function cavalryMelee(whiteCommits: 'attack' | 'defense'): GameState {
      const state = createEmptyGameState('standard');
      const whiteWp = placed(
        createTestUnit('white', { unitType: cavalryType }),
        'E-5',
        'north',
      );
      const blackWp = placed(
        createTestUnit('black', { unitType: cavalryType }),
        'E-5',
        'south',
      );
      const board = addUnitToBoard(
        addUnitToBoard(state.boardState, whiteWp),
        blackWp,
      );
      const s = { ...state, boardState: board };
      const melee = createMeleeResolutionState(s, {
        firstPlayerCommitment: {
          card: createTestCard({ modifiers: ['attack'] }),
          commitmentType: 'completed',
        },
        secondPlayerCommitment: {
          card: createTestCard({ modifiers: [whiteCommits] }),
          commitmentType: 'completed',
        },
      });
      return updatePhaseState(
        s,
        createResolveMeleePhaseState(s, { currentMeleeResolutionState: melee }),
      );
    }

    it("without it, a blow that reaches the unit's Reverse turns it", () => {
      // Black's blow of 5 meets white's Reverse of 5.
      const event = generateResolveMeleeEvent(cavalryMelee('attack'), 0);

      expect(event.whiteUnitReversed).toBe(true);
    });

    it("with it, the unit's thresholds rise by 1 and the same blow does not turn it", () => {
      // White's Reverse is 6 for this fight, above black's blow of 5. Its
      // Retreat of 4 is still reached.
      const event = generateResolveMeleeEvent(cavalryMelee('defense'), 0);

      expect(event.whiteUnitReversed).toBe(false);
      expect(event.whiteUnitRetreated).toBe(true);
    });

    it("does nothing to the enemy's thresholds", () => {
      // White's Defence card adds nothing to its own blow: 4 against black's
      // Reverse of 5 does not turn black, and black's thresholds are its own.
      const event = generateResolveMeleeEvent(cavalryMelee('defense'), 0);

      expect(event.blackUnitReversed).toBe(false);
      expect(event.blackUnitRetreated).toBe(true);
    });
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
