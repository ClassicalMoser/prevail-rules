import { createTestCard } from '@testing';

import { getExpectedStartCommandResolutionEvent } from './getExpectedStartCommandResolutionEvent';

import { createEmptyGameState } from '@factories';
/**
 * GetExpectedStartCommandResolutionEvent: first command-resolution choice from active card command type.
 */
describe('getExpectedStartCommandResolutionEvent function', () => {
  it('a Move order starts by asking which unit moves next', () => {
    const state = createEmptyGameState('standard');
    // CreateTestCard() defaults command.type to 'movement'
    state.cardState.black.inPlay = createTestCard();

    expect(
      getExpectedStartCommandResolutionEvent(state, 'black'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: 'black',
    });
  });

  it('a Shoot order starts by asking which unit shoots next', () => {
    const state = createEmptyGameState('standard');
    state.cardState.white.inPlay = {
      ...createTestCard(),
      command: {
        ...createTestCard().command,
        type: 'rangedAttack',
      },
    };

    expect(
      getExpectedStartCommandResolutionEvent(state, 'white'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseShooter',
      playerSource: 'white',
    });
  });

  it('given when the player has no active card, throws', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = null;

    expect(() =>
      getExpectedStartCommandResolutionEvent(state, 'black'),
    ).toThrow('black has no card in play');
  });

  it('given when the command type is invalid, throws', () => {
    const state = createEmptyGameState('standard');
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
