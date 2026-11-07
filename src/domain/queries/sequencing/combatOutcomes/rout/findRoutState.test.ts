import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRoutState } from './findRoutState';

/** Issue-commands phase resolving the command this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: resolution,
  });
  const issuing = updatePhaseState(empty, phaseState);
  return issuing;
}

describe('findRoutState function', () => {
  it('finds the rout a ranged attack opened', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });

    expect(findRoutState(issueCommands(resolution))).toBe(rout);
  });

  it('finds the rout a rear engagement forced', () => {
    const empty = createEmptyGameState('standard');
    // Engaging a unit from behind routs it outright.
    const resolution = createMovementResolutionState(empty, {
      engagementState: createRearEngagementState(),
    });
    const found = findRoutState(issueCommands(resolution));

    expect(found?.substepType).toBe('rout');
  });

  it('finds the melee rout in initiative order', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const blackDefender = createTestUnit('black', { attack: 2 });
    const whiteDefender = createTestUnit('white', { attack: 2 });
    const blackRout = createRoutState('black', blackDefender);
    const whiteRout = createRoutState('white', whiteDefender);
    // Black holds initiative, so black's apply is answered about first.
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRout(blackDefender, {
        routState: blackRout,
      }),
      whiteAttackApplyState: createAttackApplyStateWithRout(whiteDefender, {
        routState: whiteRout,
      }),
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(findRoutState(state)).toBe(blackRout);
  });

  it('finds the rout a rally opened during cleanup', () => {
    const empty = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', unit);
    // Choosing and resolving a rally share one slot per player.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          routState: rout,
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    expect(findRoutState(state)).toBe(rout);
  });

  it('answers undefined when the attack routed nobody', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached no threshold, so its rout slot is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyState(defender),
      defendingUnit: defender,
    });

    expect(findRoutState(issueCommands(resolution))).toBeUndefined();
  });

  it('answers undefined in a phase that routs nobody', () => {
    const empty = createEmptyGameState('standard');
    // Play-cards moves no units and so routs none.
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(findRoutState(state)).toBeUndefined();
  });
});
