import { createEmptyGameState } from '@factories';
import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';
import { createGameState } from '@testing';
import { deployCommander } from '@transforms';

import { exploreCommanderMoves } from './exploreCommanderMoves';

/**
 * ExploreCommanderMoves: BFS reachable commander coordinates within move distance with blocking rules.
 *
 * A commander goes up to its distance any way it likes, diagonals counting as
 * one (§4.2.2, §4.2.3). It may pass over and stop on its own units, but not
 * enter a space holding an enemy (§4.2.4) or cross a diagonal two enemies
 * block (§4.2.5), and it may always stay where it is (§4.2.6). Every case
 * walks the standard board.
 */
describe('exploreCommanderMoves function', () => {
  describe('core functionality', () => {
    it('reaches every space within four steps on an open field', () => {
      // White's commander stands alone at E-5, well clear of every edge.
      const gameState = deployCommander(
        createEmptyGameState('standard'),
        'white',
        'E-5',
      );

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // A diagonal step counts as one, so four steps reach a square nine
      // spaces on a side, its own space among them: 81.
      expect(legalMoves.size).toBe(81);
    });

    it('stops at the board edge', () => {
      // E-2 is one space in from the west edge.
      const gameState = deployCommander(
        createEmptyGameState('standard'),
        'white',
        'E-2',
      );

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-2',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // Nine rows, A to I, but only columns 1 to 6: 54.
      expect(legalMoves.size).toBe(54);
    });

    it('stops at both edges in a corner', () => {
      // A-1 is the corner itself.
      const gameState = deployCommander(
        createEmptyGameState('standard'),
        'white',
        'A-1',
      );

      const legalMoves = exploreCommanderMoves(
        'white',
        'A-1',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // Rows A to E and columns 1 to 5: 25.
      expect(legalMoves.size).toBe(25);
    });

    it('lets a commander hemmed in by enemies stay where it stands', () => {
      // Black units stand on all eight spaces around White's commander.
      const units = createGameState([
        ['D-4', 'black'],
        ['D-5', 'black'],
        ['D-6', 'black'],
        ['E-4', 'black'],
        ['E-6', 'black'],
        ['F-4', 'black'],
        ['F-5', 'black'],
        ['F-6', 'black'],
      ]);
      const gameState = deployCommander(units, 'white', 'E-5');

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // Every step out is closed, and staying put is still a move (§4.2.6).
      expect([...legalMoves]).toStrictEqual(['E-5']);
    });
  });

  describe('obstacle handling', () => {
    it('does not enter a space holding an enemy, but may go round it', () => {
      // A Black unit stands one step north of White's commander, toward
      // row A.
      const units = createGameState([['D-5', 'black']]);
      const gameState = deployCommander(units, 'white', 'E-5');

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // The enemy's space is closed (§4.2.4).
      expect(legalMoves.has('D-5')).toBe(false);
      // The space beyond it is two steps round, not one through.
      expect(legalMoves.has('C-5')).toBe(true);
    });

    it('does not enter an engaged space, even one holding its own unit', () => {
      // White and Black are engaged at D-5, beside White's commander.
      const units = createGameState([
        ['D-5', 'white', 'north'],
        ['D-5', 'black', 'south'],
      ]);
      const gameState = deployCommander(units, 'white', 'E-5');

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // The enemy in that space closes it, friend or no (§2.2.3, §4.2.4).
      expect(legalMoves.has('D-5')).toBe(false);
    });

    it('passes over and stops on its own units', () => {
      // A White unit stands on every space north of the commander, D-5 to A-5.
      const units = createGameState([
        ['D-5', 'white'],
        ['C-5', 'white'],
        ['B-5', 'white'],
        ['A-5', 'white'],
      ]);
      const gameState = deployCommander(units, 'white', 'E-5');

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // It may end on a friend, and walk straight on through them (§4.2.4).
      expect(legalMoves.has('D-5')).toBe(true);
      expect(legalMoves.has('A-5')).toBe(true);
    });

    it('must walk round the end of an enemy line', () => {
      // A Black line holds column 6 from C to G, beside White's commander.
      const units = createGameState([
        ['C-6', 'black'],
        ['D-6', 'black'],
        ['E-6', 'black'],
        ['F-6', 'black'],
        ['G-6', 'black'],
      ]);
      const gameState = deployCommander(units, 'white', 'E-5');

      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        COMMANDER_MOVE_DISTANCE,
      );

      // E-7 is two steps straight across, but nothing passes through the line.
      expect(legalMoves.has('E-7')).toBe(false);
      // Round its northern end, by B-6, C-7 is just four steps away.
      expect(legalMoves.has('C-7')).toBe(true);
    });

    it('may not cross a diagonal two enemies block, but may cross one only one enemy flanks', () => {
      // Black units at D-5 and E-6 flank the diagonal from E-5 to D-6; E-6
      // alone flanks the one from E-5 to F-6, with F-5 open.
      const units = createGameState([
        ['D-5', 'black'],
        ['E-6', 'black'],
      ]);
      const gameState = deployCommander(units, 'white', 'E-5');

      // A single step, so each diagonal is the only way to its space.
      const legalMoves = exploreCommanderMoves('white', 'E-5', gameState, 1);

      // Enemies in both corner spaces block the diagonal (§2.4.4, §4.2.5).
      expect(legalMoves.has('D-6')).toBe(false);
      // One enemy does not.
      expect(legalMoves.has('F-6')).toBe(true);
    });

    it('crosses a diagonal its own units flank on both sides', () => {
      // White units at D-5 and E-6 flank the diagonal from E-5 to D-6.
      const units = createGameState([
        ['D-5', 'white'],
        ['E-6', 'white'],
      ]);
      const gameState = deployCommander(units, 'white', 'E-5');

      // A single step, so the diagonal is the only way to D-6.
      const legalMoves = exploreCommanderMoves('white', 'E-5', gameState, 1);

      // Only enemies block a diagonal for a commander; its own troops never
      // cut off its reach (§2.4.4).
      expect(legalMoves.has('D-6')).toBe(true);
    });
  });
});
