import type { AuthoritativeGameState } from '@game';
import { createChooseShooterEvent } from '@factories';
import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  createPlayableGame,
  createTestUnit,
  resolvingShootOrder,
} from '@testing';

import { applyChooseShooterEvent } from './applyChooseShooterEvent';

/**
 * Naming a unit under a Shoot order begins its shot (§4.3.11 step 1): a
 * ranged attack opens with the shooter's commitment still to come and
 * nothing yet aimed, and the unit leaves the list of those the order has
 * still to act.
 *
 * Black carries out a Shoot order for two Range-2 units on E-5 and E-3; a
 * white unit stands in front of them so the army is in the field.
 */
function blackShootingWithTwo(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      {
        coord: 'E-3',
        facing: 'north',
        instanceNumber: 2,
        player: 'black',
        range: 2,
      },
      { coord: 'C-5', facing: 'south', player: 'white' },
    ],
    { initiative: 'black' },
  );
  const first = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-5');
  const second = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-3');
  const resolving = resolvingShootOrder(game, [first.unit, second.unit]);
  return resolving;
}

describe('applyChooseShooterEvent function', () => {
  it('opens the shot with the shooter’s commitment owed and nothing yet aimed', () => {
    const state = blackShootingWithTwo();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    // Black names the unit on E-5 to shoot.
    const named = applyChooseShooterEvent(
      createChooseShooterEvent({
        player: 'black',
        unit: shooter.unit,
      }),
      state,
    );

    // The shooter commits before it aims (§4.3.11 step 2), so the target,
    // its supporters, the target's commitment and the blow all wait.
    expect(getRangedAttackResolutionState(named)).toStrictEqual({
      attackApplyState: 'pending',
      attackingCommitment: { commitmentType: 'pending' },
      attackingUnit: shooter.unit,
      commandResolutionType: 'rangedAttack',
      completed: false,
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      substepType: 'commandResolution',
      supportingUnits: 'pending',
    });
  });

  it('the named unit leaves the order’s units still to act, and the other stays', () => {
    const state = blackShootingWithTwo();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const other = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-3',
    );

    // Black names the unit on E-5; each unit shoots once.
    const named = applyChooseShooterEvent(
      createChooseShooterEvent({
        player: 'black',
        unit: shooter.unit,
      }),
      state,
    );

    // Only the unit on E-3 is still to act.
    expect(
      getIssueCommandsPhaseState(named).remainingUnitsFirstPlayer,
    ).toStrictEqual([other.unit]);
  });

  it('refuses to open a second shot while one is under way', () => {
    // Shots are carried out one at a time, each finished first (§4.3.9).
    const state = blackShootingWithTwo();
    const first = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );
    const second = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-3',
    );

    // The unit on E-5 is named, and its shot has not been aimed.
    const named = applyChooseShooterEvent(
      createChooseShooterEvent({
        player: 'black',
        unit: first.unit,
      }),
      state,
    );

    // Naming the unit on E-3 now is a fault in whatever sent it.
    expect(() =>
      applyChooseShooterEvent(
        createChooseShooterEvent({
          player: 'black',
          unit: second.unit,
        }),
        named,
      ),
    ).toThrow(new Error('A command is already being resolved'));
  });

  it('throws when the unit named is not on the board', () => {
    const state = blackShootingWithTwo();

    // A third black Range-2 unit, never placed: the event names a unit the
    // board does not hold.
    const absent = createTestUnit('black', { instanceNumber: 3, range: 2 });

    expect(() =>
      applyChooseShooterEvent(
        createChooseShooterEvent({
          player: 'black',
          unit: absent,
        }),
        state,
      ),
    ).toThrow(new Error('Unit not found on board'));
  });
});
