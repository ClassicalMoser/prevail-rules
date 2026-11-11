import type { AuthoritativeGameState } from '@game';
import {
  createChooseShooterEvent,
  createCommitToRangedDefenseEvent,
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
  getUnitByTrait,
  readyToAimShot,
  resolvingShootOrder,
} from '@testing';
import { applyEvent } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * Carrying out a Shoot order for one unit (§4.3.11), played through the
 * engines: the player names the shooter, may commit a card for the shot —
 * whose Range reaches one space further — and only then names the target;
 * the target's owner may then commit for Defence or Flexibility (B6).
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
  const waiting = readyToAimShot(ready, shooter, committedCard);
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

/**
 * What a card committed to a shot does to its outcome, played through the
 * engines from the commitment to the result.
 *
 * Black's Range-2 unit (Attack 2) shoots a white cavalry unit two ranks out on
 * C-5 (Retreat 3, Reverse 5, Rout 7), facing south. A shot of 2 falls short of
 * its Retreat; a committed Attack card makes it 3, which reaches it, and the
 * cavalry falls back one space, to B-5. Each side keeps a second unit far from
 * the fight, so neither army is down to its last unit (§11.4).
 */
describe('a card committed to a shot', () => {
  const attackCard = createTestCard({ modifiers: ['attack'] });

  /** Black shoots the cavalry, committing this card (or none); white declines to defend. */
  function shotAtCavalry(committed: typeof attackCard | null) {
    const game = createPlayableGame(
      [
        { coord: 'E-5', facing: 'north', player: 'black', range: 2 },
        { coord: 'I-1', facing: 'north', instanceNumber: 2, player: 'black' },
        {
          coord: 'C-5',
          facing: 'south',
          player: 'white',
          unitType: getUnitByTrait('cavalry'),
        },
        { coord: 'A-9', facing: 'south', instanceNumber: 2, player: 'white' },
      ],
      {
        hands: { black: [attackCard, createTestCard()] },
        initiative: 'black',
      },
    );
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'C-5',
    );
    const waiting = readyToAimShot(
      resolvingShootOrder(game, [shooter.unit]),
      shooter,
      committed,
    );

    // Black aims at the cavalry, and white, its owner, declines to commit.
    const aimed = applyEffectsUntilChoice(
      applyEvent(
        createPerformRangedAttackEvent({
          player: 'black',
          supportingUnits: [],
          targetUnit: target,
        }),
        waiting,
      ),
    );
    const defended = applyEffectsUntilChoice(
      applyEvent(
        createCommitToRangedDefenseEvent({
          committedCard: null,
          player: 'white',
        }),
        aimed.state,
      ),
    );
    return defended.state;
  }

  it('without the card, the shot falls short of the cavalry’s Retreat and it stays put', () => {
    const state = shotAtCavalry(null);

    expect(state.boardState.board['C-5']?.unitPresence.presenceType).toBe(
      'single',
    );
    expect(state.boardState.board['B-5']?.unitPresence.presenceType).toBe(
      'none',
    );
  });

  it('with an Attack card committed, the shot reaches its Retreat and the cavalry falls back a space', () => {
    const state = shotAtCavalry(attackCard);

    expect(state.boardState.board['C-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(state.boardState.board['B-5']?.unitPresence.presenceType).toBe(
      'single',
    );
  });
});
