import type { GameState, IssueCommandsPhaseState } from '@game';
import type { CommandCard, PlayerSide } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';
import { createIssueCommandsPhaseState, createTestCard } from '@testing';
import { createEmptyGameState } from '@factories';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { getLegalIssueCommands } from './getLegalIssueCommands';

/**
 * A game in Phase 3 on the given step, with black holding the initiative and
 * each side's card in play.
 */
function inIssueCommands(
  step: IssueCommandsPhaseState['step'],
  cards: Record<PlayerSide, CommandCard>,
): GameState {
  // Black holds the initiative, so black is the first player (§4.1.5).
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  // Each side's revealed card lies in play for the round (§4.1.2).
  const withBlack = updatePlayerCardState(base, 'black', {
    ...base.cardState.black,
    inPlay: cards.black,
  });
  const withCards = updatePlayerCardState(withBlack, 'white', {
    ...withBlack.cardState.white,
    inPlay: cards.white,
  });

  // Phase 3, on the step the case names.
  const phase = createIssueCommandsPhaseState({ step });
  const state = updatePhaseState(withCards, phase);
  return state;
}

/**
 * GetLegalIssueCommands: the issuing player, and the command on their card in
 * play that they spend.
 */
describe('getLegalIssueCommands function', () => {
  // Each side's command reaches a different distance from its commander, so
  // the two are told apart.
  const cards = {
    black: createTestCard({
      commandRestrictions: { inspirationRangeRestriction: 1 },
    }),
    white: createTestCard({
      commandRestrictions: { inspirationRangeRestriction: 2 },
    }),
  };

  it('offers the first player the command on their card in play', () => {
    // Black holds the initiative and issues first.
    const state = inIssueCommands('firstPlayerIssueCommands', cards);

    // Black spends its card's command (§4.3.1).
    expect(getLegalIssueCommands(state)).toStrictEqual({
      command: cards.black.command,
      player: 'black',
    });
  });

  it('offers the second player the command on their own card', () => {
    // Black has issued and carried out its orders; white issues next.
    const state = inIssueCommands('secondPlayerIssueCommands', cards);

    // White spends its own card's command, not black's (§4.3).
    expect(getLegalIssueCommands(state)).toStrictEqual({
      command: cards.white.command,
      player: 'white',
    });
  });

  it('throws outside the issue commands phase', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      },
    );

    // Nothing asks for an order then, so being asked is the caller's mistake.
    expect(() => getLegalIssueCommands(state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });

  it('throws while the orders are being carried out rather than issued', () => {
    // Black has issued its orders and is carrying them out.
    const state = inIssueCommands('firstPlayerResolveCommands', cards);

    // Orders are issued only on the issuing step (§4.3).
    expect(() => getLegalIssueCommands(state)).toThrow(
      'Not on an issuing step: firstPlayerResolveCommands',
    );
  });
});
