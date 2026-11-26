import type { CommandCard, UnitInstance } from '@entities';
import type { AuthoritativeGameState, IssueCommandsPhaseState } from '@game';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createTestCard,
  createTestCommand,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { getLegalMoveUnits } from './getLegalMoveUnits';

/** Default createTestCard command type is movement. */
const movementCard = createTestCard();
/** In-play command that is not movement. */
const rangedCard = {
  ...createTestCard(),
  command: createTestCommand({ type: 'rangedAttack' }),
};

/** White's unit at E-5, alone in its space. */
const whiteUnit = createUnitWithPlacement({
  coordinate: 'E-5',
  facing: 'north',
  playerSide: 'white',
});

/**
 * Phase 3, white carrying out the order on the card it has in play, with the
 * given units still to act. White holds the initiative, as a new game
 * starts, so its step is the first player's unless the case says otherwise.
 */
function carryingOutOrder(
  board: AuthoritativeGameState,
  card: CommandCard,
  remaining: UnitInstance[],
  phase: Partial<IssueCommandsPhaseState> = {},
): AuthoritativeGameState {
  // White's card, face up in play this round.
  const withCard = updatePlayerCardState(
    board,
    'white',
    createOwnedCardState({ inPlay: card }),
  );

  // White's resolve step, the named units still to act, none moving yet.
  const issuing = createIssueCommandsPhaseState({
    remainingUnitsFirstPlayer: remaining,
    ...phase,
  });
  const resolving = updatePhaseState(withCard, issuing);
  return resolving;
}

/**
 * GetLegalMoveUnits: atomic remaining units (with placements) when awaiting
 * moveUnit to start a movement command resolution.
 *
 * A player carrying out a Move order names, one at a time, which of the units
 * it ordered moves next (§4.3.10 step 1). Only units still to act, standing on
 * the board and not locked in a fight (§6.1.2), may be named.
 */
describe('getLegalMoveUnits function', () => {
  it('returns the remaining unit with its board placement', () => {
    // White ordered its unit at E-5, which has not yet moved.
    const state = carryingOutOrder(
      createGameStateWithUnits([whiteUnit]),
      movementCard,
      [whiteUnit.unit],
    );

    // White may name it, and the offer says where it stands.
    expect(getLegalMoveUnits(state)).toStrictEqual({
      player: 'white',
      units: [whiteUnit],
    });
  });

  it('offers the second player its own units on its step', () => {
    // White, the first player, is done; black carries out its order.
    const blackUnit = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'south',
      playerSide: 'black',
    });
    const board = updatePlayerCardState(
      createGameStateWithUnits([blackUnit]),
      'black',
      createOwnedCardState({ inPlay: movementCard }),
    );
    const state = updatePhaseState(
      board,
      createIssueCommandsPhaseState({
        remainingUnitsSecondPlayer: [blackUnit.unit],
        step: 'secondPlayerResolveCommands',
      }),
    );

    // Black names the unit, not white.
    expect(getLegalMoveUnits(state)).toStrictEqual({
      player: 'black',
      units: [blackUnit],
    });
  });

  it('answers that nobody can move when the remaining unit is not on the board', () => {
    // The commanded unit routed earlier and no longer stands anywhere.
    const state = carryingOutOrder(
      createEmptyGameState('standard'),
      movementCard,
      [whiteUnit.unit],
    );

    // That is a real answer, not a mistake: the order ends with no move made.
    expect(getLegalMoveUnits(state)).toStrictEqual({
      player: 'white',
      units: [],
    });
  });

  it('does not offer a unit locked in a fight', () => {
    // White's ordered unit shares E-5 with a black unit that engaged it.
    const engaged = createTestUnit('white');
    const state = carryingOutOrder(
      createGameStateWithEngagedUnits(engaged, createTestUnit('black')),
      movementCard,
      [engaged],
    );

    // An engaged unit cannot move until its fight ends (§6.1.2).
    expect(getLegalMoveUnits(state)).toStrictEqual({
      player: 'white',
      units: [],
    });
  });

  it('throws when asked outside the issue commands phase, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() => getLegalMoveUnits(state)).toThrow(
      'Expected issueCommands phase, got playCards',
    );
  });

  it('throws while the player is still issuing orders, before any is carried out', () => {
    // White is choosing whom to order (§4.3.1); nothing moves yet.
    const state = carryingOutOrder(
      createGameStateWithUnits([whiteUnit]),
      movementCard,
      [],
      { step: 'firstPlayerIssueCommands' },
    );

    expect(() => getLegalMoveUnits(state)).toThrow(
      'Not on a resolve commands step: firstPlayerIssueCommands',
    );
  });

  it('throws while a unit is already moving, since each finishes before the next', () => {
    // White's unit is part-way through its move (§4.3.9).
    const board = createGameStateWithUnits([whiteUnit]);
    const state = carryingOutOrder(board, movementCard, [whiteUnit.unit], {
      currentCommandResolutionState: createMovementResolutionState(board),
    });

    expect(() => getLegalMoveUnits(state)).toThrow(
      'A command is already being resolved',
    );
  });

  it('throws when the card in play is not a movement order', () => {
    // White's card orders a Shoot, so no unit is named to move.
    const state = carryingOutOrder(
      createGameStateWithUnits([whiteUnit]),
      rangedCard,
      [whiteUnit.unit],
    );

    expect(() => getLegalMoveUnits(state)).toThrow(
      'The card white has in play is not a movement order',
    );
  });
});
