import type { ResolveInitiativeEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getPlayCardsPhaseState } from '@queries';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveInitiativeEvent } from './applyResolveInitiativeEvent';

/** Both cards turned over and in play, initiative still to be decided. */
function assigningInitiative(): AuthoritativeGameState {
  const base = createEmptyGameState('standard');

  // Each side's card is in play, face up (§4.1.2): Black's initiative 1,
  // White's 3, so Black's is the lower.
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: {
      ...base.cardState.black,
      inPlay: createTestCard({ initiative: 1 }),
    },
    white: {
      ...base.cardState.white,
      inPlay: createTestCard({ initiative: 3 }),
    },
  });

  // Phase 1, at the step where the two initiatives are compared.
  const assigning = updatePhaseState(
    withCards,
    createPlayCardsPhaseState({ step: 'assignInitiative' }),
  );
  return assigning;
}

/**
 * The lower initiative in play takes the initiative, and a tie leaves it where
 * it was (§4.1.3, §4.1.4). The procedure compares the cards; the apply records
 * the side it found, and card play is over.
 */
describe('applyResolveInitiativeEvent function', () => {
  it('gives the initiative to the side named, and ends card play', () => {
    // White held the initiative as the round began; Black's lower card has
    // taken it.
    const state = assigningInitiative();
    const event: ResolveInitiativeEvent = {
      effectType: 'resolveInitiative',
      eventType: 'gameEffect',
      player: 'black',
    };

    const next = applyResolveInitiativeEvent(event, state);

    // Black is the first player for the rest of the round (§4.1.5).
    expect(next.currentInitiative).toBe('black');

    // Phase 1 is done; the commanders move next.
    expect(getPlayCardsPhaseState(next).step).toBe('complete');
  });

  it('throws when the game is not playing cards', () => {
    // The commanders are already moving.
    const moving = updatePhaseState(
      assigningInitiative(),
      createMoveCommandersPhaseState(),
    );
    const event: ResolveInitiativeEvent = {
      effectType: 'resolveInitiative',
      eventType: 'gameEffect',
      player: 'black',
    };

    // Initiative is decided only as the cards are played (§4.1).
    expect(() => applyResolveInitiativeEvent(event, moving)).toThrow(
      'Expected playCards phase, got moveCommanders',
    );
  });
});
