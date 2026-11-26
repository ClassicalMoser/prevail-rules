import type {
  CardsLeavePlayEvent,
  CompleteIssueCommandsPhaseEvent,
  CompleteMoveCommandersPhaseEvent,
  GameEffectEvent,
  ResolveFlankEngagementEvent,
  SkipLostCommanderMoveEvent,
} from '@events';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  getBoardSpace,
  getCurrentPhaseState,
  getMoveCommandersPhaseState,
} from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createCleanupPhaseState,
  createFlankEngagementState,
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createMovementResolutionState,
  createTestUnit,
  placed,
  updateCardState,
  withLostCommander,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { applyGameEffectEvent } from './applyGameEffectEvent';

/** Cleanup is opening, with each side's card of the round still in play. */
function cleanupWithCardsInPlay(): GameState {
  const base = createEmptyGameState('standard');

  // The cards played this round are still in play.
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, inPlay: tempCommandCards[0], played: [] },
    white: { ...base.cardState.white, inPlay: tempCommandCards[1], played: [] },
  });

  // Cleanup, at the step that puts them aside.
  const cleanup = updatePhaseState(
    withCards,
    createCleanupPhaseState({ step: 'cardsLeavePlay' }),
  );
  return cleanup;
}

/**
 * A game effect is applied by the rule for that kind of effect. Each rule has
 * its own spec; this one checks that an effect reaches its rule.
 */
describe('applyGameEffectEvent function', () => {
  it('applies the end of a round: each card in play goes to its played pile', () => {
    const event: CardsLeavePlayEvent = {
      effectType: 'cardsLeavePlay',
      eventType: 'gameEffect',
    };

    const result = applyGameEffectEvent(event, cleanupWithCardsInPlay());

    // Nothing is left in play; each card waits on its played pile for a rally.
    expect(result.cardState.black.inPlay).toBeNull();
    expect(result.cardState.white.inPlay).toBeNull();
    expect(result.cardState.black.played).toStrictEqual([tempCommandCards[0]]);
    expect(result.cardState.white.played).toStrictEqual([tempCommandCards[1]]);
  });

  // The routes below are the ones no other spec reaches through this router;
  // the rest are taken whenever a scenario or the application applies an
  // effect.

  it("ends Phase 2: the first player's orders are next", () => {
    // Both commanders have moved.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createMoveCommandersPhaseState({ step: 'complete' }),
    );
    const event: CompleteMoveCommandersPhaseEvent = {
      effectType: 'completeMoveCommandersPhase',
      eventType: 'gameEffect',
    };

    const result = applyGameEffectEvent(event, state);

    // Phase 3 is open, the first player to issue their orders (§4.3).
    expect(getCurrentPhaseState(result)).toMatchObject({
      phase: 'issueCommands',
      step: 'firstPlayerIssueCommands',
    });
  });

  it("passes over a defeated commander's turn", () => {
    // White holds the initiative, and its commander has fallen (§4.2.8).
    const lost = withLostCommander(createEmptyGameState('standard'), 'white');
    const state = updatePhaseState(lost, createMoveCommandersPhaseState());
    const event: SkipLostCommanderMoveEvent = {
      effectType: 'skipLostCommanderMove',
      eventType: 'gameEffect',
    };

    const result = applyGameEffectEvent(event, state);

    // Black's commander moves next (§4.2.1).
    expect(getMoveCommandersPhaseState(result).step).toBe(
      'moveSecondCommander',
    );
  });

  it('ends Phase 3: every engaged space is to be fought', () => {
    // Both players' orders are carried out, and nothing is engaged.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState({ step: 'complete' }),
    );
    const event: CompleteIssueCommandsPhaseEvent = {
      effectType: 'completeIssueCommandsPhase',
      eventType: 'gameEffect',
      remainingEngagements: [],
    };

    const result = applyGameEffectEvent(event, state);

    // Phase 4 is open, with no fight to choose (§4.4.4).
    expect(getCurrentPhaseState(result)).toMatchObject({
      phase: 'resolveMelee',
      remainingEngagements: [],
    });
  });

  it('settles a flank engagement: the two units share the space', () => {
    // White stands at E-5 facing east. Black's move ends on its flank, facing
    // north, and has waited on F-5 for the engagement to place it.
    const defender = createTestUnit('white');
    const attacker = createTestUnit('black');
    const withUnits = createGameStateWithUnits([
      placed(defender, 'E-5', 'east'),
      placed(attacker, 'F-5', 'north'),
    ]);
    const movement = createMovementResolutionState(withUnits, {
      engagementState: createFlankEngagementState(),
      movingUnit: attacker,
      targetPlacement: { coordinate: 'E-5', facing: 'north' },
    });
    const state = createGameStateResolvingCommand(movement, withUnits);
    const event: ResolveFlankEngagementEvent = {
      effectType: 'resolveFlankEngagement',
      eventType: 'gameEffect',
    };

    const result = applyGameEffectEvent(event, state);

    // The two are engaged at E-5, to fight in Phase 4 (§6.3.4).
    expect(getBoardSpace(result.boardState, 'E-5').unitPresence).toMatchObject({
      presenceType: 'engaged',
    });
  });

  it('throws for a kind of effect it has no rule for', () => {
    const event = {
      effectType: 'unknown',
      eventType: 'gameEffect',
      // The default branch needs an effectType the union forbids.
    } as unknown as GameEffectEvent;

    // No rule applies, so the effect is refused outright.
    expect(() => applyGameEffectEvent(event, cleanupWithCardsInPlay())).toThrow(
      'Unreachable: unhandled game effect event (effectType not in switch)',
    );
  });
});
