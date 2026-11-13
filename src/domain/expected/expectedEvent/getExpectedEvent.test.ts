import type { GameState, PhaseState } from '@game';
import { createEmptyGameState, createInitialGameState } from '@factories';
import {
  blackMiniStarterArmy,
  tempCommandCards,
  whiteMiniStarterArmy,
} from '@sampleValues';
import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';
import { getExpectedEvent } from './getExpectedEvent';

/** An empty board where both hands still hold a card, so nobody has lost. */
function gameStillGoing(): GameState {
  const state = createEmptyGameState('standard');
  const withCards = updateCardState(state, {
    ...state.cardState,
    black: { ...state.cardState.black, inHand: [createTestCard()] },
    white: { ...state.cardState.white, inHand: [createTestCard()] },
  });
  return withCards;
}

/** The game still going, in the given phase. */
function inPhase(phaseState: PhaseState): GameState {
  const going = gameStillGoing();
  const state = updatePhaseState(going, phaseState);
  return state;
}

/**
 * The event the game expects next, read from the whole state. A finished
 * battle comes first: an empty hand or an unpayable rout ends it before any
 * phase is asked (§11). Otherwise the current phase decides, and before the
 * first round it is setup.
 */
describe('getExpectedEvent function', () => {
  it('in the play-cards phase, asks what that phase expects', () => {
    // Both cards are down and waiting to be turned over (§4.1.2).
    const state = inPhase(createPlayCardsPhaseState({ step: 'revealCards' }));

    // The cards are revealed together.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'revealCards',
    });
  });

  it('in the move-commanders phase, asks what that phase expects', () => {
    // The first general has yet to move; white holds the initiative.
    const state = inPhase(createMoveCommandersPhaseState());

    // White moves its general first (§4.2.1).
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
      playerSource: 'white',
    });
  });

  it('in the issue-commands phase, asks what that phase expects', () => {
    // Every order has been given and carried out.
    const going = gameStillGoing();
    const state = updatePhaseState(
      going,
      createIssueCommandsPhaseState(going, { step: 'complete' }),
    );

    // The phase closes.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeIssueCommandsPhase',
    });
  });

  it('in the resolve-melee phase, asks what that phase expects', () => {
    // No melee is open and none is left to fight.
    const going = gameStillGoing();
    const state = updatePhaseState(
      going,
      createResolveMeleePhaseState(going, {
        currentMeleeResolutionState: 'pending',
        remainingEngagements: [],
      }),
    );

    // The phase closes.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeResolveMeleePhase',
    });
  });

  it('in the cleanup phase, asks what that phase expects', () => {
    // Cleanup opens with the round's cards still in play.
    const state = inPhase(createCleanupPhaseState());

    // They go to the played pile first (§4.5.1).
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'discardPlayedCards',
    });
  });

  it('throws for a phase the game does not have', () => {
    // A phase name no round contains; the type forbids it, so it is forced
    // past to stand for a corrupt state.
    const going = gameStillGoing();
    const state = updatePhaseState(going, {
      phase: 'invalidPhase',
    } as never);

    expect(() => getExpectedEvent(state)).toThrow('Invalid phase');
  });

  it('before the first round, asks the side with the initiative to set up', () => {
    // A new mini game: both armies are in reserve and White holds the
    // initiative (§3.5).
    const state = createInitialGameState({
      blackArmy: blackMiniStarterArmy,
      gameMode: 'mini',
      whiteArmy: whiteMiniStarterArmy,
    });

    // White places its whole army first.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('ends the game when white has no cards left, before any phase is asked', () => {
    // White's hand is empty; setup would otherwise be next.
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });

    // An empty hand loses the battle (§11.1).
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('ends the game when black has no cards left, before any phase is asked', () => {
    // Black's hand is empty with play-cards closing; that phase would
    // otherwise be asked.
    const base = createEmptyGameState('standard');
    const emptied = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
    });
    const state = updatePhaseState(
      emptied,
      createPlayCardsPhaseState({ step: 'complete' }),
    );

    // An empty hand loses the battle (§11.1).
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('ends the game when both hands are empty', () => {
    // Neither side has a card.
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inHand: [] },
      white: { ...base.cardState.white, inHand: [] },
    });

    // The battle is over all the same.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('ends the game on a rout its owner cannot pay, before cleanup is asked', () => {
    // White holds one card but owes two for a rout at its rally (§11.2).
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
        inPlay: null,
      },
    });
    const state = updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          playerRallied: true,
          rallyResolved: true,
          routState: createRoutState('white', createTestUnit('white'), {
            cardsChosen: false,
            numberToDiscard: 2,
          }),
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    // The unpayable rout loses the battle.
    expect(getExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('throws when the game already has a winner', () => {
    // A finished game expects nothing; asking this twin insists on an answer.
    const state = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };

    expect(() => getExpectedEvent(state)).toThrow('Game is already over');
  });
});
