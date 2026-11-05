import type { Coordinate } from '@entities';
import type { GameState } from '@game';
import type { Event } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createResolveMeleePhaseState } from '@testing';
import {
  updatePhaseState,
  updateRoundEventStream,
  updateCurrentInitiative,
} from '@transforms';
import { throwIfUndefined } from '@utils';
import { createEmptyGameState } from '@factories';

import { getLegalChooseMeleeResolutionEvents } from './getLegalChooseMeleeResolutionEvents';

/**
 * Melees are resolved one at a time, and the player holding initiative chooses
 * the order. These are the choices that player may make: one per engagement on
 * the board that has not been resolved yet. Asking when none is left is a
 * mistake by the caller, which should have moved the game on instead, so it
 * throws rather than returning nothing.
 */
describe('getLegalChooseMeleeResolutionEvents function', () => {
  function stateChoosingMeleeEngagement(options?: {
    initiative?: 'black' | 'white';
    remaining?: Iterable<Coordinate>;
    eventStream?: readonly Event[];
  }): GameState {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      options?.initiative ?? 'black',
    );
    const remaining = new Set<Coordinate>(
      options?.remaining ?? (['E-5', 'E-6'] as readonly Coordinate[]),
    );
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: [...remaining],
    });
    let state = updatePhaseState(base, phase);
    if (options?.eventStream) {
      state = updateRoundEventStream(state, options.eventStream);
    }
    return state;
  }

  it('offers the player with initiative one choice per engagement still unresolved', () => {
    const state = stateChoosingMeleeEngagement({
      initiative: 'white',
      remaining: ['E-4', 'E-5', 'E-6'] as const,
    });

    const options = getLegalChooseMeleeResolutionEvents(state);

    // Three melees are waiting, so white may name any one of them to resolve
    // next. Every choice carries the same player and event number; only the
    // space differs, since the space is the engagement being picked.
    expect(options).toStrictEqual([
      {
        choiceType: 'chooseMeleeResolution',
        eventNumber: 0,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player: 'white',
        space: 'E-4',
      },
      {
        choiceType: 'chooseMeleeResolution',
        eventNumber: 0,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player: 'white',
        space: 'E-5',
      },
      {
        choiceType: 'chooseMeleeResolution',
        eventNumber: 0,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player: 'white',
        space: 'E-6',
      },
    ]);
  });

  it('throws when there are no remaining engagements (caller should advance phase)', () => {
    const state = stateChoosingMeleeEngagement({ remaining: [] });

    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'No legal choose melee resolution events',
    );
  });

  it('uses getNextEventNumber for eventNumber on each option', () => {
    const prior: readonly Event[] = [
      {
        black: tempCommandCards[0],
        effectType: 'revealCards',
        eventNumber: 0,
        eventType: 'gameEffect',
        white: tempCommandCards[1],
      },
      {
        black: tempCommandCards[0],
        effectType: 'revealCards',
        eventNumber: 1,
        eventType: 'gameEffect',
        white: tempCommandCards[1],
      },
    ];
    const state = stateChoosingMeleeEngagement({
      eventStream: prior,
      remaining: ['E-5'] as const,
    });

    const options = getLegalChooseMeleeResolutionEvents(state);

    expect(options).toHaveLength(1);
    expect(
      throwIfUndefined(options[0], 'expected one legal option').eventNumber,
    ).toBe(2);
  });

  it('throws when there is no current phase state', () => {
    const state = createEmptyGameState('standard');
    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'No current phase state found',
    );
  });

  it('throws when not in resolveMelee phase', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'Expected resolveMelee phase, got playCards',
    );
  });

  it('throws when resolveMelee phase is not on the resolveMelee step', () => {
    const base = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: ['E-5'] as const,
      step: 'complete',
    });
    const state = updatePhaseState(base, phase);

    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'Not in resolve melee phase',
    );
  });
});
