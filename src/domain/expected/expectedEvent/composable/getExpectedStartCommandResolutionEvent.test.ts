import type { CommandCard } from '@entities';
import { createEmptyGameState } from '@factories';
import { createTestCard, createTestCommand } from '@testing';
import { updatePlayerCardState } from '@transforms';

import { getExpectedStartCommandResolutionEvent } from './getExpectedStartCommandResolutionEvent';

/**
 * GetExpectedStartCommandResolutionEvent: first command-resolution choice from active card command type.
 */
describe('getExpectedStartCommandResolutionEvent function', () => {
  // A new game: nobody has played a card yet.
  const empty = createEmptyGameState('standard');

  it('a Move order starts by asking which unit moves next', () => {
    // Black's card in play gives a Move; the stand-in card's command is one.
    const state = updatePlayerCardState(empty, 'black', {
      ...empty.cardState.black,
      inPlay: createTestCard(),
    });

    // The mover is named first; its commitment and move follow (§4.3.10).
    expect(
      getExpectedStartCommandResolutionEvent(state, 'black'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: 'black',
    });
  });

  it('a Shoot order starts by asking which unit shoots next', () => {
    // White's card in play gives a Shoot.
    const shootCard: CommandCard = {
      ...createTestCard(),
      command: createTestCommand({ type: 'rangedAttack' }),
    };
    const state = updatePlayerCardState(empty, 'white', {
      ...empty.cardState.white,
      inPlay: shootCard,
    });

    // The shooter is named first; its commitment and target follow (§4.3.11).
    expect(
      getExpectedStartCommandResolutionEvent(state, 'white'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseShooter',
      playerSource: 'white',
    });
  });

  it('throws for a player with no card in play, since there is no order to carry out', () => {
    // Black has played no card, so asking is a fault in the caller.
    expect(() =>
      getExpectedStartCommandResolutionEvent(empty, 'black'),
    ).toThrow('black has no card in play');
  });

  it('refuses a command that is neither a Move nor a Shoot, by name', () => {
    // A forged card whose command type is outside the two the rules know.
    const forgedCard: CommandCard = {
      ...createTestCard(),
      // Intentional invalid command type, which the type forbids, to reach the refusal.
      command: createTestCommand({ type: 'invalidCommandType' as never }),
    };
    const state = updatePlayerCardState(empty, 'black', {
      ...empty.cardState.black,
      inPlay: forgedCard,
    });

    expect(() =>
      getExpectedStartCommandResolutionEvent(state, 'black'),
    ).toThrow('Invalid command type: invalidCommandType');
  });
});
