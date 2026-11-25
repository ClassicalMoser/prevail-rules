import { createEmptyGameState } from '@factories';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { getExpectedPlayCardsPhaseEvent } from './getExpectedPlayCardsPhaseEvent';

/**
 * Phase 1 (§4.1): both players choose a card face down at the same time, the
 * two are revealed together, and the lower initiative takes the initiative.
 * Whoever has not yet chosen owes a card; the reveal, the initiative and the
 * end of the phase are effects the game owes.
 */
describe('getExpectedPlayCardsPhaseEvent function', () => {
  it('asks both players for a card at once while neither has chosen', () => {
    // Both are choosing, and no card waits face down.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );

    // The choices are simultaneous (§4.1.1): both owe one.
    expect(getExpectedPlayCardsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseCard',
      playerSource: 'bothPlayers',
    });
  });

  it('asks only White once Black has chosen', () => {
    // Black's card waits face down; White's does not.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = updatePlayerCardState(choosing, 'black', {
      ...choosing.cardState.black,
      awaitingPlay: createTestCard(),
    });

    // Only White still owes a card.
    expect(getExpectedPlayCardsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseCard',
      playerSource: 'white',
    });
  });

  it('asks only Black once White has chosen', () => {
    // White's card waits face down; Black's does not.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = updatePlayerCardState(choosing, 'white', {
      ...choosing.cardState.white,
      awaitingPlay: createTestCard(),
    });

    // Only Black still owes a card.
    expect(getExpectedPlayCardsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseCard',
      playerSource: 'black',
    });
  });

  it('reveals both cards together once both have chosen', () => {
    // Both cards wait face down, still on the choosing step.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const blackChosen = updatePlayerCardState(choosing, 'black', {
      ...choosing.cardState.black,
      awaitingPlay: createTestCard(),
    });
    const state = updatePlayerCardState(blackChosen, 'white', {
      ...blackChosen.cardState.white,
      awaitingPlay: createTestCard(),
    });

    // With both in, the cards are revealed together (§4.1.2).
    expect(getExpectedPlayCardsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'revealCards',
    });
  });

  it('settles the initiative once the cards are face up', () => {
    // The cards have been revealed.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'assignInitiative' }),
    );

    // Lower initiative takes it, a tie staying put (§4.1.3, §4.1.4).
    expect(getExpectedPlayCardsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveInitiative',
    });
  });

  it('ends the phase once the initiative is settled', () => {
    // The initiative has been assigned.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'complete' }),
    );

    // The commanders move next (§4.2).
    expect(getExpectedPlayCardsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completePlayCardsPhase',
    });
  });

  it('throws when asked in another phase', () => {
    // The commanders are moving: Phase 1 is over.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState(),
    );

    // Only Phase 1 is read here.
    expect(() => getExpectedPlayCardsPhaseEvent(state)).toThrow(
      'Expected playCards phase',
    );
  });

  it('throws on a step Phase 1 does not have', () => {
    // A step no phase state can hold, forced past the type.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'invalidStep' as never }), // a step the type forbids
    );

    // The exhaustive default names the step it was given.
    expect(() => getExpectedPlayCardsPhaseEvent(state)).toThrow(
      'Invalid playCards phase step: invalidStep',
    );
  });
});
