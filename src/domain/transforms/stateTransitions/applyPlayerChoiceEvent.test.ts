import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createAssignUnitSupportEvent,
  createChooseCardEvent,
  createChooseRetreatOptionEvent,
  createCommitToMeleeEvent,
  createEmptyGameState,
  createIssueCommandsEvent,
  createMoveCommanderEvent,
  createOpenedMeleeResolutionState,
  createOpenedRallyResolutionState,
} from '@factories';
import {
  findCommanderSpace,
  getCleanupPhaseState,
  getMeleeResolutionState,
  getRemainingUnitsForPlayer,
  getRetreatState,
} from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createAttackApplyStateWithRetreat,
  createCleanupPhaseState,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  enemyBlockingStraightBack,
  legalRetreatsOf,
  placed,
  updateCardState,
} from '@testing';
import {
  deployCommander,
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

/** Both players choosing their cards, Black holding two and White one. */
function choosingCards(): GameState {
  const base = createEmptyGameState('standard');

  // Nothing laid down yet; each hand holds the cards it may choose from.
  const withHands = updateCardState(base, {
    ...base.cardState,
    black: {
      ...base.cardState.black,
      awaitingPlay: null,
      inHand: [tempCommandCards[0], tempCommandCards[1]],
    },
    white: {
      ...base.cardState.white,
      awaitingPlay: null,
      inHand: [tempCommandCards[2]],
    },
  });

  // The play-cards phase, at the step where cards are chosen (§4.1.1).
  const choosing = updatePhaseState(withHands, {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
  });
  return choosing;
}

/**
 * A player's choice is applied by the rule for that kind of choice. Each
 * rule has its own spec; this one checks that a choice reaches its rule.
 */
describe('applyPlayerChoiceEvent function', () => {
  it('applies a card choice: the card leaves the hand and waits to be revealed', () => {
    // Black lays down the first of its two cards.
    const event = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });

    const result = applyPlayerChoiceEvent(event, choosingCards());

    // The card is face down, waiting for the reveal; the other stays in hand.
    expect(result.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
    expect(result.cardState.black.inHand).toStrictEqual([tempCommandCards[1]]);
  });

  // The routes below are the ones no other spec reaches through this router;
  // the rest are taken whenever a scenario or the application applies a
  // choice.

  it('applies a commander move: the commander stands where it was sent', () => {
    // White, holding the initiative, moves its commander first (§4.2.1).
    const deployed = deployCommander(
      createEmptyGameState('standard'),
      'white',
      'E-5',
    );
    const state = updatePhaseState(deployed, createMoveCommandersPhaseState());
    const event = createMoveCommanderEvent({ player: 'white', to: 'E-7' });

    const result = applyPlayerChoiceEvent(event, state);

    // Two spaces on, within the four a commander may move (§4.2.2).
    expect(findCommanderSpace('white', result)).toBe('E-7');
  });

  it('applies the orders issued: the unit ordered is to act', () => {
    // White, holding the initiative, issues its orders first (§4.3).
    const unit = createTestUnit('white');
    const withUnit = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);
    const state = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState({
        step: 'firstPlayerIssueCommands',
      }),
    );
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'units', units: [unit] },
      player: 'white',
    });

    const result = applyPlayerChoiceEvent(event, state);

    // The one unit ordered is the one White carries out next (§4.3.9).
    expect(getRemainingUnitsForPlayer(result, 'white')).toStrictEqual([unit]);
  });

  it('applies a declined melee commitment: the first player commits nothing', () => {
    // A melee at E-5, both commitments still to make; White holds the
    // initiative, so it decides first (§7.2.2).
    const engaged = createGameStateWithEngagedUnits(
      createTestUnit('white'),
      createTestUnit('black'),
      'E-5',
    );
    const state = updatePhaseState(
      engaged,
      createResolveMeleePhaseState(engaged, {
        currentMeleeResolutionState: createOpenedMeleeResolutionState('E-5'),
      }),
    );
    const event = createCommitToMeleeEvent({
      committedCard: 'none',
      player: 'white',
    });

    const result = applyPlayerChoiceEvent(event, state);

    // A commitment is always optional (§8.3).
    expect(getMeleeResolutionState(result).firstPlayerCommitment).toStrictEqual(
      { commitmentType: 'declined' },
    );
  });

  it('applies a retreat chosen among equally small ones', () => {
    // Black's shot drove back White's unit at E-5. An enemy behind it, its
    // back turned, bars the straight step back and leaves two tied ways round
    // (§9.1.3).
    const unit = createTestUnit('white');
    const placement = placed(unit, 'E-5', 'north');
    const blocker = enemyBlockingStraightBack(placement);
    const withUnits = updateCurrentInitiative(
      createGameStateWithUnits([placement, blocker]),
      'black',
    );
    const shot = createRangedAttackResolutionState(withUnits, {
      attackApplyState: createAttackApplyStateWithRetreat(
        unit,
        legalRetreatsOf(placement, [blocker]),
      ),
    });
    const state = createGameStateResolvingCommand(shot, withUnits);
    const event = createChooseRetreatOptionEvent({
      path: ['turnRight', 'step'],
      player: 'white',
    });

    const result = applyPlayerChoiceEvent(event, state);

    // White's choice is the retreat to carry out.
    expect(getRetreatState(result, 'white').chosenRetreatPath).toStrictEqual([
      'turnRight',
      'step',
    ]);
  });

  it('applies a support assignment: a unit given a place stays', () => {
    // White has rallied, its cards are back in hand, and its one unit is to
    // be given a place (§10.4.4).
    const unit = createTestUnit('white');
    const withUnit = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);
    const rally = {
      ...createOpenedRallyResolutionState(true),
      rallyResolved: true,
    };
    const state = updatePhaseState(
      withUnit,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );
    const event = createAssignUnitSupportEvent({
      assignments: [
        { unit, unitSupport: { count: 1, supportType: 'generic' } },
      ],
      player: 'white',
    });

    const result = applyPlayerChoiceEvent(event, state);

    // Nothing routs, so White's rally is over and Black chooses whether to
    // rally (§10.3.6).
    expect(getCleanupPhaseState(result).step).toBe('secondPlayerChooseRally');
  });

  it('throws for a kind of choice it has no rule for', () => {
    const event = {
      choiceType: 'unknown',
      eventType: 'playerChoice',
      player: 'black',
      // The default branch needs a choiceType the union forbids.
    } as unknown as PlayerChoiceEvent;

    // No rule applies, so the choice is refused outright.
    expect(() => applyPlayerChoiceEvent(event, choosingCards())).toThrow(
      'Unknown player choice event type: unknown',
    );
  });
});
