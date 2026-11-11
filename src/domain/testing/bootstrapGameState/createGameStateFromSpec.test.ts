import { findPlayerUnitWithPosition } from '@queries';
import { createBoard, createGameState } from './createGameStateFromSpec';

/**
 * CreateGameState: Creates a game state with units placed according to the provided specifications.
 */
describe('createGameState function', () => {
  it('given defaults, creates a game state with units using tuple syntax', () => {
    const gameState = createGameState([
      ['E-5', 'black'],
      ['E-6', 'white'],
    ]);
    expect(gameState.boardState.boardType).toBe('standard');
    const blackUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const whiteUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    expect(blackUnit).toBeDefined();
    expect(whiteUnit).toBeDefined();
    expect(blackUnit?.unit.playerSide).toBe('black');
    expect(whiteUnit?.unit.playerSide).toBe('white');
  });

  it('given defaults, creates a game state with units using tuple syntax with facing', () => {
    const gameState = createGameState([
      ['E-5', 'black', 'north'],
      ['E-6', 'white', 'south'],
    ]);
    const blackUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const whiteUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    expect(blackUnit?.placement.facing).toBe('north');
    expect(whiteUnit?.placement.facing).toBe('south');
  });

  it('given defaults, creates a game state with units using object syntax', () => {
    const gameState = createGameState([
      { coord: 'E-5', player: 'black' },
      { coord: 'E-6', facing: 'east', player: 'white' },
    ]);
    const blackUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const whiteUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    expect(blackUnit?.placement.facing).toBe('north');
    expect(whiteUnit?.placement.facing).toBe('east');
  });

  it('given defaults, creates a game state with full control syntax', () => {
    const gameState = createGameState([
      { attack: 3, coord: 'E-5', flexibility: 1, player: 'black' },
      { attack: 4, coord: 'E-6', player: 'white' },
    ]);
    const blackUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const whiteUnit = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    expect(blackUnit).toBeDefined();
    expect(whiteUnit).toBeDefined();
  });

  it('given assign sequential instance numbers automatically', () => {
    const gameState = createGameState([
      ['E-5', 'black'],
      ['E-6', 'black'],
      ['E-7', 'black'],
    ]);
    const unit1 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const unit2 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'black',
    );
    const unit3 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-7',
      'black',
    );
    expect(unit1?.unit.instanceNumber).toBe(1);
    expect(unit2?.unit.instanceNumber).toBe(2);
    expect(unit3?.unit.instanceNumber).toBe(3);
  });

  it('given respect custom instance numbers when provided', () => {
    const gameState = createGameState([
      { coord: 'E-5', instanceNumber: 5, player: 'black' },
      { coord: 'E-6', instanceNumber: 10, player: 'black' },
    ]);
    const unit1 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const unit2 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'black',
    );
    expect(unit1?.unit.instanceNumber).toBe(5);
    expect(unit2?.unit.instanceNumber).toBe(10);
  });

  it('given allow explicit instance numbers to repeat', () => {
    const gameState = createGameState([
      { coord: 'E-5', instanceNumber: 1, player: 'black' },
      { coord: 'E-6', instanceNumber: 1, player: 'white' },
    ]);
    const unit1 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const unit2 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    expect(unit1?.unit.instanceNumber).toBe(1);
    expect(unit2?.unit.instanceNumber).toBe(1);
  });

  it('given continue auto-assigning after explicit numbers', () => {
    const gameState = createGameState([
      ['E-5', 'black'],
      { coord: 'E-6', instanceNumber: 12, player: 'white' },
      ['E-7', 'black'],
      ['E-8', 'white'],
    ]);
    const unit1 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const unit2 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    const unit3 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-7',
      'black',
    );
    const unit4 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-8',
      'white',
    );
    expect(unit1?.unit.instanceNumber).toBe(1);
    expect(unit2?.unit.instanceNumber).toBe(12);
    expect(unit3?.unit.instanceNumber).toBe(2);
    // White numbers its own units: its auto-numbered one is its first, since
    // the explicit 12 was given by hand and is not counted.
    expect(unit4?.unit.instanceNumber).toBe(1);
  });

  it('given accept custom initiative', () => {
    const gameState = createGameState([], { currentInitiative: 'white' });
    expect(gameState.currentInitiative).toBe('white');
  });

  it('given no units provided, creates an empty game state', () => {
    const gameState = createGameState([]);
    expect(gameState.boardState.boardType).toBe('standard');
    expect(gameState.currentInitiative).toBe('black');
  });

  it('given support mixing tuple and object syntax', () => {
    const gameState = createGameState([
      ['E-5', 'black'],
      { coord: 'E-6', facing: 'east', player: 'white' },
      ['E-7', 'black', 'south'],
    ]);
    const unit1 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-5',
      'black',
    );
    const unit2 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-6',
      'white',
    );
    const unit3 = findPlayerUnitWithPosition(
      gameState.boardState,
      'E-7',
      'black',
    );
    expect(unit1?.placement.facing).toBe('north');
    expect(unit2?.placement.facing).toBe('east');
    expect(unit3?.placement.facing).toBe('south');
  });
});

describe('createBoard function', () => {
  it('given defaults, creates a board with units using tuple syntax', () => {
    const board = createBoard([
      ['E-5', 'black'],
      ['E-6', 'white'],
    ]);
    expect(board.boardType).toBe('standard');
    const blackUnit = findPlayerUnitWithPosition(board, 'E-5', 'black');
    const whiteUnit = findPlayerUnitWithPosition(board, 'E-6', 'white');
    expect(blackUnit).toBeDefined();
    expect(whiteUnit).toBeDefined();
  });

  it('given defaults, creates a board with units using object syntax', () => {
    const board = createBoard([
      { attack: 3, coord: 'E-5', player: 'black' },
      { coord: 'E-6', flexibility: 2, player: 'white' },
    ]);
    const blackUnit = findPlayerUnitWithPosition(board, 'E-5', 'black');
    const whiteUnit = findPlayerUnitWithPosition(board, 'E-6', 'white');
    expect(blackUnit).toBeDefined();
    expect(whiteUnit).toBeDefined();
  });

  it('given no units provided, creates an empty board', () => {
    const board = createBoard([]);
    expect(board.boardType).toBe('standard');
  });
});
