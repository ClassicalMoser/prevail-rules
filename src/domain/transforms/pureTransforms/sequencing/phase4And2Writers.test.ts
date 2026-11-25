import { createEmptyGameState } from '@factories';
import {
  getMoveCommandersPhaseState,
  getResolveMeleePhaseState,
} from '@queries';
import {
  createMeleeResolutionState,
  createMoveCommandersPhaseState,
  createResolveMeleePhaseState,
} from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { clearMeleeResolution } from './clearMeleeResolution';
import { openMeleeResolution } from './openMeleeResolution';
import { updateMoveCommandersStep } from './updateMoveCommandersStep';

/**
 * Melees are fought one at a time, in the order the first player chooses
 * (§4.4.2), and each player moves their commander before orders begin (§4.2.1).
 */
describe('openMeleeResolution and clearMeleeResolution functions', () => {
  // Phase 4 with three engagements waiting and none yet chosen.
  const empty = createEmptyGameState('standard');
  const waiting = updatePhaseState(
    empty,
    createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: ['E-4', 'E-5', 'E-6'],
    }),
  );

  it('takes the chosen space out of those waiting and opens its melee', () => {
    const phase = getResolveMeleePhaseState(
      openMeleeResolution(waiting, 'E-5'),
    );

    // E-5 no longer waits; its melee is the one being fought.
    expect(phase.remainingEngagements).toStrictEqual(['E-4', 'E-6']);
    expect(phase.currentMeleeResolutionState).toMatchObject({
      location: 'E-5',
      substepType: 'meleeResolution',
    });
  });

  it('ends the melee under way, leaving the rest waiting', () => {
    const opened = openMeleeResolution(waiting, 'E-5');

    const phase = getResolveMeleePhaseState(clearMeleeResolution(opened));

    // No melee is under way, and the other two still wait their turn.
    expect(phase.currentMeleeResolutionState).toBe('pending');
    expect(phase.remainingEngagements).toStrictEqual(['E-4', 'E-6']);
  });

  it('throws when a melee is already under way, since they are fought one at a time', () => {
    // The melee at E-5 is still being fought when E-4 is chosen.
    const underWay = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty),
        remainingEngagements: ['E-4'],
      }),
    );

    expect(() => openMeleeResolution(underWay, 'E-4')).toThrow(
      'A melee is already being resolved',
    );
  });
});

describe('updateMoveCommandersStep function', () => {
  it('moves from the first player’s commander to the second’s', () => {
    // The first player's commander is moving.
    const moving = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState({ step: 'moveFirstCommander' }),
    );

    const next = getMoveCommandersPhaseState(
      updateMoveCommandersStep(moving, 'moveSecondCommander'),
    );

    // The second player's commander moves next (§4.2.1).
    expect(next.step).toBe('moveSecondCommander');
  });
});
