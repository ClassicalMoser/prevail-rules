import { createEmptyGameState, createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedStartCommandResolutionEvent } from './getExpectedStartCommandResolutionEvent';

describe('getExpectedStartCommandResolutionEvent', () => {
  it('should ask the player to move a unit for a movement card', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();

    expect(getExpectedStartCommandResolutionEvent(state, 'black')).toEqual({
      actionType: 'playerChoice',
      playerSource: 'black',
      choiceType: 'moveUnit',
    });
  });

  it('should ask the player to perform a ranged attack for a ranged attack card', () => {
    const state = createEmptyGameState();
    state.cardState.white.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: 'rangedAttack',
      },
    };

    expect(getExpectedStartCommandResolutionEvent(state, 'white')).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'performRangedAttack',
    });
  });

  it('should throw when the player has no active card', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = null;

    expect(() =>
      getExpectedStartCommandResolutionEvent(state, 'black'),
    ).toThrow('black player has no active card');
  });

  it('should throw when the command type is invalid', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: 'invalidCommandType' as never, // Intentional invalid command type for error coverage.
      },
    };

    expect(() =>
      getExpectedStartCommandResolutionEvent(state, 'black'),
    ).toThrow('Invalid command type: invalidCommandType');
  });
});
