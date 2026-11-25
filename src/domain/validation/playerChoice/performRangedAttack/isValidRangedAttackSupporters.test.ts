import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createPlayableGame,
  readyToAimShot,
  resolvingShootOrder,
} from '@testing';

import { isValidRangedAttackSupporters } from './isValidRangedAttackSupporters';

/**
 * Each supporter of a shot adds +1 (§7.3.4). A supporter must be one of the
 * shooter's units ordered by the same Shoot command that has not yet shot and
 * could make the same shot on its own; naming it spends its shot, so it is
 * named once, and the shooter does not support itself.
 *
 * Black's Shoot order names three Range-2 units: the shooter on E-5 and an
 * ally on E-4, both facing north, and a unit on E-6 facing south. A fourth
 * Range-2 unit on F-5, facing north behind the shooter, is not in the order.
 * White's target stands on D-5, one rank out from the shooter.
 */
describe('isValidRangedAttackSupporters function', () => {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-4', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-6', facing: 'south', player: 'black', range: 2 },
      { coord: 'F-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'D-5', facing: 'south', player: 'white' },
    ],
    { initiative: 'black' },
  );
  const shooter = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-5',
  );
  const ally = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-4');
  const facingAway = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-6',
  );
  const notOrdered = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'F-5',
  );
  const target = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'D-5');

  // Black's order names the first three; Black names the E-5 unit to shoot
  // and declines to commit, so the shot waits for its target and supporters.
  const aiming = readyToAimShot(
    resolvingShootOrder(game, [shooter.unit, ally.unit, facingAway.unit]),
    shooter,
    'none',
  );

  it('accepts a shot with no supporters', () => {
    expect(
      isValidRangedAttackSupporters([], shooter, target, aiming),
    ).toStrictEqual({ result: true });
  });

  it('accepts a unit of the same order that has the target in its own arc', () => {
    // D-5 is one of the ally's front spaces.
    expect(
      isValidRangedAttackSupporters([ally.unit], shooter, target, aiming),
    ).toStrictEqual({ result: true });
  });

  it('refuses a supporter named twice, since naming it spends its shot', () => {
    // The ally listed twice, to claim +2 for one shot.
    expect(
      isValidRangedAttackSupporters(
        [ally.unit, ally.unit],
        shooter,
        target,
        aiming,
      ),
    ).toStrictEqual({
      errorReason: 'Duplicate supporting unit',
      result: false,
    });
  });

  it('refuses the shooter as a supporter of its own shot', () => {
    // The shooter names itself, to add +1 to its own shot.
    expect(
      isValidRangedAttackSupporters([shooter.unit], shooter, target, aiming),
    ).toStrictEqual({
      errorReason: 'Attacker cannot also be listed as a supporter',
      result: false,
    });
  });

  it('refuses a unit of the order that could not make the shot itself', () => {
    // The E-6 unit faces south, so D-5 is behind it, out of its arc.
    expect(
      isValidRangedAttackSupporters([facingAway.unit], shooter, target, aiming),
    ).toStrictEqual({
      errorReason:
        'Supporting unit cannot independently ranged-attack the target',
      result: false,
    });
  });

  it('refuses a unit that could make the shot but was not ordered by this command', () => {
    // The F-5 unit has D-5 two ranks out, within its Range, but this Shoot
    // order did not name it.
    expect(
      isValidRangedAttackSupporters([notOrdered.unit], shooter, target, aiming),
    ).toStrictEqual({
      errorReason:
        'Supporting unit cannot independently ranged-attack the target',
      result: false,
    });
  });

  it('refuses at the first bad supporter, after accepting those before it', () => {
    // The ally may support; the unit facing away may not.
    expect(
      isValidRangedAttackSupporters(
        [ally.unit, facingAway.unit],
        shooter,
        target,
        aiming,
      ),
    ).toStrictEqual({
      errorReason:
        'Supporting unit cannot independently ranged-attack the target',
      result: false,
    });
  });
});
