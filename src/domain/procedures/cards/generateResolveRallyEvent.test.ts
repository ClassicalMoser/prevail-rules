import type { CommandCard, PlayerSide } from '@entities';
import type { AuthoritativeGameState } from '@game';
import type { RandomSource } from '@utils';
import {
  createEmptyGameState,
  createOpenedRallyResolutionState,
} from '@factories';
import { createCleanupPhaseState, createTestCard } from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { generateResolveRallyEvent } from './generateResolveRallyEvent';

/**
 * Cleanup: resolve rally burns one played command card. Procedure picks a card from the
 * acting player’s `played` pile (non-deterministic); player comes from resolve-rally step + initiative.
 */
describe('generateResolveRallyEvent function', () => {
  /** A source that always draws `value`, so the burn index is fixed. */
  function fixedRandom(value: number): RandomSource {
    return { nextFloat: () => value };
  }

  /**
   * Cleanup on the first player's rally, which they chose to make and have
   * not yet carried out (§10.3.2). `holder` holds the initiative, so is the
   * first player; each side's played pile is as given.
   */
  function firstPlayerRallying(
    holder: PlayerSide,
    played: Record<PlayerSide, CommandCard[]>,
  ): AuthoritativeGameState {
    // The first player chose to rally, and the burn is owed.
    const rallying = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), holder),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createOpenedRallyResolutionState(true),
        step: 'firstPlayerResolveRally',
      }),
    );

    // Each side's played pile, from earlier rounds and this one.
    const whitePlayed = updatePlayerCardState(rallying, 'white', {
      ...rallying.cardState.white,
      played: played.white,
    });
    const state = updatePlayerCardState(whitePlayed, 'black', {
      ...whitePlayed.cardState.black,
      played: played.black,
    });
    return state;
  }

  it('burns from the first player’s played pile on the first player’s rally', () => {
    // Black holds the initiative, so rallies first; both piles hold a card.
    const blackCard = createTestCard();
    const state = firstPlayerRallying('black', {
      black: [blackCard],
      white: [createTestCard()],
    });

    // The rallying player's own card is burnt, and the event names them.
    expect(generateResolveRallyEvent(state, fixedRandom(0))).toStrictEqual({
      burntCard: blackCard,
      effectType: 'resolveRally',
      eventType: 'gameEffect',
      player: 'black',
    });
  });

  it('burns from White’s pile when White holds the initiative and rallies first', () => {
    // White holds the initiative this time, so White rallies first.
    const whiteCard = createTestCard();
    const state = firstPlayerRallying('white', {
      black: [createTestCard()],
      white: [whiteCard],
    });

    // White's card is burnt, not Black's.
    const event = generateResolveRallyEvent(state, fixedRandom(0));
    expect(event.player).toBe('white');
    expect(event.burntCard).toBe(whiteCard);
  });

  it('burns from the second player’s pile on the second player’s rally', () => {
    // White holds the initiative and has finished its rally; Black, the
    // second player, chose to rally too.
    const blackCard = createTestCard();
    const rallying = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'white'),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: {
          ...createOpenedRallyResolutionState(false),
          completed: true,
        },
        secondPlayerRallyResolutionState:
          createOpenedRallyResolutionState(true),
        step: 'secondPlayerResolveRally',
      }),
    );
    const state = updatePlayerCardState(rallying, 'black', {
      ...rallying.cardState.black,
      played: [blackCard],
    });

    // The second player rallies after the first (§10.3.6): Black's card burns.
    const event = generateResolveRallyEvent(state, fixedRandom(0));
    expect(event.player).toBe('black');
    expect(event.burntCard).toBe(blackCard);
  });

  it('gives each played card an equal share of the draw', () => {
    // Three cards in Black's played pile, in the order they were played.
    const first = createTestCard();
    const second = createTestCard();
    const third = createTestCard();
    const state = firstPlayerRallying('black', {
      black: [first, second, third],
      white: [],
    });

    // The burn is random by design (§10.3.2). The draw lies in [0, 1), and
    // each third of it burns one card: the bottom, the middle and the top.
    expect(generateResolveRallyEvent(state, fixedRandom(0)).burntCard).toBe(
      first,
    );
    expect(generateResolveRallyEvent(state, fixedRandom(0.5)).burntCard).toBe(
      second,
    );
    expect(generateResolveRallyEvent(state, fixedRandom(0.99)).burntCard).toBe(
      third,
    );
  });

  it('throws when the acting player has an empty played pile', () => {
    // Black rallies first with nothing played, which Cleanup never allows:
    // this round's card reaches the played pile before any rally (§10.3.3).
    const state = firstPlayerRallying('black', { black: [], white: [] });

    // The rallying player is named.
    expect(() => generateResolveRallyEvent(state, fixedRandom(0))).toThrow(
      'Player black has no played cards to burn for rally',
    );
  });
});
