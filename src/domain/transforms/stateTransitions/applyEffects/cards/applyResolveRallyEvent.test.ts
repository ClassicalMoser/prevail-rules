import type { ResolveRallyEvent } from '@events';
import type { AuthoritativeGameState, RallyResolutionState } from '@game';
import {
  createEmptyGameState,
  createOpenedRallyResolutionState,
} from '@factories';
import { getCleanupPhaseState, getCurrentRallyResolutionState } from '@queries';
import {
  createCleanupPhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import {
  projectGameStateForVisibility,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyResolveRallyEvent } from './applyResolveRallyEvent';

// White's cards: one still in hand, two on the played pile and one
// discarded. The draw burns the first played card.
const held = createTestCard();
const burnt = createTestCard();
const stillPlayed = createTestCard();
const committed = createTestCard();

// Black's cards, laid out the same way for Black's rally.
const blackHeld = createTestCard();
const blackBurnt = createTestCard();
const blackStillPlayed = createTestCard();
const blackCommitted = createTestCard();

/**
 * Cleanup on one player's rally: they chose to rally, and nothing is burnt
 * yet. White holds the initiative, so White's rally is the first and Black's
 * the second (§10.3.1).
 */
function rallying(
  player: 'white' | 'black',
  rally: RallyResolutionState = createOpenedRallyResolutionState(true),
): AuthoritativeGameState {
  const base = createEmptyGameState('standard');

  // Each side's hand, played pile and discard pile as above.
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: {
      ...base.cardState.black,
      discarded: [blackCommitted],
      inHand: [blackHeld],
      played: [blackBurnt, blackStillPlayed],
    },
    white: {
      ...base.cardState.white,
      discarded: [committed],
      inHand: [held],
      played: [burnt, stillPlayed],
    },
  });

  // The rallying player's slot holds their rally, and the step is theirs.
  // When Black rallies, White, rallying first, has declined.
  const phase =
    player === 'white'
      ? createCleanupPhaseState({
          firstPlayerRallyResolutionState: rally,
          step: 'firstPlayerResolveRally',
        })
      : createCleanupPhaseState({
          firstPlayerRallyResolutionState:
            createOpenedRallyResolutionState(false),
          secondPlayerRallyResolutionState: rally,
          step: 'secondPlayerResolveRally',
        });
  const onRally = updatePhaseState(withCards, phase);
  return onRally;
}

/**
 * A rally burns one played card, drawn at random, and takes every other
 * played and discarded card back into hand; the support check follows at once
 * (§10.3.2). The draw is the procedure's, and the event carries the card.
 */
describe('applyResolveRallyEvent function', () => {
  it('burns the card drawn, and takes the rest of the played and discard piles back into hand', () => {
    const event: ResolveRallyEvent = {
      burntCard: burnt,
      effectType: 'resolveRally',
      eventType: 'gameEffect',
      player: 'white',
    };

    const next = applyResolveRallyEvent(event, rallying('white'));

    // The drawn card is gone for good.
    expect(next.cardState.white.burnt).toStrictEqual([burnt]);

    // Everything else comes back, after the card still held: the played
    // pile first, then the discards.
    expect(next.cardState.white.inHand).toStrictEqual([
      held,
      stillPlayed,
      committed,
    ]);
    expect(next.cardState.white.played).toStrictEqual([]);
    expect(next.cardState.white.discarded).toStrictEqual([]);
  });

  it('leaves the rally on its step, with the support check owed', () => {
    const event: ResolveRallyEvent = {
      burntCard: burnt,
      effectType: 'resolveRally',
      eventType: 'gameEffect',
      player: 'white',
    };

    const next = applyResolveRallyEvent(event, rallying('white'));

    // The burn is done; who keeps a place, and so who routs, is the
    // support check's to say (§10.4).
    expect(getCurrentRallyResolutionState(next)).toStrictEqual({
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: 'pending',
      substepType: 'rallyResolution',
      unitsLostSupport: 'pending',
    });

    // White's rally goes on until the check is made (§10.3.6).
    expect(getCleanupPhaseState(next).step).toBe('firstPlayerResolveRally');
  });

  it("on White's seat, burns Black's card in view and returns the rest to Black's hand face down", () => {
    // White's seat sees Black's played and discard piles, not Black's hand.
    const whiteSeen = projectGameStateForVisibility(
      rallying('black'),
      'whiteSeen',
    );
    const event: ResolveRallyEvent = {
      burntCard: blackBurnt,
      effectType: 'resolveRally',
      eventType: 'gameEffect',
      player: 'black',
    };

    const next = applyResolveRallyEvent(event, whiteSeen);

    // The played pile is face up, so the seat sees which card burnt.
    expect(next.cardState.black.burnt).toStrictEqual([blackBurnt]);

    // The two returning cards join the hand face down, after the one held.
    expect(next.cardState.black.inHand).toStrictEqual([
      'hidden',
      'hidden',
      'hidden',
    ]);
    expect(next.cardState.black.played).toStrictEqual([]);
    expect(next.cardState.black.discarded).toStrictEqual([]);

    // Black's is the second rally, so it is written in the second slot.
    expect(getCurrentRallyResolutionState(next).rallyResolved).toBe(true);
  });

  it('throws for a player who declined to rally', () => {
    // White's step, but White chose not to rally: nothing is burnt (§10.3.4).
    const declined = rallying('white', createOpenedRallyResolutionState(false));
    const event: ResolveRallyEvent = {
      burntCard: burnt,
      effectType: 'resolveRally',
      eventType: 'gameEffect',
      player: 'white',
    };

    expect(() => applyResolveRallyEvent(event, declined)).toThrow(
      'Player did not choose to rally',
    );
  });

  it('throws for a rally already burnt', () => {
    // White's rally has had its burn; a rally burns once (§10.3.2).
    const alreadyBurnt = rallying('white', {
      ...createOpenedRallyResolutionState(true),
      rallyResolved: true,
    });
    const event: ResolveRallyEvent = {
      burntCard: burnt,
      effectType: 'resolveRally',
      eventType: 'gameEffect',
      player: 'white',
    };

    expect(() => applyResolveRallyEvent(event, alreadyBurnt)).toThrow(
      'Rally has already been resolved',
    );
  });
});
