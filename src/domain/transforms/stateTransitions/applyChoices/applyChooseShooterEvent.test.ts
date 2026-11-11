import type { AuthoritativeGameState } from '@game';
import { createChooseShooterEvent } from '@factories';
import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { createPlayableGame, resolvingShootOrder } from '@testing';

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
        unit: shooter,
      }),
      state,
    );

    // The shooter commits before it aims (§4.3.11 step 2), so the target,
    // its supporters and both commitments all wait.
    const shot = getRangedAttackResolutionState(named);
    expect(shot.attackingUnit).toStrictEqual(shooter.unit);
    expect(shot.attackingCommitment).toStrictEqual({
      commitmentType: 'pending',
    });
    expect(shot.defendingUnit).toBe('pending');
    expect(shot.supportingUnits).toBe('pending');
    expect(shot.defendingCommitment).toStrictEqual({
      commitmentType: 'pending',
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
        unit: shooter,
      }),
      state,
    );

    // Only the unit on E-3 is still to act.
    expect(
      getIssueCommandsPhaseState(named).remainingUnitsFirstPlayer,
    ).toStrictEqual([other.unit]);
  });
});
