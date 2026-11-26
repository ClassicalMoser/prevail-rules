import { createInitialGameState } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import {
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayableGame,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
  createTestCard,
  withRoutOwing,
} from '@testing';
import {
  updatePhaseState,
  updatePlayerCardState,
  updateWinner,
} from '@transforms';
import { findExpectedEvent } from './findExpectedEvent';

/**
 * One unit a side facing each other across the middle of the board, so both
 * armies are in the field and neither has lost by being destroyed (§11.4).
 */
const armies: Parameters<typeof createPlayableGame>[0] = [
  { coord: 'E-5', facing: 'north', player: 'black' },
  { coord: 'D-5', facing: 'south', player: 'white' },
];

/**
 * What the game waits for next, read from the whole state. A won battle
 * expects nothing. A battle just lost owes the effect that ends it, before any
 * phase is asked (§11). Otherwise setup comes before the first round, and in
 * a round each phase's own sequencer decides.
 */
describe('findExpectedEvent function', () => {
  it('expects nothing once the battle has a winner', () => {
    // Black has prevailed: nobody is owed a choice and no effect is due.
    const state = updateWinner(createPlayableGame(armies), 'black');

    expect(findExpectedEvent(state)).toBeUndefined();
  });

  it('before the first round, asks the side holding the initiative to set up', () => {
    // A new mini game: both armies wait in reserve, and White holds the
    // initiative (§3.5.4).
    const state = createInitialGameState({
      blackArmy: blackMiniStarterArmy,
      gameMode: 'mini',
      whiteArmy: whiteMiniStarterArmy,
    });

    // White places its whole army first.
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('in Play Cards, asks that phase: both players choose a card at once', () => {
    // The round opens and nobody has chosen yet.
    const state = updatePhaseState(
      createPlayableGame(armies),
      createPlayCardsPhaseState(),
    );

    // Both choose face down at the same time (§4.1.1).
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseCard',
      playerSource: 'bothPlayers',
    });
  });

  it('in Move Commanders, asks that phase: the first player moves first', () => {
    // The phase opens; White holds the initiative.
    const state = updatePhaseState(
      createPlayableGame(armies),
      createMoveCommandersPhaseState(),
    );

    // White's general moves first (§4.2.1).
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveCommander',
      playerSource: 'white',
    });
  });

  it('in Issue Commands, asks that phase: it closes once every order is done', () => {
    // Both players have issued and carried out all their orders.
    const game = createPlayableGame(armies);
    const state = updatePhaseState(
      game,
      createIssueCommandsPhaseState({ step: 'complete' }),
    );

    // The phase closes.
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeIssueCommandsPhase',
    });
  });

  it('in Resolve Melee, asks that phase: it ends at once with nothing to fight', () => {
    // No unit is engaged, so no melee is open and none waits (§4.4.4).
    const game = createPlayableGame(armies);
    const state = updatePhaseState(
      game,
      createResolveMeleePhaseState(game, {
        currentMeleeResolutionState: 'pending',
        remainingEngagements: [],
      }),
    );

    // The phase closes.
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeResolveMeleePhase',
    });
  });

  it('in Cleanup, asks that phase: the cards in play leave play first', () => {
    // Cleanup opens.
    const state = updatePhaseState(
      createPlayableGame(armies),
      createCleanupPhaseState(),
    );

    // The round's cards go to the played pile before anyone rallies (§4.5.1).
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'cardsLeavePlay',
    });
  });

  it('throws for a phase no round has', () => {
    // The type allows only the five phases, so a sixth is forced past it to
    // stand for a corrupt state.
    const state = updatePhaseState(createPlayableGame(armies), {
      phase: 'invalidPhase',
    } as never);

    expect(() => findExpectedEvent(state)).toThrow('Invalid phase');
  });

  it('ends the battle when a hand is empty, before the phase is asked', () => {
    // White has no cards left; Move Commanders would otherwise ask White to
    // move its general.
    const state = updatePhaseState(
      createPlayableGame(armies, { hands: { white: [] } }),
      createMoveCommandersPhaseState(),
    );

    // An empty hand loses at once (§11.1).
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('ends the battle on a rout its owner cannot pay, before Cleanup is asked', () => {
    // White rallied, and a unit with no support place routed; it costs two
    // cards and White holds one (§11.2).
    const game = createPlayableGame(armies, { hands: { white: 1 } });
    const state = withRoutOwing(game, 'white', 2);

    // Paying would leave the hand empty, so the battle is already lost.
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'gameOver',
    });
  });

  it('does not end the battle while the other card is still being chosen in secret', () => {
    // White has laid its last card face down; Black has yet to choose.
    const game = createPlayableGame(armies);
    const state = updatePlayerCardState(
      updatePhaseState(game, createPlayCardsPhaseState()),
      'white',
      { ...game.cardState.white, awaitingPlay: createTestCard(), inHand: [] },
    );

    // The two cards are revealed together, so the empty hand is judged then,
    // not at whichever choice arrived first (§4.1.1, §4.1.2). Black chooses.
    expect(findExpectedEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseCard',
      playerSource: 'black',
    });
  });
});
