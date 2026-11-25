import type { GameState } from '@game';
import { createChooseRoutDiscardEvent, createEmptyGameState } from '@factories';
import {
  getCleanupPhaseState,
  getIssueCommandsPhaseState,
  getResolveMeleePhaseState,
  getRetreatStateFromAttackApply,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  withRoutOwing,
} from '@testing';
import {
  projectGameStateForVisibility,
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { throwIfBypassed, throwIfPending } from '@utils';

import { applyChooseRoutDiscardEvent } from './applyChooseRoutDiscardEvent';

/**
 * ChooseRoutDiscard completes an awaiting rout: discard cards and mark the rout
 * complete (and rear engagement complete when applicable). Units already left
 * the board when the rout opened.
 */
describe('applyChooseRoutDiscardEvent function', () => {
  // White's hand: the card it pays with, and the card it keeps. Paying one
  // still leaves white a hand (§11.2).
  const paid = createTestCard();
  const kept = createTestCard();

  /** The given game, with white holding those two cards. */
  function withWhiteHolding(state: GameState): GameState {
    const empty = createEmptyGameState('standard');
    const holding = updateCardState(state, {
      ...empty.cardState,
      white: { ...empty.cardState.white, inHand: [paid, kept] },
    });
    return holding;
  }

  /** White pays the one card it owes with the first card in its hand. */
  const whitePaysFirstCard = createChooseRoutDiscardEvent({
    cards: [paid],
    player: 'white',
  });

  it('pays a rout at the support check, and the rally closes with it', () => {
    // White, first in cleanup, rallied and a unit it could not hold routed;
    // its Morale costs one card (§10.4.6, §10.4.7).
    const state = withRoutOwing(
      withWhiteHolding(createEmptyGameState('standard')),
      'white',
      1,
    );

    const next = applyChooseRoutDiscardEvent(whitePaysFirstCard, state);

    // The card is paid from white's hand to its discard (§9.3.2)…
    expect(next.cardState.white.inHand).toStrictEqual([kept]);
    expect(next.cardState.white.discarded).toStrictEqual([paid]);
    // …and with nothing left to pay, the rally is over and black chooses
    // whether to rally (§10.3.6).
    const cleanup = getCleanupPhaseState(next);
    expect(cleanup.step).toBe('secondPlayerChooseRally');
    const rally = throwIfPending(
      cleanup.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(rally.completed).toBe(true);
    const rout = throwIfBypassed(
      throwIfPending(rally.routState, 'rout'),
      'rout',
    );
    expect(rout).toMatchObject({ cardsChosen: true, completed: true });
  });

  it('given rear engagement rout, discards and completes engagement', () => {
    // Black, holding the initiative, moved in behind white's unit, which
    // routed on the spot and owes one card for its Morale (§6.3.3).
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'white',
    });
    const routState = createRoutState('white', defender.unit, {
      numberToDiscard: 1,
    });
    const state = withWhiteHolding(
      updateCurrentInitiative(
        createGameStateMovingInto(createRearEngagementState({ routState })),
        'black',
      ),
    );

    const next = applyChooseRoutDiscardEvent(whitePaysFirstCard, state);

    // The rear engagement was only the rout, so it is over and the move can
    // finish…
    const crs = throwIfPending(
      getIssueCommandsPhaseState(next).currentCommandResolutionState,
      'crs',
    );
    if (crs.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(crs.engagementState, 'engagement');
    expect(engagement.completed).toBe(true);
    if (engagement.engagementResolutionState.engagementType !== 'rear') {
      throw new Error('rear');
    }
    expect(engagement.engagementResolutionState.completed).toBe(true);
    expect(engagement.engagementResolutionState.routState.completed).toBe(true);
    // …and white paid with the card it named.
    expect(next.cardState.white.inHand).toStrictEqual([kept]);
  });

  /**
   * §9.1.6: a unit hit to Retreat with nowhere to go routs instead, and that
   * rout sits inside the retreat. Here white's unit on E-6 is already off the
   * board (a rout takes the unit away when it opens), and white, holding two
   * cards, owes one for its Morale. The caller places the retreat in the
   * attack or engagement that forced it.
   */
  function whiteOwingFromRetreat() {
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'white',
    });
    // No legal retreat options is what made this a rout; one card owed.
    const retreatState = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender, [enemyCuttingOffRetreat(defender)]),
      {
        routState: createRoutState('white', defender.unit, {
          numberToDiscard: 1,
        }),
      },
    );
    return { defender, retreatState };
  }

  it('a ranged attack whose target had nowhere to retreat lets it pay its rout', () => {
    const { defender, retreatState } = whiteOwingFromRetreat();
    // The rout is held by the retreat, which sits in the ranged attack's apply.
    // Black, holding the initiative, is the one shooting.
    const base = withWhiteHolding(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
    );
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender.unit,
        retreatState.legalRetreatPaths,
        { retreatState },
      ),
      defendingUnit: defender.unit,
    });
    const state = createGameStateResolvingCommand(shot, base);

    const next = applyChooseRoutDiscardEvent(whitePaysFirstCard, state);

    // The payment is written where the rout lives, and the retreat closes
    // with it: the unit has gone, so there is nothing left to move.
    const crs = throwIfPending(
      getIssueCommandsPhaseState(next).currentCommandResolutionState,
      'crs',
    );
    if (crs.commandResolutionType !== 'rangedAttack') {
      throw new Error('rangedAttack');
    }
    const apply = throwIfPending(crs.attackApplyState, 'apply');
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(apply),
      'retreat',
    );
    const rout = throwIfBypassed(
      throwIfPending(retreat.routState, 'rout'),
      'rout',
    );
    expect(rout.completed).toBe(true);
    expect(retreat.completed).toBe(true);
    // White's first card is the one gone.
    expect(next.cardState.white.inHand).toStrictEqual([kept]);
  });

  it('refuses a rout inside a front engagement’s retreat, which cannot happen', () => {
    const { retreatState } = whiteOwingFromRetreat();
    // A defender met head-on is offered a retreat only if it has somewhere to
    // go (§6.3.2), so no front engagement's retreat can hold a rout. This
    // state is built by hand to show that one is refused, not paid.
    const base = withWhiteHolding(createEmptyGameState('standard'));
    const state = createGameStateResolvingCommand(
      createMovementResolutionState(base, {
        engagementState: createFrontEngagementState({ retreatState }),
      }),
      base,
    );

    expect(() =>
      applyChooseRoutDiscardEvent(whitePaysFirstCard, state),
    ).toThrow('A front engagement’s retreat holds a rout');
  });

  it('a melee whose unit had nowhere to retreat lets its owner pay the rout', () => {
    const { defender, retreatState } = whiteOwingFromRetreat();
    // Black holds initiative, so white's apply is the second slot (§7.5.6).
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        defender.unit,
        retreatState.legalRetreatPaths,
        { retreatState },
      ),
    });
    const state = withWhiteHolding(
      createGameStateResolvingMelee(melee, 'black'),
    );

    const next = applyChooseRoutDiscardEvent(whitePaysFirstCard, state);

    // The payment finds white's slot, not black's, and closes its retreat.
    const fought = throwIfPending(
      getResolveMeleePhaseState(next).currentMeleeResolutionState,
      'melee',
    );
    const apply = throwIfPending(
      fought.attackOnSecondPlayerApplyState,
      'apply',
    );
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(apply),
      'retreat',
    );
    expect(retreat.completed).toBe(true);
    expect(next.cardState.white.inHand).toStrictEqual([kept]);
  });

  it("takes the discarded cards out of an opponent's hand it cannot see", () => {
    // Black is routed, and white's seat folds black's discard. It cannot read
    // black's hand, only that black holds two cards, and the discard is face
    // up, so black's hand is one card smaller afterwards.
    const blackHand = [createTestCard(), createTestCard()];
    const empty = createEmptyGameState('standard');
    const blackHolding = updateCardState(empty, {
      ...empty.cardState,
      black: { ...empty.cardState.black, inHand: blackHand },
    });
    const full = withRoutOwing(blackHolding, 'black', 1);
    const whiteSeen = projectGameStateForVisibility(full, 'whiteSeen');

    const next = applyChooseRoutDiscardEvent(
      createChooseRoutDiscardEvent({ cards: [blackHand[0]], player: 'black' }),
      whiteSeen,
    );

    // One of the two hidden cards is gone, and the card shown lies in
    // black's discard for everyone to see.
    expect(next.cardState.black.inHand).toStrictEqual(['hidden']);
    expect(next.cardState.black.discarded).toStrictEqual([blackHand[0]]);
  });

  it('throws when nothing is routing', () => {
    // Phase 1: nobody's unit has routed, so no Morale is owed.
    const state = createEmptyGameState('standard');
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );

    expect(() =>
      applyChooseRoutDiscardEvent(whitePaysFirstCard, stateInPlayCards),
    ).toThrow('No rout is in play for white');
  });
});
