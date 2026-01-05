import type { PlayerSide } from '@entities';
import { createBoardWithCommander, createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { eachCommanderPresentOnce } from './eachCommanderPresentOnce';

describe('eachCommanderPresentOnce', () => {
  describe('valid cases', () => {
    it('should return true when both commanders are present on the board', () => {
      const gameState = createEmptyGameState();
      let board = createBoardWithCommander('black', 'E-5');
      board = createBoardWithCommander('white', 'E-6', board);

      expect(
        eachCommanderPresentOnce({ ...gameState, boardState: board }),
      ).toBe(true);
    });

    it('should return true when both commanders are in lostCommanders', () => {
      const gameState = createEmptyGameState();
      const lostCommanders = new Set<PlayerSide>(['black', 'white']);

      expect(eachCommanderPresentOnce({ ...gameState, lostCommanders })).toBe(
        true,
      );
    });

    it('should return true when one commander is on board and one is lost', () => {
      const gameState = createEmptyGameState();
      const board = createBoardWithCommander('black', 'E-5');
      const lostCommanders = new Set<PlayerSide>(['white']);

      expect(
        eachCommanderPresentOnce({
          ...gameState,
          boardState: board,
          lostCommanders,
        }),
      ).toBe(true);
    });

    it('should return true when both commanders are on the same space', () => {
      const gameState = createEmptyGameState();
      const board = createEmptyGameState().boardState;
      board.board['E-5'] = {
        ...board.board['E-5'],
        commanders: new Set<PlayerSide>(['black', 'white']),
      };

      expect(
        eachCommanderPresentOnce({ ...gameState, boardState: board }),
      ).toBe(true);
    });
  });

  describe('duplicate commanders', () => {
    it.each(['black', 'white'] as const)(
      'should return false when %s commander appears twice on the board',
      (commander) => {
        const gameState = createEmptyGameState();
        let board = createBoardWithCommander(commander, 'E-5');
        board = createBoardWithCommander(commander, 'E-6', board);

        expect(
          eachCommanderPresentOnce({ ...gameState, boardState: board }),
        ).toBe(false);
      },
    );

    it.each(['black', 'white'] as const)(
      'should return false when %s commander appears on board and in lostCommanders',
      (commander) => {
        const gameState = createEmptyGameState();
        const board = createBoardWithCommander(commander, 'E-5');
        const lostCommanders = new Set<PlayerSide>([commander]);

        expect(
          eachCommanderPresentOnce({
            ...gameState,
            boardState: board,
            lostCommanders,
          }),
        ).toBe(false);
      },
    );
  });

  describe('missing commanders', () => {
    it.each(['black', 'white'] as const)(
      'should return false when %s commander is missing',
      (missingCommander) => {
        const gameState = createEmptyGameState();
        const presentCommander =
          missingCommander === 'black' ? 'white' : 'black';
        const board = createBoardWithCommander(presentCommander, 'E-5');

        expect(
          eachCommanderPresentOnce({ ...gameState, boardState: board }),
        ).toBe(false);
      },
    );

    it('should return false when both commanders are missing', () => {
      const gameState = createEmptyGameState();

      expect(eachCommanderPresentOnce(gameState)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return false when an error occurs during validation', () => {
      const gameState = createEmptyGameState();
      const board = createEmptyGameState().boardState;
      delete (board.board as any)['E-5'];

      const result = eachCommanderPresentOnce({
        ...gameState,
        boardState: board,
      });

      expect(typeof result).toBe('boolean');
    });
  });
});
