import type { AuthoritativeGameState } from '@game';
import {
  createChooseShooterEvent,
  createCommitToRangedDefenseEvent,
  createPerformRangedAttackEvent,
} from '@factories';
import { getLegalRangedAttackers } from '@legality';
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

/**
 * A Shoot order with several shooters (§4.3.11): each shot is its own step,
 * and a unit with no target when the next shooter is chosen is skipped for
 * that choice only. A later shot may change the board so that it has one.
 *
 * Black orders three units. A, on E-1, shoots a white unit two ranks out on
 * C-1. B, on A-5 facing south with a Range of 1, has nothing in reach at first:
 * the white cavalry on C-5 is two ranks off. C, on E-5, shoots that cavalry
 * with an Attack card committed, so it falls back a space, to B-5, and so into
 * B's reach.
 */
describe('a Shoot order with several shooters', () => {
  // C's own Attack of 2 falls short of the cavalry's Retreat of 3; the card
  // committed to its shot makes it 3, which reaches it.
  const attackCard = createTestCard({ modifiers: ['attack'] });

  function threeShooters() {
    const game = createPlayableGame(
      [
        { coord: 'E-1', facing: 'north', player: 'black', range: 2 },
        {
          coord: 'A-5',
          facing: 'south',
          instanceNumber: 2,
          player: 'black',
          range: 1,
        },
        {
          coord: 'E-5',
          facing: 'north',
          instanceNumber: 3,
          player: 'black',
          range: 2,
        },
        { coord: 'C-1', facing: 'south', player: 'white' },
        {
          coord: 'C-5',
          facing: 'south',
          instanceNumber: 2,
          player: 'white',
          unitType: getUnitByTrait('cavalry'),
        },
      ],
      { hands: { black: [attackCard, createTestCard()] }, initiative: 'black' },
    );
    const at = (coordinate: 'E-1' | 'A-5' | 'E-5' | 'C-1' | 'C-5') =>
      getSingleUnitWithPlacementAtCoordinate(game.boardState, coordinate);
    const order = resolvingShootOrder(game, [
      at('E-1').unit,
      at('A-5').unit,
      at('E-5').unit,
    ]);
    return { at, order };
  }

  /** The named shooter shoots the named target, and the target's owner declines to defend. */
  function shootsAndIsUndefended(
    state: AuthoritativeGameState,
    shooter: ReturnType<typeof getSingleUnitWithPlacementAtCoordinate>,
    target: ReturnType<typeof getSingleUnitWithPlacementAtCoordinate>,
    committed: typeof attackCard | null = null,
  ) {
    const aimed = applyEffectsUntilChoice(
      applyEvent(
        createPerformRangedAttackEvent({
          player: 'black',
          supportingUnits: [],
          targetUnit: target,
        }),
        readyToAimShot(state, shooter, committed),
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
    return defended;
  }

  it('offers a unit that had no target at one shot once a later shot gives it one', () => {
    const { at, order } = threeShooters();

    // A shoots first. B has nothing in reach at this moment, so only A and C
    // were offered, and B is skipped for this choice (§4.3.11 step 1).
    const afterA = shootsAndIsUndefended(order, at('E-1'), at('C-1'));
    // C then shoots the cavalry, which falls back to B-5, into B's reach.
    const afterC = shootsAndIsUndefended(
      afterA.state,
      at('E-5'),
      at('C-5'),
      attackCard,
    );

    // The cavalry did fall back to B-5, one space from B.
    expect(
      afterC.state.boardState.board['B-5']?.unitPresence.presenceType,
    ).toBe('single');

    // B has a target now, so it is offered to shoot: the order is not over.
    if (afterC.next === 'gameOver') {
      throw new Error('The game should not be over');
    }
    expect(afterC.next).toMatchObject({
      actionType: 'playerChoice',
      choiceType: 'chooseShooter',
      playerSource: 'black',
    });
    const offered = getLegalRangedAttackers(afterC.state).attackers.map(
      (entry) => entry.unit,
    );
    expect(offered).toStrictEqual([at('A-5').unit]);
  });

  it('ends the player’s orders once every shooter with a target has shot', () => {
    const { at, order } = threeShooters();
    // The same order without B: only A and C are ordered.
    const twoShooters = resolvingShootOrder(order, [
      at('E-1').unit,
      at('E-5').unit,
    ]);

    const afterA = shootsAndIsUndefended(twoShooters, at('E-1'), at('C-1'));
    const afterC = shootsAndIsUndefended(
      afterA.state,
      at('E-5'),
      at('C-5'),
      attackCard,
    );

    // Nobody is left to shoot, so black's orders are done and white, the
    // second player, is next to issue an order (§4.3).
    if (afterC.next === 'gameOver') {
      throw new Error('The game should not be over');
    }
    expect(afterC.next).toMatchObject({
      actionType: 'playerChoice',
      choiceType: 'issueCommand',
      playerSource: 'white',
    });
  });
});
