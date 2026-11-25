import type { MoveDelta } from '@entities';
import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createAttackApplyState } from '@factories';
import { getRangedAttackApplyState, getRetreatState } from '@queries';
import {
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';

import { applyOpenRetreatFromAttackApplyEvent } from './applyOpenRetreatFromAttackApplyEvent';

/**
 * Opens the retreat under an attack apply whose retreat slot is still pending,
 * writing the retreats its procedure recorded on the event. The transform
 * does not judge them, so each case varies the event to show one branch.
 */
describe('applyOpenRetreatFromAttackApplyEvent function', () => {
  /**
   * A shot that reached its target's Retreat, and the Reverse too, with
   * neither step opened yet: White's unit on E-5 facing north, Black's
   * shooter in front of it on D-5 facing it.
   */
  function shotDrivingBack(): GameState {
    // Any unit will do: the apply reads nothing of it but who it is.
    const target = createTestUnit('white');
    const shooter = createTestUnit('black', { range: 1 });
    const base = createGameStateWithUnits([
      placed(target, 'E-5', 'north'),
      placed(shooter, 'D-5', 'south'),
    ]);

    // The shot reached Retreat and Reverse; both steps are due, unopened.
    const apply = createAttackApplyState(target, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: false,
    });
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: apply,
      attackingUnit: shooter,
      defendingUnit: target,
    });

    // Phase 3, with that shot being carried out.
    const resolving = createGameStateResolvingCommand(shot, base);
    return resolving;
  }

  /** The open event as its procedure would build it, carrying `retreatPaths`. */
  function openWith(
    retreatPaths: MoveDelta[][],
  ): OpenRetreatFromAttackApplyEvent {
    const event: OpenRetreatFromAttackApplyEvent = {
      effectType: 'openRetreatFromAttackApply',
      eventType: 'gameEffect',
      retreatPaths,
    };
    return event;
  }

  it('a lone retreat is opened already chosen, with no rout to follow', () => {
    // On an empty board the unit's one retreat is a step straight back.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([['step']]),
      shotDrivingBack(),
    );

    // The retreat is White's, holding the one retreat the event gave.
    const retreat = getRetreatState(next, 'white');
    expect(retreat.retreatingUnit.playerSide).toBe('white');
    expect(retreat.legalRetreatPaths).toStrictEqual([['step']]);
    // One legal retreat is no choice (§9.1.3), and one that can be made never
    // turns into a rout (§9.1.6).
    expect(retreat.chosenRetreatPath).toStrictEqual(['step']);
    expect(retreat.routState).toBe('bypassed');
  });

  it('a tie is opened for the owner to choose', () => {
    // Two equally small retreats, as the procedure finds them when an enemy
    // stands behind the unit; the transform writes them without judging.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([
        ['turnLeft', 'step'],
        ['turnRight', 'step'],
      ]),
      shotDrivingBack(),
    );

    // Both are kept, and neither is taken for the owner.
    const retreat = getRetreatState(next, 'white');
    expect(retreat.legalRetreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
    expect(retreat.chosenRetreatPath).toBe('pending');
  });

  it('no retreat at all leaves the rout due', () => {
    // §9.1.6: a unit that must retreat and cannot routs instead.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([]),
      shotDrivingBack(),
    );

    // The retreat opens empty, its rout waiting to be triggered.
    const retreat = getRetreatState(next, 'white');
    expect(retreat.legalRetreatPaths).toStrictEqual([]);
    expect(retreat.routState).toBe('pending');
  });

  it('leaves the reverse due for its own turn, after the retreat', () => {
    // The unit falls back before it turns about (§7.5.4), so opening the
    // retreat does not open the reverse the shot also reached.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([['step']]),
      shotDrivingBack(),
    );

    // The reverse is still due, not yet opened.
    expect(getRangedAttackApplyState(next).reverseState).toBe('pending');
  });
});
