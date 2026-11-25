import { createPerformRangedAttackEvent } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createPlayableGame,
  createTestCard,
  readyToAimShot,
  resolvingShootOrder,
} from '@testing';

import { isValidPerformRangedAttackEvent } from './isValidPerformRangedAttackEvent';

/**
 * The target and supporters for the shooter a `chooseShooter` named, aimed
 * after its commitment (§4.3.11 steps 3–4): the target must be in the
 * shooter's reach, its committed card counted, and each supporter must be
 * able to make the same shot at its own Range.
 *
 * Black's Shoot order names two Range-2 units side by side, facing north:
 * the shooter on E-5 and an ally on E-4. White has a unit on D-5, one rank
 * out, and one on B-5, three ranks out from the shooter. Black holds a card
 * that may be committed for Range.
 */
describe('isValidPerformRangedAttackEvent function', () => {
  const rangeCard = createTestCard({ modifiers: ['range'] });
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'E-4', facing: 'north', player: 'black', range: 2 },
      { coord: 'D-5', facing: 'south', player: 'white' },
      { coord: 'B-5', facing: 'south', player: 'white' },
    ],
    { hands: { black: [rangeCard, createTestCard()] }, initiative: 'black' },
  );
  const shooter = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-5',
  );
  const ally = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-4');
  const near = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'D-5');
  const far = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'B-5');
  const ordered = resolvingShootOrder(game, [shooter.unit, ally.unit]);

  // Black names the E-5 unit to shoot, and declines to commit.
  const declined = readyToAimShot(ordered, shooter, 'none');

  // Black names the E-5 unit to shoot, and commits the Range card.
  const committedRange = readyToAimShot(ordered, shooter, rangeCard);

  it('accepts a target in the shooter’s arc with no supporters', () => {
    const event = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [],
      targetUnit: near.unit,
    });

    expect(isValidPerformRangedAttackEvent(event, declined)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a supporter from the same order that could make the shot itself', () => {
    // The ally on E-4 has D-5 in its own arc, and has not yet shot.
    const event = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [ally.unit],
      targetUnit: near.unit,
    });

    expect(isValidPerformRangedAttackEvent(event, declined)).toStrictEqual({
      result: true,
    });
  });

  it('refuses a shot aimed by the other side', () => {
    // White names a target for Black's shooter.
    const event = createPerformRangedAttackEvent({
      player: 'white',
      supportingUnits: [],
      targetUnit: near.unit,
    });

    // Only the shooter's owner aims it.
    expect(isValidPerformRangedAttackEvent(event, declined)).toStrictEqual({
      errorReason: 'Expected perform ranged attack from black, got white',
      result: false,
    });
  });

  it('refuses a target beyond the shooter’s Range', () => {
    // B-5 is three ranks out; the shooter's Range is 2, and no card lifts it.
    const event = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [],
      targetUnit: far.unit,
    });

    expect(isValidPerformRangedAttackEvent(event, declined)).toStrictEqual({
      errorReason:
        'Target is not a legal ranged-attack defender for the attacker',
      result: false,
    });
  });

  it('accepts a target one space beyond the shooter’s Range when its committed card names Range', () => {
    // Black committed the Range card before aiming (§4.3.11 step 2).
    const event = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [],
      targetUnit: far.unit,
    });

    expect(
      isValidPerformRangedAttackEvent(event, committedRange),
    ).toStrictEqual({ result: true });
  });

  it('the shooter’s Range card does not stretch a supporter’s arc', () => {
    // The card reaches B-5 for the shooter alone; the ally's own Range of 2
    // does not (§4.3.11 step 4, §8.4.1).
    const event = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [ally.unit],
      targetUnit: far.unit,
    });

    // The supporters' refusal is the event's.
    expect(
      isValidPerformRangedAttackEvent(event, committedRange),
    ).toStrictEqual({
      errorReason:
        'Supporting unit cannot independently ranged-attack the target',
      result: false,
    });
  });
});
