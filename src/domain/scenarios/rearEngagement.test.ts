import type { UnitType } from '@entities';
import type { GameStateForVisibility } from '@game';
import {
  createChooseRoutDiscardEvent,
  createEmptyGameState,
  createUnitInstance,
} from '@factories';
import { getIssueCommandsPhaseState, getOwnedPlayerCardState } from '@queries';
import {
  applyEffectsUntilChoice,
  createIssueCommandsPhaseState,
  createTestCommand,
  getCardsByCount,
} from '@testing';
import { tempUnits } from '@sampleValues';
import { throwIfUndefined } from '@utils';

import {
  addUnitToBoard,
  applyEvent,
  updateBoardState,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

// What matters about each defender is the Morale its rout costs (§9.3); the
// stand-in catalog has both a costly unit and one worth nothing.
const moraleTwo = throwIfUndefined(
  tempUnits.find((unitType) => unitType.morale === 2),
  'The stand-in catalog has a unit with Morale 2',
);
const moraleZero = throwIfUndefined(
  tempUnits.find((unitType) => unitType.morale === 0),
  'The stand-in catalog has a unit with Morale 0',
);

/**
 * Engaging from the rear (§6.3.3), played through the engines: the defender
 * routs off the board at once, the attacker takes its space, and the
 * defender's owner pays its Morale before the move is done.
 *
 * Black on F-5 facing north steps into the back of white on E-5, also facing
 * north. White holds five cards, black two.
 */
function rearAttack(options: {
  defenderType: UnitType;
  whiteHasAnotherUnit: boolean;
}): GameStateForVisibility<'authoritative'> {
  const attacker = createUnitInstance('black', moraleTwo, 1);
  const defender = createUnitInstance('white', options.defenderType, 1);
  let state = createEmptyGameState('standard');

  // White's hand, to pay the Morale from. Black needs cards too: an empty
  // hand would lose before the attack resolved (§11.1).
  state = updatePlayerCardState(state, 'white', {
    ...state.cardState.white,
    inHand: getCardsByCount(5),
  });
  state = updatePlayerCardState(state, 'black', {
    ...state.cardState.black,
    inHand: getCardsByCount(2),
  });

  // The two units, and — unless the scenario says otherwise — a second white
  // unit far away, so white still has an army after the rout (§11.4).
  let board = addUnitToBoard(state.boardState, {
    placement: { coordinate: 'F-5', facing: 'north' },
    unit: attacker,
  });
  board = addUnitToBoard(board, {
    placement: { coordinate: 'E-5', facing: 'north' },
    unit: defender,
  });
  if (options.whiteHasAnotherUnit) {
    board = addUnitToBoard(board, {
      placement: { coordinate: 'A-1', facing: 'south' },
      unit: createUnitInstance('white', moraleZero, 2),
    });
  }
  state = updateBoardState(state, board);

  // Black is resolving a move order with this one unit. White has an order
  // of its own still to give, which is where play waits once black is done.
  state = updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: 'pending',
      remainingCommandsSecondPlayer: [createTestCommand()],
      remainingUnitsFirstPlayer: [attacker],
      step: 'firstPlayerResolveCommands',
    }),
  );

  // One step north, into the defender's back.
  const moved = applyEvent(
    {
      choiceType: 'moveUnit',
      eventNumber: 0,
      eventType: 'playerChoice',
      moveCommander: false,
      path: ['step'],
      player: 'black',
      unit: {
        placement: { coordinate: 'F-5', facing: 'north' },
        unit: attacker,
      },
    },
    state,
  );
  return moved;
}

describe('a rear engagement', () => {
  it('places the attacker before the defender is asked for its Morale', () => {
    // A defender whose rout costs 2 Morale.
    const { state, next } = applyEffectsUntilChoice(
      rearAttack({ defenderType: moraleTwo, whiteHasAnotherUnit: true }),
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
      rearAttack({ defenderType: moraleTwo, whiteHasAnotherUnit: true }),
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
      rearAttack({ defenderType: moraleZero, whiteHasAnotherUnit: true }),
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
      rearAttack({ defenderType: moraleTwo, whiteHasAnotherUnit: false }),
    );

    expect(next).toBe('gameOver');
    expect(state.winner).toBe('black');
  });
});
