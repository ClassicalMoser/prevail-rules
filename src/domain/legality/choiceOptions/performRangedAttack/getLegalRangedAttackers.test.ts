import type { AuthoritativeGameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameStateWithEngagedUnits,
  createIssueCommandsPhaseState,
  createPlayableGame,
  createTestCard,
  createTestCommand,
  createTestUnit,
  createRangedAttackResolutionState,
  placed,
  replaceBoard,
  resolvingMoveOrder,
  resolvingShootOrder,
} from '@testing';
import {
  addUnitToBoard,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { getLegalRangedAttackers } from './getLegalRangedAttackers';

/**
 * Perform-ranged-attack atoms: one attacker, one defender, supporters that
 * can independently hit that defender.
 *
 * Board: letters decrease toward north (A is northernmost).
 *
 * Between shots of a Shoot order, the player names the next shooter from the
 * units the order has still to act. A unit may be named only if it is
 * unengaged, has Range, and has a target at its own Range (§4.3.11 step 1).
 * Black holds the initiative and carries out the order unless a case says
 * otherwise.
 */

/**
 * The game with these units on the board, Black carrying out a Shoot order
 * for the unit on E-5.
 */
function blackShootingFromE5(
  units: Parameters<typeof createPlayableGame>[0],
): AuthoritativeGameState {
  const game = createPlayableGame(units, { initiative: 'black' });
  const ordered = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'E-5',
  );
  const shooting = resolvingShootOrder(game, [ordered.unit]);
  return shooting;
}

describe('getLegalRangedAttackers function', () => {
  it('returns remaining unengaged units with range > 0 and a legal target', () => {
    // Black's Range-2 unit faces White's, one space ahead.
    const state = blackShootingFromE5([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'D-5', facing: 'south', player: 'white' },
    ]);
    const attacker = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'E-5',
    );

    expect(getLegalRangedAttackers(state)).toStrictEqual({
      attackers: [attacker],
      player: 'black',
    });
  });

  it('answers that nobody can shoot when the only unit has range 0', () => {
    // White's unit stands right in front of a unit that cannot shoot.
    const state = blackShootingFromE5([
      { coord: 'E-5', facing: 'north', player: 'black', range: 0 },
      { coord: 'D-5', facing: 'south', player: 'white' },
    ]);

    // A real answer: the order ends with no shot taken.
    expect(getLegalRangedAttackers(state)).toStrictEqual({
      attackers: [],
      player: 'black',
    });
  });

  it('answers that nobody can shoot when units have range but no legal target', () => {
    // No white unit is on the board at all.
    const state = blackShootingFromE5([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
    ]);

    // A unit with nothing to shoot at is passed over (§4.3.11 step 1).
    expect(getLegalRangedAttackers(state)).toStrictEqual({
      attackers: [],
      player: 'black',
    });
  });

  it('does not offer a unit of the order that is locked in a melee', () => {
    // Black's Range-2 unit is engaged on E-5; another white unit stands
    // two spaces out in its arc.
    const shooter = createTestUnit('black', { range: 2 });
    const engaged = createGameStateWithEngagedUnits(
      shooter,
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const board = addUnitToBoard(
      engaged.boardState,
      placed(
        createTestUnit('white', { attack: 2, instanceNumber: 2 }),
        'C-5',
        'south',
      ),
    );
    const withHands = createPlayableGame([], { initiative: 'black' });
    const state = resolvingShootOrder(replaceBoard(withHands, board), [
      shooter,
    ]);

    // An engaged unit can neither shoot nor support a shot (§4.3.11).
    expect(getLegalRangedAttackers(state).attackers).toStrictEqual([]);
  });

  it('passes over a unit of the order that is not on the board', () => {
    // The order names a second black unit that stands nowhere.
    const game = createPlayableGame(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      { initiative: 'black' },
    );
    const onBoard = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const absent = createTestUnit('black', { instanceNumber: 2, range: 2 });
    const state = resolvingShootOrder(game, [absent, onBoard.unit]);

    // Marked TODO(misleading) in the subject: play never reaches this.
    expect(getLegalRangedAttackers(state).attackers).toStrictEqual([onBoard]);
  });

  it('offers the second player’s shooters on the second player’s resolve step', () => {
    // White holds the initiative and has finished; Black, second, carries
    // out its Shoot order.
    const game = createPlayableGame(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'D-5', facing: 'south', player: 'white' },
      ],
      { initiative: 'white' },
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const shootCard = {
      ...createTestCard(),
      command: createTestCommand({ type: 'rangedAttack' }),
    };
    const withOrder = updatePlayerCardState(game, 'black', {
      ...game.cardState.black,
      inPlay: shootCard,
    });
    const state = updatePhaseState(
      withOrder,
      createIssueCommandsPhaseState(withOrder, {
        remainingUnitsSecondPlayer: [shooter.unit],
        step: 'secondPlayerResolveCommands',
      }),
    );

    // The step is Black's, so Black names the shooter.
    expect(getLegalRangedAttackers(state)).toStrictEqual({
      attackers: [shooter],
      player: 'black',
    });
  });

  it('throws when asked outside the issue commands phase, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createPlayableGame([], { initiative: 'black' }),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      },
    );
    expect(() => getLegalRangedAttackers(state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });

  it('throws on an issuing step, before there is an order to carry out', () => {
    // Black is still issuing its orders (§4.3).
    const game = createPlayableGame([], { initiative: 'black' });
    const state = updatePhaseState(
      game,
      createIssueCommandsPhaseState(game, {
        step: 'firstPlayerIssueCommands',
      }),
    );

    expect(() => getLegalRangedAttackers(state)).toThrow(
      'Not on a resolve commands step: firstPlayerIssueCommands',
    );
  });

  it('throws while a shot is under way, since the next shooter waits for it', () => {
    // A shot of Black's order is being resolved (§4.3.9).
    const ordered = blackShootingFromE5([
      { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
      { coord: 'D-5', facing: 'south', player: 'white' },
    ]);
    const state = updatePhaseState(
      ordered,
      createIssueCommandsPhaseState(ordered, {
        currentCommandResolutionState:
          createRangedAttackResolutionState(ordered),
      }),
    );

    expect(() => getLegalRangedAttackers(state)).toThrow(
      'A command is already being resolved',
    );
  });

  it('throws when the card in play is not a ranged attack order', () => {
    // Black's card in play orders a Move, not a Shoot.
    const game = createPlayableGame(
      [{ coord: 'E-5', facing: 'north', player: 'black', range: 2 }],
      { initiative: 'black' },
    );
    const unit = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-5');
    const state = resolvingMoveOrder(game, [unit.unit]);

    expect(() => getLegalRangedAttackers(state)).toThrow(
      'The card black has in play is not a ranged attack order',
    );
  });
});
