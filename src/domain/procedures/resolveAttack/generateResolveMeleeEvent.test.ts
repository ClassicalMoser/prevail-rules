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
import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { generateResolveMeleeEvent } from './generateResolveMeleeEvent';

import { createEmptyGameState } from '@factories';
/** Phalanx spearmen: with default test `inPlay` (+1 attack), strike stays below retreat. */
const spearmenType = getUnitByTrait('formation', 'phalanx');
/** Cavalry mirror match. */
const cavalryType = getUnitByTrait('cavalry');

/**
 * `resolveMelee` compares strike vs retreat at a shared cell and sets rout/retreat
 * booleans. Commitments must be resolved first; the board must hold both combatants
 * at the melee coordinate. The event carries only those results; where a
 * retreat may go is worked out when that retreat opens.
 */
describe('generateResolveMeleeEvent function', () => {
  /** Default spearmen mirror match on E-5 with empty resolve-melee phase (no pending commitments). */
  function meleeResolutionGameState(): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const whiteUnit = createTestUnit('white', { unitType: cavalryType });
    const blackUnit = createTestUnit('black', { unitType: cavalryType });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackWp = placed(blackUnit, 'E-5', 'south');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };
    const phase = createResolveMeleePhaseState(s);
    const full = updatePhaseState(s, phase);
    const event = generateResolveMeleeEvent(full);
    expect(event.whiteUnitRetreated).toBe(true);
    expect(event.blackUnitRetreated).toBe(true);
  });

  describe('a Defence card committed to the melee (§8.5)', () => {
    /**
     * Two cavalry units engaged on E-5 (Attack 4; Retreat 3, Reverse 5,
     * Rout 7). Black, the first player, commits a card for +1 Attack, so its
     * blow on white is 5. White commits a card naming `whiteCommits`.
     */
    function cavalryMelee(whiteCommits: ('attack' | 'defense')[]): GameState {
      const state = updateCurrentInitiative(
        createEmptyGameState('standard'),
        'black',
      );
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
          card: createTestCard({ modifiers: whiteCommits }),
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
      const event = generateResolveMeleeEvent(cavalryMelee(['attack']));

      expect(event.whiteUnitReversed).toBe(true);
    });

    it("with it, the unit's thresholds rise by 1 and the same blow does not turn it", () => {
      // White's Reverse is 6 for this fight, above black's blow of 5. Its
      // Retreat of 4 is still reached.
      const event = generateResolveMeleeEvent(cavalryMelee(['defense']));

      expect(event.whiteUnitReversed).toBe(false);
      expect(event.whiteUnitRetreated).toBe(true);
    });

    it("does nothing to the enemy's thresholds", () => {
      // White's card names Attack and Defence: its blow on black is 5, and
      // black's Reverse stays 5, so black turns. Had the Defence reached
      // black, its Reverse would be 6 and the blow would fall short.
      const event = generateResolveMeleeEvent(
        cavalryMelee(['attack', 'defense']),
      );

      expect(event.blackUnitReversed).toBe(true);
      // The same card still raises white's own Reverse to 6, above black's 5.
      expect(event.whiteUnitReversed).toBe(false);
    });
  });

  describe('a friend beside the fighter (§7.3.1)', () => {
    /**
     * Two cavalry units engaged on E-5 (Attack 4; Retreat 3, Reverse 5,
     * Rout 7). Black, facing south, may have a cavalry friend on E-6, to its
     * east, facing west and so looking straight at it.
     */
    function cavalryMeleeWithFriend(friend: boolean): GameState {
      const state = updateCurrentInitiative(
        createEmptyGameState('standard'),
        'black',
      );
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
      let board = addUnitToBoard(
        addUnitToBoard(state.boardState, whiteWp),
        blackWp,
      );
      if (friend) {
        board = addUnitToBoard(
          board,
          placed(
            createTestUnit('black', {
              instanceNumber: 2,
              unitType: cavalryType,
            }),
            'E-6',
            'west',
          ),
        );
      }
      const s = { ...state, boardState: board };
      const melee = createMeleeResolutionState(s, {
        firstPlayerCommitment: { commitmentType: 'declined' },
        secondPlayerCommitment: { commitmentType: 'declined' },
      });
      return updatePhaseState(
        s,
        createResolveMeleePhaseState(s, { currentMeleeResolutionState: melee }),
      );
    }

    it('without one, a blow of 4 does not turn the enemy', () => {
      const event = generateResolveMeleeEvent(cavalryMeleeWithFriend(false));

      expect(event.whiteUnitReversed).toBe(false);
    });

    it('a friend looking straight at the fighter adds 2, so the same blow turns the enemy', () => {
      // 4 + 2 = 6 meets white's Reverse of 5.
      const event = generateResolveMeleeEvent(cavalryMeleeWithFriend(true));

      expect(event.whiteUnitReversed).toBe(true);
    });
  });

  it('given spearmen mirror and in-play +1 attack still under retreat 5, no rout/retreat', () => {
    const full = meleeResolutionGameState();
    const event = generateResolveMeleeEvent(full);
    expect(event.effectType).toBe('resolveMelee');
    expect(event.location).toBe('E-5');
    expect(event.whiteUnitWithPlacement.unit.playerSide).toBe('white');
    expect(event.blackUnitWithPlacement.unit.playerSide).toBe('black');
    expect(event.whiteUnitRetreated).toBe(false);
    expect(event.blackUnitRetreated).toBe(false);
  });

  it('given melee CRS with a second player commitment pending, throws that guard', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
    expect(() => generateResolveMeleeEvent(full)).toThrow(
      'Second player commitment is still pending',
    );
  });

  it('given playCards phase, throws not in resolveMelee', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveMeleeEvent(full)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('given only white on E-5 in resolveMelee phase, throws units not found on board', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
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
