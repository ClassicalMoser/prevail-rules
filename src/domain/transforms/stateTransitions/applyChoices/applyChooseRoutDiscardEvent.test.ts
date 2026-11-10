import { tempCommandCards } from '@sampleValues';
import type { ChooseRoutDiscardEvent } from '@events';
import { throwIfBypassed, throwIfNone, throwIfPending } from '@utils';
import {
  getIssueCommandsPhaseState,
  getResolveMeleePhaseState,
  getRetreatStateFromAttackApply,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createCleanupPhaseState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRetreatState,
  createRoutState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
  updateCardState,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing';

import { updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseRoutDiscardEvent } from './applyChooseRoutDiscardEvent';

import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms/pureTransforms/state/updateCurrentInitiative';
/**
 * ChooseRoutDiscard completes an awaiting rout: discard cards and mark the rout
 * complete (and rear engagement complete when applicable). Units already left
 * the board when the rout opened.
 */
describe('applyChooseRoutDiscardEvent function', () => {
  function createStateInResolveRallyWithRout(
    step: 'firstPlayerResolveRally' | 'secondPlayerResolveRally',
    player: 'white' | 'black',
  ) {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const unit = createTestUnit(player, { attack: 2 });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState(player, unit, { numberToDiscard: 0 }),
    });
    const phaseState = createCleanupPhaseState({
      firstPlayerRallyResolutionState:
        step === 'firstPlayerResolveRally' ? rallyState : undefined,
      secondPlayerRallyResolutionState:
        step === 'secondPlayerResolveRally' ? rallyState : undefined,
      step,
    });
    return updatePhaseState(state, phaseState);
  }

  it('given firstPlayerResolveRally rout for white, completes rout and advances cleanup', () => {
    const state = createStateInResolveRallyWithRout(
      'firstPlayerResolveRally',
      'white',
    );
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rallyState = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    const rout = throwIfPending(rallyState.routState, 'rout');
    expect(rallyState.completed).toBe(true);
    expect(rout.cardsChosen).toBe(true);
    expect(rout.completed).toBe(true);
  });

  it('given secondPlayerResolveRally rout for black, completes rout and advances cleanup', () => {
    const state = createStateInResolveRallyWithRout(
      'secondPlayerResolveRally',
      'black',
    );
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const newState = applyChooseRoutDiscardEvent(event, state);
    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('complete');
    const rallyState = throwIfPending(
      phase.secondPlayerRallyResolutionState,
      'rally',
    );
    expect(rallyState.completed).toBe(true);
    expect(throwIfPending(rallyState.routState, 'rout').cardsChosen).toBe(true);
    expect(throwIfPending(rallyState.routState, 'rout').completed).toBe(true);
  });

  it('given rear engagement rout, discards and completes engagement', () => {
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'white',
    });
    let state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    state = updateCardState(state, {
      ...state.cardState,
      white: {
        ...state.cardState.white,
        inHand: [tempCommandCards[2], tempCommandCards[3]],
      },
    });
    // The unit already left when the rout opened; only the discard remains.
    state = { ...state, routedUnits: [defender.unit] };
    const routState = createRoutState('white', defender.unit, {
      numberToDiscard: 1,
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state, {
          engagementState: createRearEngagementState({ routState }),
          movingUnit: createUnitWithPlacement({
            coordinate: 'E-6',
            facing: 'north',
            playerSide: 'black',
          }),
          targetPlacement: { coordinate: 'E-6', facing: 'north' },
        }),
      }),
    );

    const next = applyChooseRoutDiscardEvent(
      {
        cardIds: [tempCommandCards[2].id],
        choiceType: 'chooseRoutDiscard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
      state,
    );

    const phase = getIssueCommandsPhaseState(next);
    const crs = throwIfPending(phase.currentCommandResolutionState, 'crs');
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
    expect(next.routedUnits).toContainEqual(defender.unit);
    expect(next.cardState.white.inHand.map((c) => c.id)).toStrictEqual([
      tempCommandCards[3].id,
    ]);
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
    // Two cards in hand: paying one still leaves white a hand, so the
    // discard is the only thing the event can change.
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      white: {
        ...state.cardState.white,
        inHand: [tempCommandCards[2], tempCommandCards[3]],
      },
    });
    state = { ...state, routedUnits: [defender.unit] };
    // No legal retreat options is what made this a rout; one card owed.
    const retreatState = createRetreatState(
      defender,
      legalRetreatsOf(defender, [enemyCuttingOffRetreat(defender)]),
      {
        routState: createRoutState('white', defender.unit, {
          numberToDiscard: 1,
        }),
      },
    );
    return { defender, retreatState, state };
  }

  /** White pays the one card it owes with the first card in its hand. */
  const whitePaysFirstCard = {
    cardIds: [tempCommandCards[2].id],
    choiceType: 'chooseRoutDiscard' as const,
    eventNumber: 0,
    eventType: 'playerChoice' as const,
    player: 'white' as const,
  };

  it('a ranged attack whose target had nowhere to retreat lets it pay its rout', () => {
    const { defender, retreatState, state: base } = whiteOwingFromRetreat();
    // The rout is held by the retreat, which sits in the ranged attack's apply.
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        currentCommandResolutionState: createRangedAttackResolutionState(base, {
          attackApplyState: createAttackApplyStateWithRetreat(
            defender,
            legalRetreatsOf(defender),
            {
              retreatState,
            },
          ),
        }),
      }),
    );

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
    expect(next.cardState.white.inHand.map((c) => c.id)).toStrictEqual([
      tempCommandCards[3].id,
    ]);
  });

  it('a front engagement whose defender had nowhere to retreat lets it pay its rout', () => {
    const { retreatState, state: base } = whiteOwingFromRetreat();
    // The rout is held by the retreat of a front engagement during a move.
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        currentCommandResolutionState: createMovementResolutionState(base, {
          engagementState: createFrontEngagementState({ retreatState }),
        }),
      }),
    );

    const next = applyChooseRoutDiscardEvent(whitePaysFirstCard, state);

    // The retreat is closed, so the engagement can go on to place the
    // engaging unit (§6.3.2).
    const crs = throwIfPending(
      getIssueCommandsPhaseState(next).currentCommandResolutionState,
      'crs',
    );
    if (crs.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(crs.engagementState, 'engagement');
    if (engagement.engagementResolutionState.engagementType !== 'front') {
      throw new Error('front');
    }
    const retreat = engagement.engagementResolutionState.retreatState;
    expect(retreat !== 'pending' && retreat.completed).toBe(true);
    expect(next.cardState.white.inHand).toHaveLength(1);
  });

  it('a melee whose unit had nowhere to retreat lets its owner pay the rout', () => {
    const { defender, retreatState, state: base } = whiteOwingFromRetreat();
    // Black holds initiative, so white's apply is the second slot (§7.5.6).
    const state = updatePhaseState(
      updateCurrentInitiative(base, 'black'),
      createResolveMeleePhaseState(base, {
        currentMeleeResolutionState: createMeleeResolutionState(base, {
          secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
            defender,
            retreatState.legalRetreatPaths,
            { retreatState },
          ),
        }),
      }),
    );

    const next = applyChooseRoutDiscardEvent(whitePaysFirstCard, state);

    // The payment finds white's slot, not black's, and closes its retreat.
    const melee = throwIfPending(
      getResolveMeleePhaseState(next).currentMeleeResolutionState,
      'melee',
    );
    const apply = throwIfPending(melee.secondPlayerAttackApplyState, 'apply');
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(apply),
      'retreat',
    );
    expect(retreat.completed).toBe(true);
    expect(next.cardState.white.inHand).toHaveLength(1);
  });

  it('throws when nothing is routing', () => {
    const state = createEmptyGameState('standard');
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInPlayCards)).toThrow(
      'No rout is in play',
    );
  });

  it('throws when the cleanup step holds no rout', () => {
    const state = createEmptyGameState('standard');
    const phaseState = createCleanupPhaseState({
      step: 'discardPlayedCards',
    });
    const stateInCleanup = updatePhaseState(state, phaseState);
    const event: ChooseRoutDiscardEvent = {
      cardIds: [],
      choiceType: 'chooseRoutDiscard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
    };

    expect(() => applyChooseRoutDiscardEvent(event, stateInCleanup)).toThrow(
      'No rout is in play',
    );
  });
});
