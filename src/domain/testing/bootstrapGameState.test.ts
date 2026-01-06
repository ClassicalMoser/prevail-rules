import type { GameState, StandardBoard } from '@entities';
import { describe, expect, it } from 'vitest';
import { createBoard, createGameState } from './bootstrapGameState';
import { getPlayerUnitWithPosition } from '@queries/unitPresence';

describe('bootstrapGameState', () => {
  describe('createGameState', () => {
    it('should create a game state with units using tuple syntax', () => {
      const gameState = createGameState([
        ['E-5', 'black'],
        ['E-6', 'white'],
      ]);

      expect(gameState.boardState.boardType).toBe('standard');
      const blackUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const whiteUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );

      expect(blackUnit).toBeDefined();
      expect(whiteUnit).toBeDefined();
      expect(blackUnit?.unit.playerSide).toBe('black');
      expect(whiteUnit?.unit.playerSide).toBe('white');
    });

    it('should create a game state with units using tuple syntax with facing', () => {
      const gameState = createGameState([
        ['E-5', 'black', 'north'],
        ['E-6', 'white', 'south'],
      ]);

      const blackUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const whiteUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );

      expect(blackUnit?.placement.facing).toBe('north');
      expect(whiteUnit?.placement.facing).toBe('south');
    });

    it('should create a game state with units using object syntax', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black' },
        { coord: 'E-6', player: 'white', facing: 'east' },
      ]);

      const blackUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const whiteUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );

      expect(blackUnit?.placement.facing).toBe('north'); // default
      expect(whiteUnit?.placement.facing).toBe('east');
    });

    it('should create a game state with units using full control syntax', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', attack: 3, flexibility: 2 },
        { coord: 'E-6', player: 'white', attack: 4 },
      ]);

      const blackUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const whiteUnit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );

      expect(blackUnit).toBeDefined();
      expect(whiteUnit).toBeDefined();
    });

    it('should assign sequential instance numbers automatically', () => {
      const gameState = createGameState([
        ['E-5', 'black'],
        ['E-6', 'black'],
        ['E-7', 'black'],
      ]);

      const unit1 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const unit2 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'black',
      );
      const unit3 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-7',
        'black',
      );

      expect(unit1?.unit.instanceNumber).toBe(1);
      expect(unit2?.unit.instanceNumber).toBe(2);
      expect(unit3?.unit.instanceNumber).toBe(3);
    });

    it('should respect custom instance numbers when provided', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', instanceNumber: 5 },
        { coord: 'E-6', player: 'black', instanceNumber: 10 },
      ]);

      const unit1 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const unit2 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'black',
      );

      expect(unit1?.unit.instanceNumber).toBe(5);
      expect(unit2?.unit.instanceNumber).toBe(10);
    });

    it('should allow explicit instance numbers to repeat', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', instanceNumber: 1 },
        { coord: 'E-6', player: 'white', instanceNumber: 1 }, // Duplicate allowed
      ]);

      const unit1 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const unit2 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );

      expect(unit1?.unit.instanceNumber).toBe(1);
      expect(unit2?.unit.instanceNumber).toBe(1);
    });

    it('should continue auto-assigning sequential numbers when explicit numbers are used', () => {
      const gameState = createGameState([
        ['E-5', 'black'], // auto: 1
        { coord: 'E-6', player: 'white', instanceNumber: 99 }, // explicit: 99
        ['E-7', 'black'], // auto: 2 (continues from 1, doesn't skip to 100)
        ['E-8', 'white'], // auto: 3
      ]);

      const unit1 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const unit2 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );
      const unit3 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-7',
        'black',
      );
      const unit4 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-8',
        'white',
      );

      expect(unit1?.unit.instanceNumber).toBe(1);
      expect(unit2?.unit.instanceNumber).toBe(99);
      expect(unit3?.unit.instanceNumber).toBe(2);
      expect(unit4?.unit.instanceNumber).toBe(3);
    });

    it('should accept custom initiative', () => {
      const gameState = createGameState([], { currentInitiative: 'white' });

      expect(gameState.currentInitiative).toBe('white');
    });

    it('should create an empty game state when no units provided', () => {
      const gameState = createGameState([]);

      expect(gameState.boardState.boardType).toBe('standard');
      expect(gameState.currentInitiative).toBe('black');
    });
  });

  describe('createBoard', () => {
    it('should create a board with units using tuple syntax', () => {
      const board = createBoard([
        ['E-5', 'black'],
        ['E-6', 'white'],
      ]);

      expect(board.boardType).toBe('standard');
      const blackUnit = getPlayerUnitWithPosition(board, 'E-5', 'black');
      const whiteUnit = getPlayerUnitWithPosition(board, 'E-6', 'white');

      expect(blackUnit).toBeDefined();
      expect(whiteUnit).toBeDefined();
    });

    it('should create a board with units using object syntax', () => {
      const board = createBoard([
        { coord: 'E-5', player: 'black', attack: 3 },
        { coord: 'E-6', player: 'white', flexibility: 2 },
      ]);

      const blackUnit = getPlayerUnitWithPosition(board, 'E-5', 'black');
      const whiteUnit = getPlayerUnitWithPosition(board, 'E-6', 'white');

      expect(blackUnit).toBeDefined();
      expect(whiteUnit).toBeDefined();
    });

    it('should create an empty board when no units provided', () => {
      const board = createBoard([]);

      expect(board.boardType).toBe('standard');
    });
  });

  describe('mixed syntax support', () => {
    it('should support mixing tuple and object syntax', () => {
      const gameState = createGameState([
        ['E-5', 'black'],
        { coord: 'E-6', player: 'white', facing: 'east' },
        ['E-7', 'black', 'south'],
      ]);

      const unit1 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      const unit2 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-6',
        'white',
      );
      const unit3 = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-7',
        'black',
      );

      expect(unit1?.placement.facing).toBe('north');
      expect(unit2?.placement.facing).toBe('east');
      expect(unit3?.placement.facing).toBe('south');
    });
  });
});

