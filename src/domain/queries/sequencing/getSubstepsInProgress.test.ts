import type {
  CleanupPhaseState,
  EngagementResolutionState,
  GameState,
} from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRetreatAndReverse,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createCleanupPhaseStateWithRallyRout,
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getSubstepsInProgress } from './getSubstepsInProgress';

/** Phase 5, on the cleanup this test built. */
function cleanup(phaseState: CleanupPhaseState): GameState {
  const empty = createEmptyGameState('standard');
  const cleaningUp = updatePhaseState(empty, phaseState);
  return cleaningUp;
}

/** Where play stands inside a step, outermost first, like breadcrumbs. */
describe('getSubstepsInProgress function', () => {
  it('is empty while cards are played, with nothing being resolved', () => {
    // Phase 1 has no orders, melees or rallies to be inside.
    const empty = createEmptyGameState('standard');
    const playing = updatePhaseState(empty, createPlayCardsPhaseState());

    // So the trail is empty.
    expect(getSubstepsInProgress(playing)).toStrictEqual([]);
  });

  it('stands at a Move order that has reached no enemy', () => {
    const empty = createEmptyGameState('standard');
    // The unit is still moving; no engagement has started.
    const move = createMovementResolutionState(empty, {
      engagementState: 'pending',
    });

    // The order is all there is to follow.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toStrictEqual([move]);
  });

  it('follows a Move order into the flank engagement it started', () => {
    const empty = createEmptyGameState('standard');
    // A flank engagement turns the defender and opens nothing further.
    const engagement = createFlankEngagementState();
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    // The trail ends at the engagement.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toStrictEqual([move, engagement]);
  });

  it('stands at a front engagement while its defender decides whether to fall back', () => {
    const empty = createEmptyGameState('standard');
    // Engaged from the front, the defender has not yet chosen to stand or
    // give ground, so no retreat has opened (§6.3.2).
    const engagement = createFrontEngagementState();
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    // The trail ends at the engagement, with no retreat beneath it.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toStrictEqual([move, engagement]);
  });

  it('follows a front engagement into the retreat its defender chose', () => {
    const empty = createEmptyGameState('standard');
    // The defender fell back rather than stand, and has yet to pick a path.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(defender.unit, []);
    const engagement = createFrontEngagementState({
      defendingUnitRetreats: true,
      retreatState: retreat,
    });
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    // The order, the engagement, then the retreat being made.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toStrictEqual([move, engagement, retreat]);
  });

  it('follows a rear engagement into the rout it forces', () => {
    const empty = createEmptyGameState('standard');
    // Engaged from behind, the defender routs outright.
    const engagement = createRearEngagementState();
    const move = createMovementResolutionState(empty, {
      engagementState: engagement,
    });

    // The order, the engagement, then the rout it forced.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toStrictEqual([
      move,
      engagement,
      engagement.engagementResolutionState.routState,
    ]);
  });

  it('throws on an engagement of a kind the rules do not name', () => {
    const empty = createEmptyGameState('standard');
    // Only front, flank and rear engagements exist (§6.3); the type forbids
    // any other, so the spec forces one through to reach the fault.
    const siege = {
      engagementType: 'siege',
    } as unknown as EngagementResolutionState;
    const engagement = createFlankEngagementState();
    const move = createMovementResolutionState(empty, {
      engagementState: { ...engagement, engagementResolutionState: siege },
    });

    // The state is at fault, and the reader says so, naming the kind it met.
    expect(() =>
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toThrow('Unknown engagement type: siege');
  });

  it('stands at a Shoot order whose attack is not yet resolved', () => {
    const empty = createEmptyGameState('standard');
    // The shooter has aimed, but no attack value has been counted yet.
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });

    // The order is all there is to follow.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(shot)),
    ).toStrictEqual([shot]);
  });

  it('follows a Shoot order into the reverse its attack forced', () => {
    const empty = createEmptyGameState('standard');
    // The shot reached the target's Reverse and nothing higher, so it turns
    // about (§9.2).
    const defender = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyStateWithReverse(defender);
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender,
    });

    // The order, its attack, then the unit turning about.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(shot)),
    ).toStrictEqual([shot, apply, apply.reverseState]);
  });

  it('follows a Shoot order into the rout its attack reached', () => {
    const empty = createEmptyGameState('standard');
    // The shot reached the target's Rout and nothing below it.
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const apply = createAttackApplyStateWithRout(defender, {
      routState: rout,
    });
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender,
    });

    // The order, its attack, then the rout its owner pays for.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(shot)),
    ).toStrictEqual([shot, apply, rout]);
  });

  it('follows a retreat with nowhere to go into the rout it ends in', () => {
    const empty = createEmptyGameState('standard');
    // The unit had no path back, so it routs instead (§9.1.6).
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const rout = createRoutState('white', defender.unit);
    const retreat = createRetreatState(defender.unit, [], { routState: rout });
    const apply = createAttackApplyStateWithRetreat(defender.unit, [], {
      retreatState: retreat,
    });
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender.unit,
    });

    // The rout sits under the retreat it took the place of.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(shot)),
    ).toStrictEqual([shot, apply, retreat, rout]);
  });

  it('drops a finished retreat, leaving its attack while the reverse is still to open', () => {
    const empty = createEmptyGameState('standard');
    // The unit has fallen back; turning about comes next (§7.5.2).
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const finished = createRetreatState(defender.unit, [], { completed: true });
    const apply = createAttackApplyStateWithRetreatAndReverse(
      defender.unit,
      [],
      {
        retreatState: finished,
      },
    );
    const shot = createRangedAttackResolutionState(empty, {
      attackApplyState: apply,
      defendingUnit: defender.unit,
    });

    // The finished retreat is gone; the attack waits for its reverse to open.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(shot)),
    ).toStrictEqual([shot, apply]);
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

    // The attack being closed ends the trail.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(shot)),
    ).toStrictEqual([shot, apply]);
  });

  it('is empty once the order is carried out', () => {
    // The unit has finished moving; the next order is not yet begun.
    const empty = createEmptyGameState('standard');
    const move = createMovementResolutionState(empty, { completed: true });

    // A finished order is not followed.
    expect(
      getSubstepsInProgress(createGameStateResolvingCommand(move)),
    ).toStrictEqual([]);
  });

  it('stands at a melee whose blows are not yet counted', () => {
    const empty = createEmptyGameState('standard');
    // Both players are still committing (§7.2.2), so neither unit has an
    // attack to carry out.
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: 'pending',
      attackOnSecondPlayerApplyState: 'pending',
    });

    // The melee is all there is to follow.
    expect(
      getSubstepsInProgress(createGameStateResolvingMelee(melee)),
    ).toStrictEqual([melee]);
  });

  it("follows a melee to the second player's unit's retreat first", () => {
    // White holds the initiative, so black's unit suffers first (§7.5.6).
    const empty = createEmptyGameState('standard');
    const whiteUnit = createUnitWithPlacement({ playerSide: 'white' });
    const blackUnit = createUnitWithPlacement({ playerSide: 'black' });
    const whiteApply = createAttackApplyStateWithRetreat(whiteUnit.unit, []);
    const blackApply = createAttackApplyStateWithRetreat(blackUnit.unit, []);
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: whiteApply,
      attackOnSecondPlayerApplyState: blackApply,
    });

    // Black's retreat is the one under way, not white's.
    expect(
      getSubstepsInProgress(createGameStateResolvingMelee(melee)),
    ).toStrictEqual([melee, blackApply, blackApply.retreatState]);
  });

  it("finishes both units' retreats before either reverses", () => {
    // Black's unit has fallen back and waits to turn about, but white's has
    // still to fall back: every retreat comes before any reverse (§7.5.6).
    const empty = createEmptyGameState('standard');
    const whiteUnit = createUnitWithPlacement({ playerSide: 'white' });
    const blackUnit = createUnitWithPlacement({ playerSide: 'black' });
    const whiteApply = createAttackApplyStateWithRetreat(whiteUnit.unit, []);
    const blackApply = createAttackApplyStateWithRetreatAndReverse(
      blackUnit.unit,
      [],
      {
        retreatState: createRetreatState(blackUnit.unit, [], {
          completed: true,
        }),
      },
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: whiteApply,
      attackOnSecondPlayerApplyState: blackApply,
    });

    // White's retreat is under way, ahead of black's reverse.
    expect(
      getSubstepsInProgress(createGameStateResolvingMelee(melee)),
    ).toStrictEqual([melee, whiteApply, whiteApply.retreatState]);
  });

  it("closes the second player's unit's attack first once every result is carried out", () => {
    // White holds the initiative, so black's unit took the first blow and its
    // attack is closed first (§7.5.6). Neither blow reached a threshold.
    const empty = createEmptyGameState('standard');
    const whiteApply = createAttackApplyStateWithNothingDue(
      createTestUnit('white'),
    );
    const blackApply = createAttackApplyStateWithNothingDue(
      createTestUnit('black'),
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: whiteApply,
      attackOnSecondPlayerApplyState: blackApply,
    });

    // Black's attack is the one being closed.
    expect(
      getSubstepsInProgress(createGameStateResolvingMelee(melee)),
    ).toStrictEqual([melee, blackApply]);
  });

  it('is empty once the melee is fought', () => {
    const empty = createEmptyGameState('standard');
    // Both attacks are carried out and closed; the next space is not yet chosen.
    const melee = createMeleeResolutionState(empty, { completed: true });

    // A finished melee is not followed.
    expect(
      getSubstepsInProgress(createGameStateResolvingMelee(melee)),
    ).toStrictEqual([]);
  });

  it("is empty while this round's cards leave play", () => {
    // The step before any rally belongs to no player's rally (§4.5.1).
    const phaseState = createCleanupPhaseState({ step: 'cardsLeavePlay' });

    // Nothing is being resolved.
    expect(getSubstepsInProgress(cleanup(phaseState))).toStrictEqual([]);
  });

  it('is empty while the first player chooses whether to rally', () => {
    // No rally has begun until the player chooses one (§10.3.1).
    const phaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
    });

    // Nothing is being resolved yet.
    expect(getSubstepsInProgress(cleanup(phaseState))).toStrictEqual([]);
  });

  it('is empty once the rally is finished', () => {
    // The cards are back and every unit kept its support, so nothing is left
    // of the rally to carry out.
    const rally = createRallyResolutionState({
      completed: true,
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: [],
    });
    const phaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState: rally,
      step: 'firstPlayerResolveRally',
    });

    // A finished rally is not followed.
    expect(getSubstepsInProgress(cleanup(phaseState))).toStrictEqual([]);
  });

  it('follows a rally into the rout it costs', () => {
    const empty = createEmptyGameState('standard');
    // A unit lost its support when the cards went back to hand (§10.3).
    const rout = createRoutState('white', createTestUnit('white'));
    const phaseState = createCleanupPhaseStateWithRallyRout(empty, rout);
    const rally = phaseState.firstPlayerRallyResolutionState;

    // The rally, then the rout its player pays for.
    expect(getSubstepsInProgress(cleanup(phaseState))).toStrictEqual([
      rally,
      rout,
    ]);
  });
});
