import type { UnitWithPlacement } from '@entities';
import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
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
  createRetreatState,
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

    expect(findRoutState(issueCommands(resolution), 'white')).toBe(rout);
  });

  it('finds the rout a rear engagement forced', () => {
    const empty = createEmptyGameState('standard');
    // Engaging a unit from behind routs it outright.
    const resolution = createMovementResolutionState(empty, {
      engagementState: createRearEngagementState(),
    });
    const found = findRoutState(issueCommands(resolution), 'white');

    expect(found?.substepType).toBe('rout');
  });

  it('answers each side about its own rout when a melee routs both', () => {
    // Both units strike at once, so a melee can hold a rout for each side.
    // Initiative decides which resolves first and not which rout is whose.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const blackDefender = createTestUnit('black', { attack: 2 });
    const whiteDefender = createTestUnit('white', { attack: 2 });
    const blackRout = createRoutState('black', blackDefender);
    const whiteRout = createRoutState('white', whiteDefender);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRout(
        blackDefender,
        {
          routState: blackRout,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithRout(
        whiteDefender,
        {
          routState: whiteRout,
        },
      ),
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(findRoutState(state, 'black')).toBe(blackRout);
    expect(findRoutState(state, 'white')).toBe(whiteRout);
  });

  it('finds the rout a retreat with nowhere to go fell into', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('black', { attack: 2 });
    const standing: UnitWithPlacement = {
      placement: createUnitPlacement('E-5', 'north'),
      unit: defender,
    };
    // The attack forced a retreat and reached no rout of its own, so the rout
    // is held by the retreat rather than by the attack.
    const nested = createRoutState('black', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(standing, {
        retreatState: createRetreatState(standing, {
          legalRetreatPaths: [],
          routState: nested,
        }),
      }),
      defendingUnit: defender,
    });

    expect(findRoutState(issueCommands(resolution), 'black')).toBe(nested);
  });

  it('answers undefined when the rout belongs to the other player', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    // One rout, and it is white's to pay for.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });

    expect(findRoutState(issueCommands(resolution), 'black')).toBeUndefined();
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

    expect(findRoutState(state, 'white')).toBe(rout);
  });

  it('answers undefined when the attack routed nobody', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached no threshold, so its rout slot is bypassed.
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyState(defender),
      defendingUnit: defender,
    });

    expect(findRoutState(issueCommands(resolution), 'white')).toBeUndefined();
  });

  it('answers undefined in a phase that routs nobody', () => {
    const empty = createEmptyGameState('standard');
    // Play-cards moves no units and so routs none.
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(findRoutState(state, 'white')).toBeUndefined();
  });
});
