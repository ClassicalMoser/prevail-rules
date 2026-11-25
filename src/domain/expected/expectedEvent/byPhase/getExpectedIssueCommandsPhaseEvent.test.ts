import { createEmptyGameState } from '@factories';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameState,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
  resolvingMoveOrder,
  resolvingShootOrder,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { getExpectedIssueCommandsPhaseEvent } from './getExpectedIssueCommandsPhaseEvent';

/**
 * Phase 3 (§4.3): the first player issues all their orders, then carries them
 * out one unit at a time; then the second player does the same. Between
 * units, the next is named, or the order ends when nobody is left who can act.
 *
 * Board: letters decrease toward north (A is northernmost). White holds the
 * initiative, as a new game starts, unless a case says otherwise.
 */
describe('getExpectedIssueCommandsPhaseEvent function', () => {
  it('given no unit the order could take, still asks for the allocation', () => {
    // Black is issuing, but no unit of its stands on the board.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, { step: 'firstPlayerIssueCommands' }),
    );

    // Ordering nobody is always a legal allocation (§4.3.2), so the player is
    // asked all the same, and the phase cannot stall.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'issueCommands',
      playerSource: 'black',
    });
  });

  it('given the second player is issuing, asks them for the allocation', () => {
    // Black has the initiative, so White issues second.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        step: 'secondPlayerIssueCommands',
      }),
    );

    // White is asked for all its orders at once (§4.3).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'issueCommands',
      playerSource: 'white',
    });
  });

  it('finishes the unit under way before naming the next', () => {
    // White, first, has named its unit on E-5 to move and not yet said
    // whether it commits a card for it.
    const game = createGameState([
      { coord: 'E-5', facing: 'north', player: 'white' },
    ]);
    const named = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const moving = createMovementResolutionState(game, {
      commitment: { commitmentType: 'pending' },
      movingUnit: named.unit,
      targetPlacement: 'pending',
    });
    const state = createGameStateResolvingCommand(moving, game);

    // The unit under way owes its commitment window first (§4.3.9, §4.3.10).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: 'white',
    });
  });

  it('asks the second player for what their own unit under way owes', () => {
    // White has finished; Black, second, has named its unit on E-6 to move
    // and not yet said whether it commits a card for it.
    const game = createGameState([
      { coord: 'E-6', facing: 'south', player: 'black' },
    ]);
    const named = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-6',
    );
    const moving = createMovementResolutionState(game, {
      commitment: { commitmentType: 'pending' },
      movingUnit: named.unit,
      targetPlacement: 'pending',
    });
    const state = updatePhaseState(
      game,
      createIssueCommandsPhaseState(game, {
        currentCommandResolutionState: moving,
        step: 'secondPlayerResolveCommands',
      }),
    );

    // Black, the player carrying out the order, is asked.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: 'black',
    });
  });

  it('asks for the next unit of a Move order while one is free to move', () => {
    // White's Move order names one unit, standing alone on E-5.
    const game = createGameState([
      { coord: 'E-5', facing: 'north', player: 'white' },
    ]);
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const state = resolvingMoveOrder(game, [ordered.unit]);

    // White names the unit to move next (§4.3.10 step 1).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: 'white',
    });
  });

  it('ends a Move order whose remaining units are all locked in a fight', () => {
    // White's Move order names one unit, engaged with a Black unit on E-5.
    const ordered = createTestUnit('white');
    const game = createGameStateWithEngagedUnits(
      ordered,
      createTestUnit('black'),
    );
    const state = resolvingMoveOrder(game, [ordered]);

    // An engaged unit cannot move (§6.1.2), so nobody is left who can, and
    // the order ends instead of waiting on a unit that cannot be named.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    });
  });

  it('asks for the next shooter of a Shoot order while one has a target', () => {
    // White's Range-2 unit on E-5 faces Black's, one space ahead.
    const game = createGameState([
      { coord: 'E-5', facing: 'north', player: 'white', range: 2 },
      { coord: 'D-5', facing: 'south', player: 'black' },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const state = resolvingShootOrder(game, [shooter.unit]);

    // White names the next shooter (§4.3.11 step 1).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseShooter',
      playerSource: 'white',
    });
  });

  it('ends a Shoot order whose remaining units have nothing to shoot at', () => {
    // White's Range-2 unit on E-5 has no enemy anywhere on the board.
    const game = createGameState([
      { coord: 'E-5', facing: 'north', player: 'white', range: 2 },
    ]);
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const state = resolvingShootOrder(game, [shooter.unit]);

    // A unit with no target is skipped (§4.3.11 step 1), so the order ends
    // instead of waiting on a shooter that cannot be named.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    });
  });

  it("given the first player's last ordered unit has moved, expects completeMovementCommand", () => {
    // Black is carrying out a Move order with no unit left to move.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = resolvingMoveOrder(base, []);

    // Ending the order is asked for as its own effect.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMovementCommand',
    });
  });

  it("given the first player's last ordered unit has shot, expects completeRangedAttackCommand", () => {
    // Black is carrying out a Shoot order with no unit left to shoot.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = resolvingShootOrder(base, []);

    // Ending the order is asked for as its own effect.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeRangedAttackCommand',
    });
  });

  it("reads the second player's own order and units on their resolve step", () => {
    // White has finished; Black, second, carries out a Move order for its
    // unit on E-6.
    const game = createGameState([
      { coord: 'E-6', facing: 'south', player: 'black' },
    ]);
    const ordered = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-6',
    );
    const withOrder = updatePlayerCardState(game, 'black', {
      ...game.cardState.black,
      inPlay: createTestCard(),
    });
    const state = updatePhaseState(
      withOrder,
      createIssueCommandsPhaseState(withOrder, {
        remainingUnitsSecondPlayer: [ordered.unit],
        step: 'secondPlayerResolveCommands',
      }),
    );

    // Black names the unit to move next.
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseMovingUnit',
      playerSource: 'black',
    });
  });

  it('ends the phase once both players have carried out their orders', () => {
    // Both players' orders are done.
    const base = createEmptyGameState('standard');
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, { step: 'complete' }),
    );

    // The melees are fought next (§4.4).
    expect(getExpectedIssueCommandsPhaseEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeIssueCommandsPhase',
    });
  });

  it('throws on a step Phase 3 does not have', () => {
    // A step no phase state can hold, forced past the type.
    const base = createEmptyGameState('standard');
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, { step: 'invalidStep' as never }), // a step the type forbids
    );

    // The exhaustive default names the step it was given.
    expect(() => getExpectedIssueCommandsPhaseEvent(state)).toThrow(
      'Invalid issueCommands phase state: invalidStep',
    );
  });
});
