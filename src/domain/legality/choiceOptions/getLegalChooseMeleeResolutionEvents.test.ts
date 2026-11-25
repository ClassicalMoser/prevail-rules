import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import {
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';
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
  /**
   * Phase 4 between melees: none is being fought, and the given engaged
   * spaces are still to fight.
   */
  function stateChoosingMeleeEngagement(options: {
    initiative?: 'black' | 'white';
    remaining: Coordinate[];
  }): GameState {
    // The side holding the initiative picks the order (§4.4.2).
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      options.initiative ?? 'black',
    );
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: options.remaining,
    });
    const state = updatePhaseState(base, phase);
    return state;
  }

  it('offers the player with initiative one choice per engagement still unresolved', () => {
    const state = stateChoosingMeleeEngagement({
      initiative: 'white',
      remaining: ['E-4', 'E-5', 'E-6'],
    });

    const options = getLegalChooseMeleeResolutionEvents(state);

    // Three melees are waiting, so white may name any one of them to resolve
    // next. Every choice carries the same player and event number; only the
    // space differs, since the space is the engagement being picked.
    expect(options).toStrictEqual([
      {
        choiceType: 'chooseMeleeResolution',
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player: 'white',
        space: 'E-4',
      },
      {
        choiceType: 'chooseMeleeResolution',
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player: 'white',
        space: 'E-5',
      },
      {
        choiceType: 'chooseMeleeResolution',
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        player: 'white',
        space: 'E-6',
      },
    ]);
  });

  it('throws when asked while a melee is under way, because the next is chosen once it is resolved', () => {
    // One melee is being fought, and two more engagements still wait.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: createMeleeResolutionState(base),
      remainingEngagements: ['E-5', 'E-6'],
    });
    const state = updatePhaseState(base, phase);

    // The order of the melees is chosen between them, not during one (§4.4.2).
    // Nothing asks for the order mid-melee, so being asked is the caller's
    // mistake, and it is loud rather than an empty offer.
    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'A melee is under way; the next is chosen once it is resolved',
    );
  });

  it('throws when there are no remaining engagements (caller should advance phase)', () => {
    const state = stateChoosingMeleeEngagement({ remaining: [] });

    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'No legal choose melee resolution events',
    );
  });

  it('throws when not in resolveMelee phase', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'Expected resolveMelee phase, got playCards',
    );
  });

  it('throws when resolveMelee phase is not on the resolveMelee step', () => {
    const base = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: ['E-5'],
      step: 'complete',
    });
    const state = updatePhaseState(base, phase);

    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      'Not in resolve melee phase',
    );
  });
});
