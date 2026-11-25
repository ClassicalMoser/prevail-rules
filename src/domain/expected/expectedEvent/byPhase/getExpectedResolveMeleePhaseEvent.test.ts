import { createEmptyGameState } from '@factories';
import {
  createGameStateResolvingMelee,
  createGameStateWithEngagedUnits,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getExpectedResolveMeleePhaseEvent } from './getExpectedResolveMeleePhaseEvent';

/**
 * Phase 4 (§4.4): every engaged space fights, one at a time, in the order the
 * first player chooses, each resolved completely before the next. With none
 * left, the phase ends.
 */
describe('getExpectedResolveMeleePhaseEvent function', () => {
  it('finishes the melee under way before the next is chosen', () => {
    // Black holds the initiative, and a melee is open with Black's commitment
    // still owed.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const melee = createMeleeResolutionState(base, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    // The melee under way asks the first player to commit first (§7.2.2).
    expect(getExpectedResolveMeleePhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: 'black',
    });
  });

  it('asks the player holding the initiative to choose the next melee', () => {
    // Black holds the initiative; one engagement on E-5 waits to be fought,
    // and none is under way.
    const engaged = updateCurrentInitiative(
      createGameStateWithEngagedUnits(
        createTestUnit('black'),
        createTestUnit('white'),
      ),
      'black',
    );
    const state = updatePhaseState(
      engaged,
      createResolveMeleePhaseState(engaged, {
        currentMeleeResolutionState: 'pending',
        remainingEngagements: ['E-5'],
      }),
    );

    // The first player chooses which engagement to fight next (§4.4.2).
    expect(getExpectedResolveMeleePhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMeleeResolution',
      playerSource: 'black',
    });
  });

  it('ends the phase once no engagement is left to fight', () => {
    // No melee is under way and none waits.
    const base = createEmptyGameState('standard');
    const state = updatePhaseState(
      base,
      createResolveMeleePhaseState(base, {
        currentMeleeResolutionState: 'pending',
        remainingEngagements: [],
      }),
    );

    // With no engagement the phase ends at once (§4.4.4).
    expect(getExpectedResolveMeleePhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeResolveMeleePhase',
    });
  });

  it('ends the phase on its complete step', () => {
    // Marked TODO(composition) in the subject: play never stands here.
    const base = createEmptyGameState('standard');
    const state = updatePhaseState(
      base,
      createResolveMeleePhaseState(base, {
        currentMeleeResolutionState: 'pending',
        step: 'complete',
      }),
    );

    // The same effect as an empty queue.
    expect(getExpectedResolveMeleePhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeResolveMeleePhase',
    });
  });

  it('throws on a step Phase 4 does not have', () => {
    // A step no phase state can hold, forced past the type.
    const base = createEmptyGameState('standard');
    const state = updatePhaseState(
      base,
      createResolveMeleePhaseState(base, { step: 'invalidStep' as never }), // a step the type forbids
    );

    // The exhaustive default names the step it was given.
    expect(() => getExpectedResolveMeleePhaseEvent(state)).toThrow(
      'Invalid resolveMelee phase step: invalidStep',
    );
  });
});
