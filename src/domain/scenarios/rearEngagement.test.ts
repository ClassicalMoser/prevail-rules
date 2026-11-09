import type { GameStateForVisibility } from '@game';
import {
  createChooseMovingUnitEvent,
  createChooseRoutDiscardEvent,
  createCommitToMovementEvent,
  createMoveUnitEvent,
} from '@factories';
import {
  getIssueCommandsPhaseState,
  getOwnedPlayerCardState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  resolvingMoveOrder,
} from '@testing';
import { applyEvent } from '@transforms';

/**
 * Engaging from the rear (§6.3.3), played through the engines: the defender
 * routs off the board at once, the attacker takes its space, and the
 * defender's owner pays its Morale before the move is done.
 *
 * Black on F-5 facing north steps into the back of white on E-5, also facing
 * north. White holds five cards. What matters about the defender is the
 * Morale its rout costs (§9.3).
 */
function rearAttack(options: {
  defenderMorale: number;
  whiteHasAnotherUnit: boolean;
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
  const attacker = getSingleUnitWithPlacementAtCoordinate(
    game.boardState,
    'F-5',
  );
  const resolving = resolvingMoveOrder(game, [attacker.unit]);

  // Black names its attacker, declines to commit, and steps north into
  // the defender's back.
  const named = applyEvent(
    createChooseMovingUnitEvent({
      eventNumber: 0,
      player: 'black',
      unit: attacker,
    }),
    resolving,
  );
  const declined = applyEvent(
    createCommitToMovementEvent({
      committedCard: null,
      eventNumber: 1,
      modifierTypes: [],
      player: 'black',
    }),
    named,
  );
  const moved = applyEvent(
    createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: false,
      path: ['step'],
      player: 'black',
    }),
    declined,
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
        eventNumber: next.expectedEventNumber,
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
});
