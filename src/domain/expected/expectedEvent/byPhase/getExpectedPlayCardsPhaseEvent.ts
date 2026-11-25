import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getPlayCardsPhaseState, haveBothPlayersChosenCards } from '@queries';

/**
 * Gets information about the expected event for the PlayCards phase.
 *
 * Phase 1 (§4.1): both players choose a card face down at the same time, the
 * two are revealed together, and the lower initiative takes the initiative.
 * The choices are owed to whoever has not yet chosen; the reveal, the
 * initiative and the end of the phase are effects the game owes.
 *
 * @param state - The current game state with PlayCards phase
 * @returns Information about what event is expected
 */
export function getExpectedPlayCardsPhaseEvent(
  state: GameState,
): ExpectedEventInfo {
  // Asked only in Phase 1; any other phase throws in the getter.
  const phaseState = getPlayCardsPhaseState(state);

  switch (phaseState.step) {
    case 'chooseCards': {
      // With both cards face down, they are revealed together (§4.1.2).
      if (haveBothPlayersChosenCards(state.cardState)) {
        const reveal: ExpectedEventInfo = {
          actionType: 'gameEffect',
          effectType: 'revealCards',
        };
        return reveal;
      }

      // Which side already has a card waiting face down. Every view can tell
      // that a card waits, even where it cannot tell which card.
      // TODO(composition): "has this player chosen" is read by hand here, in
      // `haveBothPlayersChosenCards` and in `getLegalChooseCardOptions`.
      // Settle with one query in `@queries` that all three ask.
      const blackCardChosen = state.cardState.black.awaitingPlay !== null;
      const whiteCardChosen = state.cardState.white.awaitingPlay !== null;
      const oneCardChosen = blackCardChosen || whiteCardChosen;

      // The choices are simultaneous (§4.1.1), but they arrive one at a time.
      // Once one is in, only the other player still owes a card.
      if (oneCardChosen) {
        const stillChoosing = blackCardChosen ? 'white' : 'black';
        const otherChoice: ExpectedEventInfo = {
          actionType: 'playerChoice',
          choiceType: 'chooseCard',
          playerSource: stillChoosing,
        };
        return otherChoice;
      }

      // Nobody has chosen yet: both owe a card at once, and the engine
      // accepts each whenever it arrives.
      const bothChoose: ExpectedEventInfo = {
        actionType: 'playerChoice',
        choiceType: 'chooseCard',
        playerSource: 'bothPlayers',
      };
      return bothChoose;
    }

    case 'assignInitiative': {
      // The cards are face up: compare their initiative values, lower first,
      // a tie staying with the holder (§4.1.3, §4.1.4).
      const resolveInitiative: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'resolveInitiative',
      };
      return resolveInitiative;
    }

    case 'complete': {
      // Initiative is settled, so the phase ends and the commanders move next
      // (§4.2).
      const completePhase: ExpectedEventInfo = {
        actionType: 'gameEffect',
        effectType: 'completePlayCardsPhase',
      };
      return completePhase;
    }

    default: {
      // A step this phase does not have is a fault in the state.
      const _exhaustive: never = phaseState.step;
      throw new Error(`Invalid playCards phase step: ${_exhaustive}`);
    }
  }
}
