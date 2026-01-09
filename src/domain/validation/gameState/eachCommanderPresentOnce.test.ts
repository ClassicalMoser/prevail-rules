import type { FailValidationResult, PlayerSide } from '@entities';
import { createBoardWithCommander, createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { eachCommanderPresentOnce } from './eachCommanderPresentOnce';

describe('eachCommanderPresentOnce', () => {
  describe('valid cases', () => {
    it('should return true when both commanders are present on the board', () => {
      const gameState = createEmptyGameState();
      let board = createBoardWithCommander('black', 'E-5');
      board = createBoardWithCommander('white', 'E-6', board);

      const { result } = eachCommanderPresentOnce({
        ...gameState,
        boardState: board,
      });
      expect(result).toBe(true);
    });

    it('should return true when both commanders are in lostCommanders', () => {
      const gameState = createEmptyGameState();
      const lostCommanders = new Set<PlayerSide>(['black', 'white']);

      const { result } = eachCommanderPresentOnce({
        ...gameState,
        lostCommanders,
      });
      expect(result).toBe(true);
    });

    it('should return true when one commander is on board and one is lost', () => {
      const gameState = createEmptyGameState();
      const board = createBoardWithCommander('black', 'E-5');
      const lostCommanders = new Set<PlayerSide>(['white']);

      const { result } = eachCommanderPresentOnce({
        ...gameState,
        boardState: board,
        lostCommanders,
      });
      expect(result).toBe(true);
    });

    it('should return true when both commanders are on the same space', () => {
      const gameState = createEmptyGameState();
      const board = createEmptyGameState().boardState;
      board.board['E-5'] = {
        ...board.board['E-5'],
        commanders: new Set<PlayerSide>(['black', 'white']),
      };

      const { result } = eachCommanderPresentOnce({
        ...gameState,
        boardState: board,
      });
      expect(result).toBe(true);
    });
  });

  describe('duplicate commanders', () => {
    it.each(['black', 'white'] as const)(
      'should return false when %s commander appears twice on the board',
      (commander) => {
        const gameState = createEmptyGameState();
        let board = createBoardWithCommander(commander, 'E-5');
        board = createBoardWithCommander(commander, 'E-6', board);

        const { result } = eachCommanderPresentOnce({
          ...gameState,
          boardState: board,
        });
        expect(result).toBe(false);
      },
    );

    it.each(['black', 'white'] as const)(
      'should return false when %s commander appears on board and in lostCommanders',
      (commander) => {
        const gameState = createEmptyGameState();
        const board = createBoardWithCommander(commander, 'E-5');
        const lostCommanders = new Set<PlayerSide>([commander]);

        const { result } = eachCommanderPresentOnce({
          ...gameState,
          boardState: board,
          lostCommanders,
        });
        expect(result).toBe(false);
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

        const { result } = eachCommanderPresentOnce({
          ...gameState,
          boardState: board,
        });
        expect(result).toBe(false);
      },
    );

    it('should return false when both commanders are missing', () => {
      const gameState = createEmptyGameState();

      const { result } = eachCommanderPresentOnce(gameState);
      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return false when an error occurs during validation', () => {
      const gameState = createEmptyGameState();
      const board = createEmptyGameState().boardState;
      delete (board.board as any)['E-5'];

      const validationResult = eachCommanderPresentOnce({
        ...gameState,
        boardState: board,
      }) as FailValidationResult;
      expect(validationResult.result).toEqual(false);
      expect(validationResult.errorReason.length).toBeGreaterThan(0);
    });
  });
});
