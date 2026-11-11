import type { AuthoritativeGameState } from '@game';
import { createChooseMovingUnitEvent, createMoveUnitEvent } from '@factories';
import {
  getOwnedPlayerCardState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  createTestCard,
  readyToWriteMove,
  resolvingMoveOrder,
} from '@testing';
import { applyEvent } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * Carrying out a Move order for one unit (§4.3.10), played through the
 * engines: the player names the unit, may commit a card for +1 Speed or
 * Flexibility, and only then writes the move — which the card counts toward.
 *
 * Black's Speed-2 unit stands on E-5 facing north, with nothing in its way;
 * black holds one card that may be committed for Speed. White keeps a unit
 * far off, so both armies stay in the field.
 */
const speedCard = createTestCard({ modifiers: ['speed'] });

function blackReadyToMove(): AuthoritativeGameState {
  const game = createPlayableGame(
    [
      { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      { coord: 'A-1', facing: 'south', player: 'white' },
    ],
    { hands: { black: [speedCard, createTestCard()] }, initiative: 'black' },
  );
  const mover = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'E-5');
  const ready = resolvingMoveOrder(game, [mover.unit]);
  return ready;
}

/** Black names its unit and commits the card for Speed, or declines. */
function namedAndCommitted(committedCard: typeof speedCard | null) {
  const ready = blackReadyToMove();
  const mover = getSingleUnitWithPlacementAtCoordinate(ready.boardState, 'E-5');
  const waiting = readyToWriteMove(
    ready,
    mover,
    committedCard === null
      ? null
      : { card: committedCard, modifierTypes: ['speed'] },
  );
  return waiting;
}

describe('a Move order', () => {
  it('asks for the unit, then the commitment, then the move', () => {
    // Play starts by waiting for black to name a unit.
    const start = applyEffectsUntilChoice(blackReadyToMove());
    if (start.next === 'gameOver' || start.next.actionType !== 'playerChoice') {
      throw new Error('Play should wait on a player choice');
    }
    expect(start.next.choiceType).toBe('chooseMovingUnit');

    // Once named, the commitment comes before the move (§4.3.10).
    const mover = getSingleUnitWithPlacementAtCoordinate(
      start.state.boardState,
      'E-5',
    );
    const named = applyEffectsUntilChoice(
      applyEvent(
        createChooseMovingUnitEvent({
          player: 'black',
          unit: mover,
        }),
        start.state,
      ),
    );
    if (named.next === 'gameOver' || named.next.actionType !== 'playerChoice') {
      throw new Error('Play should wait on a player choice');
    }
    expect(named.next.choiceType).toBe('commitToMovement');
    expect(named.next.playerSource).toBe('black');
  });

  it('counts a card committed for Speed toward the move', () => {
    const state = namedAndCommitted(speedCard);
    // Three steps north: one more than the unit's Speed of 2.
    const move = createMoveUnitEvent({
      moveCommander: false,
      path: ['step', 'step', 'step'],
      player: 'black',
    });

    expect(validatePlayerChoice(move, state)).toStrictEqual({ result: true });
    const moved = applyEvent(move, state);
    const arrived = moved.boardState.board['B-5']?.unitPresence;
    expect(arrived?.presenceType === 'single' && arrived.unit.playerSide).toBe(
      'black',
    );
    // The committed card has left black's hand.
    expect(
      getOwnedPlayerCardState(moved.cardState, 'black').inHand.map(
        (card) => card.id,
      ),
    ).not.toContain(speedCard.id);
  });

  it('without the card, the same move is more than the unit can make', () => {
    const state = namedAndCommitted(null);
    const move = createMoveUnitEvent({
      moveCommander: false,
      path: ['step', 'step', 'step'],
      player: 'black',
    });

    expect(validatePlayerChoice(move, state).result).toBe(false);
  });
});
