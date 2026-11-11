import type { AuthoritativeGameState } from '@game';
import {
  createChooseShooterEvent,
  createPerformRangedAttackEvent,
} from '@factories';
import {
  getOwnedPlayerCardState,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  createTestCard,
  readyToAimShot,
  resolvingShootOrder,
} from '@testing';
import { applyEvent } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * Carrying out a Shoot order for one unit (§4.3.11), played through the
 * engines: the player names the shooter, may commit a card for the shot —
 * whose Range reaches one space further — and only then names the target;
 * the target's owner may then commit for Defence or Flexibility (B1, B6).
 *
 * Black's Range-2 unit stands on E-5 facing north. White has a unit on C-7,
 * two ranks out and inside that Range, so black's unit has something to
 * shoot at and may be named; and a unit on B-5, three ranks out, one space
 * beyond it. Black holds one card that may be committed for Range.
 */
const rangeCard = createTestCard({ modifiers: ['range'] });

function blackReadyToShoot(): AuthoritativeGameState {
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
  const ready = resolvingShootOrder(game, [shooter.unit]);
  return ready;
}

/** Black names its shooter and commits the card for Range, or declines. */
function namedAndCommitted(committedCard: typeof rangeCard | null) {
  const ready = blackReadyToShoot();
  const shooter = getSingleUnitWithPlacementAtCoordinate(
    ready.boardState,
    'E-5',
  );
  const waiting = readyToAimShot(
    ready,
    shooter,
    committedCard === null
      ? null
      : { card: committedCard, modifierTypes: ['range'] },
  );
  return waiting;
}

describe('a Shoot order', () => {
  it('asks for the shooter, then the commitment, then the target', () => {
    // Play starts by waiting for black to name a shooter (§4.3.11 step 1).
    const start = applyEffectsUntilChoice(blackReadyToShoot());
    if (start.next === 'gameOver' || start.next.actionType !== 'playerChoice') {
      throw new Error('Play should wait on a player choice');
    }
    expect(start.next.choiceType).toBe('chooseShooter');

    // Once named, the shooter's commitment comes before the target (step 2).
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      start.state.boardState,
      'E-5',
    );
    const named = applyEffectsUntilChoice(
      applyEvent(
        createChooseShooterEvent({
          player: 'black',
          unit: shooter,
        }),
        start.state,
      ),
    );
    if (named.next === 'gameOver' || named.next.actionType !== 'playerChoice') {
      throw new Error('Play should wait on a player choice');
    }
    expect(named.next.choiceType).toBe('commitToRangedAttack');
    expect(named.next.playerSource).toBe('black');
  });

  it('a card committed for Range reaches a target one space beyond the shooter’s Range', () => {
    const state = namedAndCommitted(rangeCard);
    // B-5 is three ranks out: one more than the shooter's Range of 2.
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'B-5',
    );
    const shot = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [],
      targetUnit: target,
    });

    expect(validatePlayerChoice(shot, state)).toStrictEqual({ result: true });
    // The committed card has left black's hand (§8.1).
    expect(
      getOwnedPlayerCardState(state.cardState, 'black').inHand.map(
        (card) => card.id,
      ),
    ).not.toContain(rangeCard.id);
  });

  it('without the card, the same target is out of reach', () => {
    const state = namedAndCommitted(null);
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'B-5',
    );
    const shot = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [],
      targetUnit: target,
    });

    expect(validatePlayerChoice(shot, state).result).toBe(false);
  });

  it('once the target is named, its owner is asked for its commitment', () => {
    const state = namedAndCommitted(rangeCard);
    const target = getSingleUnitWithPlacementAtCoordinate(
      state.boardState,
      'B-5',
    );
    // Black aims at the far unit, reached with the Range card.
    const aimed = applyEffectsUntilChoice(
      applyEvent(
        createPerformRangedAttackEvent({
          player: 'black',
          supportingUnits: [],
          targetUnit: target,
        }),
        state,
      ),
    );
    if (aimed.next === 'gameOver' || aimed.next.actionType !== 'playerChoice') {
      throw new Error('Play should wait on a player choice');
    }

    // White, the target's owner, commits next (§4.3.11 step 5).
    expect(aimed.next.choiceType).toBe('commitToRangedDefense');
    expect(aimed.next.playerSource).toBe('white');
  });
});
