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

  it('a rout held by a retreat is paid, and the retreat closes with it', () => {
    // §9.1.6: a unit hit to Retreat with nowhere to go routs instead. The
    // rout sits inside the retreat, so paying it must write there.
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'white',
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      white: {
        ...state.cardState.white,
        inHand: [tempCommandCards[2], tempCommandCards[3]],
      },
    });
    state = { ...state, routedUnits: [defender.unit] };
    const retreatState = createRetreatState(defender, {
      legalRetreatOptions: [],
      routState: createRoutState('white', defender.unit, {
        numberToDiscard: 1,
      }),
    });
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          state,
          {
            attackApplyState: createAttackApplyStateWithRetreat(defender, {
              retreatState,
            }),
          },
        ),
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
    expect(retreat.completed).toBe(true);
    const rout = throwIfPending(retreat.routState, 'rout');
    expect(rout !== 'bypassed' && rout.completed).toBe(true);
    expect(next.cardState.white.inHand.map((c) => c.id)).toStrictEqual([
      tempCommandCards[3].id,
    ]);
  });

  /**
   * White's unit on E-6 had nowhere to retreat and routs from inside the
   * retreat (§9.1.6); white holds two cards and owes one.
   */
  function whiteOwingFromRetreat() {
    const defender = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'white',
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      white: {
        ...state.cardState.white,
        inHand: [tempCommandCards[2], tempCommandCards[3]],
      },
    });
    state = { ...state, routedUnits: [defender.unit] };
    const retreatState = createRetreatState(defender, {
      legalRetreatOptions: [],
      routState: createRoutState('white', defender.unit, {
        numberToDiscard: 1,
      }),
    });
    return { defender, retreatState, state };
  }

  const payOneCard = {
    cardIds: [tempCommandCards[2].id],
    choiceType: 'chooseRoutDiscard' as const,
    eventNumber: 0,
    eventType: 'playerChoice' as const,
    player: 'white' as const,
  };

  it('a rout held by a retreat in a front engagement is paid, and the retreat closes', () => {
    const { retreatState, state: base } = whiteOwingFromRetreat();
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        currentCommandResolutionState: createMovementResolutionState(base, {
          engagementState: createFrontEngagementState({ retreatState }),
        }),
      }),
    );

    const next = applyChooseRoutDiscardEvent(payOneCard, state);

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

  it('a rout held by a retreat in a melee is paid, and the retreat closes', () => {
    // White holds second place in the melee, so its apply is the second slot.
    const { defender, retreatState, state: base } = whiteOwingFromRetreat();
    const state = updatePhaseState(
      updateCurrentInitiative(base, 'black'),
      createResolveMeleePhaseState(base, {
        currentMeleeResolutionState: createMeleeResolutionState(base, {
          secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
            defender,
            { retreatState },
          ),
        }),
      }),
    );

    const next = applyChooseRoutDiscardEvent(payOneCard, state);

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
