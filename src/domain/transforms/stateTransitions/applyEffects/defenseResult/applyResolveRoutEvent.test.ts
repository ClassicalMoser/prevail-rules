import type { PlayerSide } from '@entities';
import type { ResolveRoutEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import { getRearEngagementStateFromMovement, getRoutState } from '@queries';
import {
  createAttackApplyStateWithRout,
  createCleanupPhaseStateWithRallyRout,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestUnit,
  placed,
} from '@testing';
import {
  removeUnitsLeavingUnderRout,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyResolveRoutEvent } from './applyResolveRoutEvent';

/**
 * Writes `numberToDiscard` (and related rout bookkeeping) onto the active rout substep for
 * the matching source: ranged/melee apply, cleanup rally, or rear engagement under movement.
 */
describe('applyResolveRoutEvent function', () => {
  // Any units will do: the apply reads the penalty off the event, not their
  // Morale.
  const white = createTestUnit('white');
  const black = createTestUnit('black');

  /**
   * A shot at White's unit on E-5 facing north, from Black's shooter in
   * front of it on D-5, with this apply on the target.
   */
  function shotAtWhite(apply: AttackApplyState): GameState {
    const shooter = createTestUnit('black', { range: 1 });
    const base = createGameStateWithUnits([
      placed(white, 'E-5', 'north'),
      placed(shooter, 'D-5', 'south'),
    ]);
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: apply,
      attackingUnit: shooter,
      defendingUnit: white,
    });

    // Phase 3, with that shot being carried out.
    const resolving = createGameStateResolvingCommand(shot, base);
    return resolving;
  }

  /**
   * The shot broke White's unit: its rout is open and the unit has left the
   * board, its Morale not yet counted.
   */
  function shotRoutingWhite(): GameState {
    const shot = shotAtWhite(createAttackApplyStateWithRout(white));
    const routed = removeUnitsLeavingUnderRout(shot, [white]);
    return routed;
  }

  /**
   * A melee on E-5, White's unit facing north and Black's facing it, in
   * which one side's unit broke: its rout is open and it has left the board.
   * White holds the initiative, so its unit's results sit in the first
   * player's slot.
   */
  function meleeRouting(routing: PlayerSide): GameState {
    const base = createGameStateWithEngagedUnits(white, black, 'E-5', 'north');
    const unit = routing === 'white' ? white : black;
    const apply = createAttackApplyStateWithRout(unit);
    const melee = createMeleeResolutionState(
      base,
      routing === 'white'
        ? { attackOnFirstPlayerApplyState: apply }
        : { attackOnSecondPlayerApplyState: apply },
    );

    // Phase 4, with that melee being fought, and the broken unit gone.
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: melee,
    });
    const fighting = updatePhaseState(base, phase);
    const routed = removeUnitsLeavingUnderRout(fighting, [unit]);
    return routed;
  }

  /** The rout's cost as its procedure counts it: who pays, and how many. */
  function penaltyOf(player: PlayerSide, penalty: number): ResolveRoutEvent {
    const event: ResolveRoutEvent = {
      effectType: 'resolveRout',
      eventType: 'gameEffect',
      penalty,
      player,
    };
    return event;
  }

  describe('ranged rout substep', () => {
    it('writes the Morale owed on the rout, which then waits for its owner to choose the cards', () => {
      const next = applyResolveRoutEvent(
        penaltyOf('white', 2),
        shotRoutingWhite(),
      );

      // Two cards are owed (§9.3.2) and none chosen yet.
      const rout = getRoutState(next, 'white');
      expect(rout.numberToDiscard).toBe(2);
      expect(rout.cardsChosen).toBe(false);
      expect(rout.completed).toBe(false);
      // The rout is still White's, of the same unit.
      expect(rout.unitsToRout).toStrictEqual([white]);
    });

    it('a zero penalty closes the rout — there is nothing to choose', () => {
      // Morale 0 costs nothing (§9.3.2).
      const next = applyResolveRoutEvent(
        penaltyOf('white', 0),
        shotRoutingWhite(),
      );

      // Nothing owed, nothing to choose, and the rout is done.
      const rout = getRoutState(next, 'white');
      expect(rout.numberToDiscard).toBe(0);
      expect(rout.cardsChosen).toBe(true);
      expect(rout.completed).toBe(true);
    });
  });

  describe('melee rout substep', () => {
    it.each(['white', 'black'] as const)(
      "the Morale owed lands on %s's own rout: each owner pays for their own unit (§9.3.3)",
      (routing) => {
        const next = applyResolveRoutEvent(
          penaltyOf(routing, 2),
          meleeRouting(routing),
        );

        // The penalty is written on the routing side's rout.
        expect(getRoutState(next, routing).numberToDiscard).toBe(2);
      },
    );
  });

  describe('cleanup rally rout', () => {
    it('the Morale of units that lost their support lands on the rally rout', () => {
      // White rallied, and a unit with no place at the support check routed
      // (§10.4.6). White holds the initiative, so it is White's rally first.
      const state = createEmptyGameState('standard');
      const rally = createCleanupPhaseStateWithRallyRout(
        state,
        createRoutState('white', white),
      );
      const onRally = updatePhaseState(state, rally);

      const next = applyResolveRoutEvent(penaltyOf('white', 2), onRally);

      // Two cards are owed on the rally's rout (§10.4.7).
      expect(getRoutState(next, 'white').numberToDiscard).toBe(2);
    });
  });

  describe('rear engagement movement', () => {
    it("the Morale of a unit routed from the rear lands on the engagement's rout", () => {
      // Black's unit engaged White's from the rear, and White's unit routed
      // on the spot (§6.3.3).
      const state = createGameStateMovingInto(createRearEngagementState());

      const next = applyResolveRoutEvent(penaltyOf('white', 2), state);

      // Two cards are owed, and the engagement waits for them.
      expect(getRoutState(next, 'white').numberToDiscard).toBe(2);
      expect(getRearEngagementStateFromMovement(next).completed).toBe(false);
    });
  });

  describe('rear engagement with nothing to pay', () => {
    it('a zero-Morale rout closes the rear engagement, so the move can finish', () => {
      // A defender worth no Morale — a cheap skirmisher — routed from the
      // rear: no discard to ask for, so the engagement ends here (§6.3.3).
      const state = createGameStateMovingInto(createRearEngagementState());

      const newState = applyResolveRoutEvent(penaltyOf('white', 0), state);
      const engagement = getRearEngagementStateFromMovement(newState);

      expect(engagement.completed).toBe(true);
      expect(engagement.engagementResolutionState.completed).toBe(true);
    });
  });

  describe('structural update', () => {
    it('leaves the state it was given as it was', () => {
      const state = shotRoutingWhite();
      const routBefore = getRoutState(state, 'white');

      applyResolveRoutEvent(penaltyOf('white', 2), state);

      // A transition returns a new state; the old rout is still uncounted.
      expect(routBefore.numberToDiscard).toBe('pending');
      expect(getRoutState(state, 'white').numberToDiscard).toBe('pending');
    });
  });

  describe('errors', () => {
    it('throws when the ranged apply owes a rout that was never opened', () => {
      // The shot reached White's Rout, but the rout has not been opened.
      const unopened = createAttackApplyState(white, {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: true,
      });

      // Counting its Morale now is a fault in the sequence.
      expect(() =>
        applyResolveRoutEvent(penaltyOf('white', 2), shotAtWhite(unopened)),
      ).toThrow('No rout is in play for white');
    });
  });
});
