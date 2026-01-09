import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';
import { createBoardWithCommander, createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getLegalCommanderMoves } from './getLegalCommanderMoves';

describe('getLegalCommanderMoves', () => {
  it('should return all moves on an empty board', () => {
    const playerSide = 'white';
    const startingCoordinate = 'E-5';
    const gameState = createEmptyGameState();
    gameState.boardState = createBoardWithCommander(
      playerSide,
      startingCoordinate,
    );
    const legalMoves = getLegalCommanderMoves(
      playerSide,
      gameState,
      startingCoordinate,
    );
    const squareLength = COMMANDER_MOVE_DISTANCE * 2 + 1;
    expect(legalMoves.size).toEqual(squareLength * squareLength);
  });
  it('should throw if no commander is at the starting position', () => {
    const playerSide = 'white';
    const startingCoordinate = 'E-5';
    const gameState = createEmptyGameState();
    expect(() =>
      getLegalCommanderMoves(playerSide, gameState, startingCoordinate),
    ).toThrow('Starting position does not contain specified commander');
  });
  it('should throw if the wrong commander is at the starting position', () => {
    const playerSide = 'white';
    const startingCoordinate = 'E-5';
    const gameState = createEmptyGameState();
    gameState.boardState = createBoardWithCommander(
      'black',
      startingCoordinate,
    );
    expect(() =>
      getLegalCommanderMoves(playerSide, gameState, startingCoordinate),
    ).toThrow('Starting position does not contain specified commander');
  });
});
