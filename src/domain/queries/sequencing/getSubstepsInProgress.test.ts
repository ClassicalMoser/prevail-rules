import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRetreatAndReverse,
  createAttackApplyStateWithRout,
  createCleanupPhaseStateWithRallyRout,
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getSubstepsInProgress } from './getSubstepsInProgress';

/** Phase 3, carrying out the order this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: resolution,
  });
  const issuing = updatePhaseState(empty, phaseState);
  return issuing;
}

/** Where play stands inside a step, outermost first, like breadcrumbs. */
describe('getSubstepsInProgress function', () => {
  it('is empty while cards are played, with nothing being resolved', () => {
    const empty = createEmptyGameState('standard');
    const playing = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(getSubstepsInProgress(playing)).toStrictEqual([]);
  });

  it('follows a Move order into the flank engagement it started', () => {
    const empty = createEmptyGameState('standard');
    // A flank engagement turns the defender and opens nothing further.
    const engagement = createFlankEngagementState();
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    expect(getSubstepsInProgress(issueCommands(move))).toStrictEqual([
      move,
      engagement,
    ]);
  });

  it('follows a front engagement into the retreat its defender chose', () => {
    const empty = createEmptyGameState('standard');
    // The defender fell back rather than stand, and has yet to pick a path.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(defender, []);
    const engagement = createFrontEngagementState({
      defendingUnitRetreats: true,
      retreatState: retreat,
    });
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    expect(getSubstepsInProgress(issueCommands(move))).toStrictEqual([
      move,
      engagement,
      retreat,
    ]);
  });

  it('follows a rear engagement into the rout it forces', () => {
    const empty = createEmptyGameState('standard');
    // Engaged from behind, the defender routs outright.
    const engagement = createRearEngagementState();
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    expect(getSubstepsInProgress(issueCommands(move))).toStrictEqual([
      move,
      engagement,
      engagement.engagementResolutionState.routState,
    ]);
  });

  it('follows a Shoot order into the rout its attack reached', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const apply = createAttackApplyStateWithRout(defender, {
      routState: rout,
    });
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender,
    });

    expect(getSubstepsInProgress(issueCommands(shot))).toStrictEqual([
      shot,
      apply,
      rout,
    ]);
  });

  it('follows a retreat with nowhere to go into the rout it ends in', () => {
    const empty = createEmptyGameState('standard');
    // The unit had no path back, so it routs instead (§9.1.6).
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const rout = createRoutState('white', defender.unit);
    const retreat = createRetreatState(defender, [], { routState: rout });
    const apply = createAttackApplyStateWithRetreat(defender, [], {
      retreatState: retreat,
    });
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender.unit,
    });

    expect(getSubstepsInProgress(issueCommands(shot))).toStrictEqual([
      shot,
      apply,
      retreat,
      rout,
    ]);
  });

  it('drops a finished retreat, leaving its attack while the reverse is still to open', () => {
    const empty = createEmptyGameState('standard');
    // The unit has fallen back; turning about comes next (§7.5.2).
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const finished = createRetreatState(defender, [], { completed: true });
    const apply = createAttackApplyStateWithRetreatAndReverse(defender, [], {
      retreatState: finished,
    });
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender.unit,
    });

    expect(getSubstepsInProgress(issueCommands(shot))).toStrictEqual([
      shot,
      apply,
    ]);
  });

  it('stops at an attack that only waits to be closed', () => {
    const empty = createEmptyGameState('standard');
    // The shot reached no threshold, so its results are only to be closed.
    const defender = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyStateWithNothingDue(defender);
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender,
    });

    expect(getSubstepsInProgress(issueCommands(shot))).toStrictEqual([
      shot,
      apply,
    ]);
  });

  it('is empty once the order is carried out', () => {
    const empty = createEmptyGameState('standard');
    const move = createMovementResolutionState(empty, { completed: true });

    expect(getSubstepsInProgress(issueCommands(move))).toStrictEqual([]);
  });

  it("follows a melee to the second player's unit's retreat first", () => {
    // White holds the initiative, so black's unit suffers first (§7.5.6).
    const empty = createEmptyGameState('standard');
    const whiteUnit = createUnitWithPlacement({ playerSide: 'white' });
    const blackUnit = createUnitWithPlacement({ playerSide: 'black' });
    const whiteApply = createAttackApplyStateWithRetreat(whiteUnit, []);
    const blackApply = createAttackApplyStateWithRetreat(blackUnit, []);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: whiteApply,
      secondPlayerAttackApplyState: blackApply,
    });
    const fighting = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(getSubstepsInProgress(fighting)).toStrictEqual([
      melee,
      blackApply,
      blackApply.retreatState,
    ]);
  });

  it("finishes both units' retreats before either reverses", () => {
    // Black's unit has fallen back and waits to turn about, but white's has
    // still to fall back: every retreat comes before any reverse (§7.5.6).
    const empty = createEmptyGameState('standard');
    const whiteUnit = createUnitWithPlacement({ playerSide: 'white' });
    const blackUnit = createUnitWithPlacement({ playerSide: 'black' });
    const whiteApply = createAttackApplyStateWithRetreat(whiteUnit, []);
    const blackApply = createAttackApplyStateWithRetreatAndReverse(
      blackUnit,
      [],
      { retreatState: createRetreatState(blackUnit, [], { completed: true }) },
    );
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: whiteApply,
      secondPlayerAttackApplyState: blackApply,
    });
    const fighting = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(getSubstepsInProgress(fighting)).toStrictEqual([
      melee,
      whiteApply,
      whiteApply.retreatState,
    ]);
  });

  it('follows a rally into the rout it costs', () => {
    const empty = createEmptyGameState('standard');
    // A unit lost its support when the cards went back to hand (§10.3).
    const rout = createRoutState('white', createTestUnit('white'));
    const phaseState = createCleanupPhaseStateWithRallyRout(empty, rout);
    const cleanup = updatePhaseState(empty, phaseState);
    const rally = phaseState.firstPlayerRallyResolutionState;

    expect(getSubstepsInProgress(cleanup)).toStrictEqual([rally, rout]);
  });
});
