import type { GameStateForVisibility } from '@game';
import { createChooseRoutDiscardEvent, createMoveUnitEvent } from '@factories';
import {
  getIssueCommandsPhaseState,
  getOwnedPlayerCardState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  readyToWriteMove,
  resolvingMoveOrder,
} from '@testing';
import { addCommanderToBoard, applyEvent, updateBoardState } from '@transforms';

/**
 * Engaging from the rear (§6.3.3), played through the engines: the defender
 * routs off the board at once, the attacker takes its space, and the
 * defender's owner pays its Morale before the move is done.
 *
 * Black on F-5 facing north steps into the back of white on E-5, also facing
 * north. White holds five cards. What matters about the defender is the
 * Morale its rout costs (§9.3), and whether white's commander stands with it
 * (§4.2.8).
 */
function rearAttack(options: {
  defenderMorale: number;
  whiteHasAnotherUnit: boolean;
  whiteCommanderWithDefender?: boolean;
}): GameStateForVisibility<'authoritative'> {
  const game = createPlayableGame(
    [
      { coord: 'F-5', facing: 'north', player: 'black' },
      {
        coord: 'E-5',
        facing: 'north',
        morale: options.defenderMorale,
        player: 'white',
      },
      // Unless the scenario says otherwise, white keeps a second unit far
      // away, so it still has an army after the rout (§11.4).
      ...(options.whiteHasAnotherUnit
        ? [{ coord: 'A-1', facing: 'south', player: 'white' } as const]
        : []),
    ],
    { hands: { white: 5 }, initiative: 'black' },
  );
  // White's commander stands with the defender, if the case says so.
  const withCommander =
    options.whiteCommanderWithDefender === true
      ? updateBoardState(
          game,
          addCommanderToBoard(game.boardState, 'white', 'E-5'),
        )
      : game;
  const attacker = getSingleUnitWithPlacementAtCoordinate(
    withCommander.boardState,
    'F-5',
  );
  const resolving = resolvingMoveOrder(withCommander, [attacker.unit]);

  // Black names its attacker, declines to commit, and steps north into
  // the defender's back.
  const ready = readyToWriteMove(resolving, attacker, null);
  const moved = applyEvent(
    createMoveUnitEvent({
      moveCommander: false,
      path: ['step'],
      player: 'black',
    }),
    ready,
  );
  return moved;
}

describe('a rear engagement', () => {
  it('places the attacker before the defender is asked for its Morale', () => {
    const { state, next } = applyEffectsUntilChoice(
      rearAttack({ defenderMorale: 2, whiteHasAnotherUnit: true }),
    );

    // Play stops for white to pay...
    if (next === 'gameOver' || next.actionType !== 'playerChoice') {
      throw new Error('Play should wait on a player choice');
    }
    expect(next.choiceType).toBe('chooseRoutDiscard');
    expect(next.playerSource).toBe('white');
    // ...with the attacker already standing in the defender's space.
    expect(state.boardState.board['F-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    const target = state.boardState.board['E-5']?.unitPresence;
    expect(target?.presenceType === 'single' && target.unit.playerSide).toBe(
      'black',
    );
  });

  it("costs the defender's owner its Morale, and then the move is done", () => {
    const { state: awaitingDiscard, next } = applyEffectsUntilChoice(
      rearAttack({ defenderMorale: 2, whiteHasAnotherUnit: true }),
    );
    if (next === 'gameOver') {
      throw new Error('The game should not have ended');
    }

    // White pays the 2 Morale with its first two cards.
    const [first, second] = getOwnedPlayerCardState(
      awaitingDiscard.cardState,
      'white',
    ).inHand;
    const paid = applyEvent(
      createChooseRoutDiscardEvent({
        cardIds: [first.id, second.id],
        player: 'white',
      }),
      awaitingDiscard,
    );
    const { state } = applyEffectsUntilChoice(paid);

    // Two of white's five cards are gone, the attacker holds the space, and
    // black's move order has been carried out.
    expect(state.cardState.white.inHand).toHaveLength(3);
    const target = state.boardState.board['E-5']?.unitPresence;
    expect(target?.presenceType === 'single' && target.unit.playerSide).toBe(
      'black',
    );
    expect(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
    ).toBe('pending');
  });

  it('asks nothing of a defender worth no Morale, and the move is done', () => {
    // A defender worth no Morale: the rout closes without a discard.
    const { state } = applyEffectsUntilChoice(
      rearAttack({ defenderMorale: 0, whiteHasAnotherUnit: true }),
    );

    expect(state.cardState.white.inHand).toHaveLength(5);
    const target = state.boardState.board['E-5']?.unitPresence;
    expect(target?.presenceType === 'single' && target.unit.playerSide).toBe(
      'black',
    );
    expect(
      getIssueCommandsPhaseState(state).currentCommandResolutionState,
    ).toBe('pending');
  });

  it("ends the game at once when it routs the defender's last unit", () => {
    // §11.4: an army destroyed to the last unit loses before any discard.
    const { state, next } = applyEffectsUntilChoice(
      rearAttack({ defenderMorale: 2, whiteHasAnotherUnit: false }),
    );

    expect(next).toBe('gameOver');
    expect(state.winner).toBe('black');
  });

  it("fells the defender's commander, standing with it, as it routs", () => {
    // White's commander shares E-5 with the unit black routs from behind.
    const { state } = applyEffectsUntilChoice(
      rearAttack({
        defenderMorale: 2,
        whiteCommanderWithDefender: true,
        whiteHasAnotherUnit: true,
      }),
    );

    // §4.2.8: it falls with its own unit, and is gone for the rest of the game.
    expect(state.lostCommanders).toStrictEqual(['white']);
    expect(state.boardState.board['E-5']?.commanders).toStrictEqual([]);
    // Defeat costs no cards of its own: white still owes only the unit's
    // Morale, and has paid nothing yet.
    expect(state.cardState.white.inHand).toHaveLength(5);
  });
});
