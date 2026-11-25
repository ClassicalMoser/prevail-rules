import type { PlayerSide, UnitInstance } from '@entities';
import type { ResolveRetreatEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import { createAttackApplyState, createUnitPlacement } from '@factories';
import {
  findCommanderSpace,
  findPositionOfUnit,
  getFrontEngagementStateFromMovement,
  getRetreatState,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';
import { deployCommander, updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveRetreatEvent } from './applyResolveRetreatEvent';

/**
 * Applies a committed retreat: removes the unit from where it stands, places it where
 * `path` leads, and marks the nested retreat substep completed (ranged or melee side).
 */
describe('applyResolveRetreatEvent function', () => {
  // Any units will do: on open ground each one's single retreat is a step
  // straight back, and the apply reads nothing of them but who they are.
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
   * The shot drove White's unit back, and its one retreat, a step straight
   * back to F-5, is open and taken.
   */
  function shotDrivingWhiteBack(): GameState {
    const retreats = legalRetreatsOf(placed(white, 'E-5', 'north'));
    const apply = createAttackApplyStateWithRetreat(white, retreats);
    const driven = shotAtWhite(apply);
    return driven;
  }

  /**
   * White's unit on E-5 facing north locked in a melee with Black's, facing
   * it. The blow on one side drove that side's unit back, and its one
   * retreat, a step straight back, is open and taken. White holds the
   * initiative, so its unit's results sit in the first player's slot.
   */
  function meleeDrivingBack(retreating: PlayerSide): GameState {
    const base = createGameStateWithEngagedUnits(white, black, 'E-5', 'north');

    // The retreating unit falls back from the shared space, away from the
    // enemy it faces.
    const unit = retreating === 'white' ? white : black;
    const enemy = retreating === 'white' ? black : white;
    const facing = retreating === 'white' ? 'north' : 'south';
    const enemyFacing = retreating === 'white' ? 'south' : 'north';
    const retreats = legalRetreatsOf(placed(unit, 'E-5', facing), [
      placed(enemy, 'E-5', enemyFacing),
    ]);
    const apply = createAttackApplyStateWithRetreat(unit, retreats);
    const melee = createMeleeResolutionState(
      base,
      retreating === 'white'
        ? { attackOnFirstPlayerApplyState: apply }
        : { attackOnSecondPlayerApplyState: apply },
    );

    // Phase 4, with that melee being fought.
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: melee,
    });
    const fighting = updatePhaseState(base, phase);
    return fighting;
  }

  /** The retreat as its procedure writes it: the unit and its path. */
  function retreatOf(unit: UnitInstance): ResolveRetreatEvent {
    const event: ResolveRetreatEvent = {
      effectType: 'resolveRetreat',
      eventType: 'gameEffect',
      path: ['step'],
      unit,
    };
    return event;
  }

  describe('ranged retreat apply', () => {
    it('the target of a shot falls back along its path, and its retreat is done', () => {
      const next = applyResolveRetreatEvent(
        retreatOf(white),
        shotDrivingWhiteBack(),
      );

      // One step back from E-5 facing north is F-5, still facing north: a
      // retreating unit never turns about (§9.1.4).
      expect(findPositionOfUnit(next, white)).toStrictEqual({
        coordinate: 'F-5',
        facing: 'north',
      });
      expect(next.boardState.board['E-5']?.unitPresence.presenceType).toBe(
        'none',
      );
      // The retreat is owed nothing more.
      expect(getRetreatState(next, 'white').completed).toBe(true);
    });
  });

  describe('melee retreat apply', () => {
    it.each([
      { landing: 'F-5', retreating: 'white' },
      { landing: 'D-5', retreating: 'black' },
    ] as const)(
      "$retreating's unit falls back out of the melee to $landing, and the enemy holds the space alone",
      ({ landing, retreating }) => {
        const unit = retreating === 'white' ? white : black;
        const stays = retreating === 'white' ? black : white;

        const next = applyResolveRetreatEvent(
          retreatOf(unit),
          meleeDrivingBack(retreating),
        );

        // The unit is one step back from the shared space, the way it came.
        expect(findPositionOfUnit(next, unit)?.coordinate).toBe(landing);
        // The enemy is no longer engaged: it stands alone on E-5.
        expect(findPositionOfUnit(next, stays)?.coordinate).toBe('E-5');
        expect(next.boardState.board['E-5']?.unitPresence.presenceType).toBe(
          'single',
        );
        // The retreat on this player's side of the melee is done.
        expect(getRetreatState(next, retreating).completed).toBe(true);
      },
    );
  });

  describe('commander with the retreating unit', () => {
    it("the retreating unit's own commander in its space ends in the unit's final space (§9.1.8)", () => {
      // White's commander stands in E-5 with the unit about to fall back.
      const state = deployCommander(shotDrivingWhiteBack(), 'white', 'E-5');

      const newState = applyResolveRetreatEvent(retreatOf(white), state);

      // The commander leaves E-5 and arrives on F-5 with its unit.
      expect(findCommanderSpace('white', newState)).toBe('F-5');
    });

    it("an enemy commander in the retreating unit's space stays put (§9.1.8)", () => {
      // Black's commander stands in E-5 too, as it would having ridden its own
      // unit into the fight (§4.3.10). It is not white's to carry off.
      const state = deployCommander(meleeDrivingBack('white'), 'black', 'E-5');

      const newState = applyResolveRetreatEvent(retreatOf(white), state);

      // White's unit moved on, but black's commander did not follow it.
      expect(findPositionOfUnit(newState, white)?.coordinate).toBe('F-5');
      expect(findCommanderSpace('black', newState)).toBe('E-5');
    });
  });

  describe('a path that runs off the board', () => {
    it('throws: the retreat path leaves the board, which no procedure writes', () => {
      const state = shotDrivingWhiteBack();

      // Every step falls back one more space (§9.1.3); from E-5 facing north,
      // enough of them carry the unit past the board's edge.
      const event: ResolveRetreatEvent = {
        effectType: 'resolveRetreat',
        eventType: 'gameEffect',
        path: Array.from({ length: 40 }, () => 'step' as const),
        unit: white,
      };

      // The procedure offers only retreats on the board, so this is a fault.
      expect(() => applyResolveRetreatEvent(event, state)).toThrow(
        'The retreat path leaves the board',
      );
    });
  });

  describe('a retreat that was never opened', () => {
    it('throws: a retreat is resolved only after it opens', () => {
      // The shot reached White's Retreat, but the retreat has not been opened,
      // so no ways back have been worked out and none taken.
      const unopened = createAttackApplyState(white, {
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      });
      const state = shotAtWhite(unopened);

      // Resolving it now is a fault in the sequence.
      expect(() => applyResolveRetreatEvent(retreatOf(white), state)).toThrow(
        'No retreat is in play for white',
      );
    });
  });

  describe('structural update', () => {
    it('leaves the state it was given as it was', () => {
      const state = shotDrivingWhiteBack();
      const retreatBefore = getRetreatState(state, 'white');
      const boardBefore = state.boardState;

      applyResolveRetreatEvent(retreatOf(white), state);

      // A transition returns a new state; the old one still shows the unit
      // on E-5 and the retreat unfinished.
      expect(retreatBefore.completed).toBe(false);
      expect(state.boardState).toBe(boardBefore);
      expect(findPositionOfUnit(state, white)?.coordinate).toBe('E-5');
    });
  });

  describe('front engagement retreat apply', () => {
    it('moves the defender and completes the engagement', () => {
      // Black's unit walked into White's on E-5 from the front, squared up
      // facing it (§6.2.3). White was the faster, and chose to fall back
      // (§6.3.2).
      const base = createGameStateWithEngagedUnits(
        white,
        black,
        'E-5',
        'north',
      );
      // Open ground behind White: the one retreat, taken at once.
      const retreats = legalRetreatsOf(placed(white, 'E-5', 'north'), [
        placed(black, 'E-5', 'south'),
      ]);
      const engagement = createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: createRetreatState(white, retreats),
      });
      const move = createMovementResolutionState(base, {
        engagementState: engagement,
        movingUnit: black,
        targetPlacement: createUnitPlacement('E-5', 'south'),
      });
      const state = createGameStateResolvingCommand(move, base);

      const next = applyResolveRetreatEvent(retreatOf(white), state);

      // White fell back to F-5, and Black holds E-5 alone.
      expect(findPositionOfUnit(next, white)?.coordinate).toBe('F-5');
      expect(findPositionOfUnit(next, black)?.coordinate).toBe('E-5');
      // The retreat is done, and with it the engagement: no melee is fought
      // (§6.3.2).
      expect(getRetreatState(next, 'white').completed).toBe(true);
      expect(getFrontEngagementStateFromMovement(next).completed).toBe(true);
    });
  });
});
