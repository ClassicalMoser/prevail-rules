import type { AuthoritativeGameState } from '@game';
import type { Coordinate } from '@ruleValues';
import {
  createChooseShooterEvent,
  createCommitToRangedAttackEvent,
  createPerformRangedAttackEvent,
} from '@factories';
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
import { applyCommitToRangedAttackEvent } from '../commitment/applyCommitToRangedAttackEvent';
import { applyChooseShooterEvent } from './applyChooseShooterEvent';

import { applyPerformRangedAttackEvent } from './applyPerformRangedAttackEvent';

/**
 * A Shoot order's shot, named and committed, waiting for its target: black,
 * holding the initiative, has named the unit on E-5 as the shooter and
 * declined to commit a card, so nothing about the card is in play here.
 *
 * `readyToAimShot` in `@testing` plays the same two choices, but through
 * `applyEvent`, which reaches this spec's subject; so the two are applied
 * here directly.
 *
 * @param units - Where each unit stands; black's shooter on E-5 among them
 * @param ordered - The spaces of the units the Shoot order names, the
 * shooter's first
 * @returns The game waiting for the `performRangedAttack`
 */
function shotAwaitingTarget(
  units: Parameters<typeof createPlayableGame>[0],
  ordered: Coordinate[],
): AuthoritativeGameState {
  // The armies in the field, black to act first.
  const game = createPlayableGame(units, { initiative: 'black' });

  // The Shoot order names the units on these spaces.
  const orderedUnits = ordered.map(
    (coordinate) =>
      getSingleUnitWithPlacementAtCoordinate(game.boardState, coordinate).unit,
  );
  const resolving = resolvingShootOrder(game, orderedUnits);

  // Black names the unit on E-5 to shoot, then declines to commit a card.
  const shooter = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-5',
  );
  const named = applyChooseShooterEvent(
    createChooseShooterEvent({ player: 'black', unit: shooter.unit }),
    resolving,
  );
  const declined = applyCommitToRangedAttackEvent(
    createCommitToRangedAttackEvent({ committedCard: 'none', player: 'black' }),
    named,
  );
  return declined;
}

/**
 * Aiming a shot (§4.3.11 steps 3–4): the target and supporters are written
 * into the shot `chooseShooter` opened, and the supporters' shots are
 * spent.
 */
describe('applyPerformRangedAttackEvent function', () => {
  it('writes the target into the open shot, with no supporters, and leaves its commitments as they were', () => {
    // Black's Range-2 unit on E-5 shoots at a white unit two spaces ahead.
    const state = shotAwaitingTarget(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'C-5', facing: 'south', player: 'white' },
      ],
      ['E-5'],
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'C-5',
    );

    // Black aims at the white unit alone.
    const aimed = applyPerformRangedAttackEvent(
      createPerformRangedAttackEvent({
        player: 'black',
        supportingUnits: [],
        targetUnit: target.unit,
      }),
      state,
    );

    // The shot now knows its target, still waits on the target's
    // commitment, and keeps the shooter's refusal.
    const shot = getRangedAttackResolutionState(aimed);
    expect(shot.defendingUnit).toStrictEqual(target.unit);
    expect(shot.supportingUnits).toStrictEqual([]);
    expect(shot.attackingCommitment).toStrictEqual({
      commitmentType: 'declined',
    });
    expect(shot.defendingCommitment).toStrictEqual({
      commitmentType: 'pending',
    });
  });

  it('a named supporter spends its shot: the shot records it and it no longer waits to act', () => {
    // Two more black units of the same order still wait to shoot; one
    // supports, the other does not. Both could make the same shot.
    const state = shotAwaitingTarget(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'E-4', facing: 'north', player: 'black', range: 2 },
        { coord: 'E-6', facing: 'north', player: 'black', range: 2 },
        { coord: 'C-5', facing: 'south', player: 'white' },
      ],
      ['E-5', 'E-4', 'E-6'],
    );
    const supporter = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-4',
    );
    const bystander = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-6',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'C-5',
    );

    // Black names one supporter (§7.3.4).
    const aimed = applyPerformRangedAttackEvent(
      createPerformRangedAttackEvent({
        player: 'black',
        supportingUnits: [supporter.unit],
        targetUnit: target.unit,
      }),
      state,
    );

    // The supporter is in the shot; only the bystander is left to shoot.
    expect(getRangedAttackResolutionState(aimed).supportingUnits).toStrictEqual(
      [supporter.unit],
    );
    expect(
      getIssueCommandsPhaseState(aimed).remainingUnitsFirstPlayer,
    ).toStrictEqual([bystander.unit]);
  });

  it('throws when the target named is not on the board', () => {
    const state = shotAwaitingTarget(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'C-5', facing: 'south', player: 'white' },
      ],
      ['E-5'],
    );

    // A second white unit, never placed: the event aims at a unit the board
    // does not hold.
    const absent = createTestUnit('white', { instanceNumber: 2 });

    expect(() =>
      applyPerformRangedAttackEvent(
        createPerformRangedAttackEvent({
          player: 'black',
          supportingUnits: [],
          targetUnit: absent,
        }),
        state,
      ),
    ).toThrow(new Error('Unit not found on board'));
  });
});
