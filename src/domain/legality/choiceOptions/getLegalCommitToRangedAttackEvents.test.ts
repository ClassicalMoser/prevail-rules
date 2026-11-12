import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalCommitToRangedAttackEvents } from './getLegalCommitToRangedAttackEvents';

import { createEmptyGameState } from '@factories';
/** Eligible: carries a ranged-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** Not eligible: speed is a movement modifier, not a ranged one. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/** Eligible: carries a range modifier. */
const rangeCard = createTestCard({ modifiers: ['range'] });

/**
 * GetLegalCommitToRangedAttackEvents: one CommitToRangedAttackEvent per
 * eligible in-hand card (has ≥1 ranged modifier), plus refuse. Only the
 * shooter is offered these (§4.3.11 step 2); the target commits through
 * `commitToRangedDefense`.
 */
describe('getLegalCommitToRangedAttackEvents function', () => {
  function statePendingAttackerCommit(hand = [attackCard]) {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
    });
    const ranged = createRangedAttackResolutionState(withCards, {
      attackingCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
  }

  /**
   * The shooter has committed and aimed; the target's owner, white, holding
   * the given hand, is the one still owed a commitment.
   */
  function stateAwaitingTargetCommit(hand = [attackCard]) {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
    });
    const ranged = createRangedAttackResolutionState(withCards, {
      attackingCommitment: { commitmentType: 'declined' },
      defendingCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
  }

  const refuseBlack = {
    choiceType: 'commitToRangedAttack' as const,
    committedCard: null,
    eventType: 'playerChoice' as const,
    player: 'black' as const,
  };

  it('returns one event per hand card with all of its ranged modifiers applied, plus refuse', () => {
    const state = statePendingAttackerCommit([attackCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: attackCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('skips cards with no ranged-applicable modifiers', () => {
    const state = statePendingAttackerCommit([speedCard, rangeCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: rangeCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('a card naming Range and Attack is offered with both, since it counts for the whole shot', () => {
    // One card, two stats (§8.2): its Range for the aim, its Attack for the attack value.
    const rangeAndAttackCard = createTestCard({
      modifiers: ['range', 'attack'],
    });
    const state = statePendingAttackerCommit([rangeAndAttackCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: rangeAndAttackCard,
        eventType: 'playerChoice',
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('throws once the shooter has committed: the target’s commitment is a separate choice', () => {
    // White holds an Attack card while its commitment is owed.
    const state = stateAwaitingTargetCommit([attackCard]);

    expect(() => getLegalCommitToRangedAttackEvents(state)).toThrow(
      'The shooter has already committed or refused a card',
    );
  });

  it('throws when no ranged attack is being carried out, where nothing asks', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(() => getLegalCommitToRangedAttackEvents(state)).toThrow(
      'No ranged attack is being carried out',
    );
  });

  it('returns only refuse when the pending player has no eligible cards in hand', () => {
    const state = statePendingAttackerCommit([speedCard]);
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      refuseBlack,
    ]);
  });
});
