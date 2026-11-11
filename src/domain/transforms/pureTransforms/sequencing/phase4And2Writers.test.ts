import { createEmptyGameState } from '@factories';
import {
  getMoveCommandersPhaseState,
  getResolveMeleePhaseState,
} from '@queries';
import {
  createMeleeResolutionState,
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

    expect(phase.remainingEngagements).toStrictEqual(['E-4', 'E-6']);
    expect(phase.currentMeleeResolutionState).toMatchObject({
      location: 'E-5',
      substepType: 'meleeResolution',
    });
  });

  it('ends the melee under way, leaving the rest waiting', () => {
    const opened = openMeleeResolution(waiting, 'E-5');

    const phase = getResolveMeleePhaseState(clearMeleeResolution(opened));

    expect(phase.currentMeleeResolutionState).toBe('pending');
    expect(phase.remainingEngagements).toStrictEqual(['E-4', 'E-6']);
  });

  it('throws when a melee is already under way, since they are fought one at a time', () => {
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
  it('moves the commander moves to the step given', () => {
    const empty = createEmptyGameState('standard');
    const moving = updatePhaseState(empty, {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    const next = getMoveCommandersPhaseState(
      updateMoveCommandersStep(moving, 'moveSecondCommander'),
    );

    expect(next.step).toBe('moveSecondCommander');
  });
});
