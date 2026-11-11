import type { AuthoritativeGameState } from '@game';
import { createChooseShooterEvent } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  createTestCard,
  readyToAimShot,
  resolvingShootOrder,
} from '@testing';
import { applyEvent } from '@transforms';

import { getLegalShooterTargets } from './getLegalShooterTargets';

/**
 * Once a shooter is named and its card committed or refused, the targets
 * open to it are the enemies in its forward arc out to its Range, with any
 * Range on the committed card counted (§4.3.11 steps 2–3).
 *
 * Black's Range-2 unit stands on E-5 facing north. White has a unit on C-7,
 * two ranks out, and one on B-5, three ranks out — one beyond that Range.
 */
const rangeCard = createTestCard({ modifiers: ['range'] });

function blackShooting(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'C-7', facing: 'south', player: 'white' },
      { coord: 'B-5', facing: 'south', player: 'white' },
    ],
    { hands: { black: [rangeCard, createTestCard()] }, initiative: 'black' },
  );
  const shooter = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-5',
  );
  const resolving = resolvingShootOrder(game, [shooter.unit]);
  return resolving;
}

describe('getLegalShooterTargets function', () => {
  it('a Range card committed for the shot brings a target one space beyond the shooter’s Range into reach', () => {
    const ready = blackShooting();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      ready.boardState,
      'E-5',
    );
    // Black names its unit and commits the card for Range.
    const state = readyToAimShot(ready, shooter, rangeCard);

    const legal = getLegalShooterTargets(state);

    // Both white units are in reach: B-5 only through the card.
    expect(
      legal?.targets.map((target) => target.placement.coordinate),
    ).toStrictEqual(['B-5', 'C-7']);
  });

  it('a shooter that refuses to commit reaches only as far as its own Range', () => {
    const ready = blackShooting();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      ready.boardState,
      'E-5',
    );
    // Black names its unit and refuses to commit.
    const state = readyToAimShot(ready, shooter, null);

    const legal = getLegalShooterTargets(state);

    // Only the unit two ranks out is in reach.
    expect(
      legal?.targets.map((target) => target.placement.coordinate),
    ).toStrictEqual(['C-7']);
    // And the shooter it reports is black's unit, where it stands.
    expect(legal?.shooter).toStrictEqual(shooter);
  });

  it('offers no targets until the shooter has committed or refused', () => {
    const ready = blackShooting();
    const start = applyEffectsUntilChoice(ready);
    if (start.next === 'gameOver') {
      throw new Error('Play should wait on black naming its shooter');
    }
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      start.state.boardState,
      'E-5',
    );
    // Black names its unit; its commitment is still owed (§4.3.11 step 2).
    const named = applyEvent(
      createChooseShooterEvent({
        player: 'black',
        unit: shooter,
      }),
      start.state,
    );

    expect(getLegalShooterTargets(named)).toBeNull();
  });
});
