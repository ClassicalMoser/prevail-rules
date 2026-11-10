import { getRangedAttackResolutionState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import {
  createCommitToRangedDefenseEvent,
  createEmptyGameState,
} from '@factories';

import { applyCommitToRangedDefenseEvent } from './applyCommitToRangedDefenseEvent';

/**
 * The target's commitment (§4.3.11 step 5, B1): once a shot is aimed, the
 * target's owner commits a card for Defence or Flexibility, or refuses, and the shot records
 * it for when the blow lands (§8.5).
 */
describe('applyCommitToRangedDefenseEvent function', () => {
  /**
   * Black's shot at a white unit, aimed, with white's commitment owed; white
   * holds the given hand.
   */
  function shotAwaitingDefence(whiteHand: ReturnType<typeof createTestCard>[]) {
    const state = createEmptyGameState('standard');
    const withHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: whiteHand },
    });
    // The target is a white unit; where it stands is not read here.
    const target = createUnitWithPlacement({ playerSide: 'white' });
    const shot = createRangedAttackResolutionState(withHand, {
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: target.unit,
    });
    const awaiting = updatePhaseState(
      withHand,
      createIssueCommandsPhaseState(withHand, {
        currentCommandResolutionState: shot,
      }),
    );
    return awaiting;
  }

  it('a Defence card committed by the target is recorded on the shot and leaves its hand', () => {
    // White's only card names Defence.
    const defenceCard = createTestCard({ modifiers: ['defense'] });
    const state = shotAwaitingDefence([defenceCard]);

    // White commits it against the shot.
    const committed = applyCommitToRangedDefenseEvent(
      createCommitToRangedDefenseEvent({
        committedCard: defenceCard,
        eventNumber: 0,
        modifierTypes: ['defense'],
        player: 'white',
      }),
      state,
    );

    // The shot holds the card as the target's commitment (§8.5)...
    expect(
      getRangedAttackResolutionState(committed).defendingCommitment,
    ).toStrictEqual({ card: defenceCard, commitmentType: 'completed' });
    // ...and it has left white's hand for the discard pile (§8.1).
    expect(committed.cardState.white.inHand).toStrictEqual([]);
  });

  it('a target that refuses keeps its hand, and the shot records the refusal', () => {
    // White holds a Defence card it chooses not to spend.
    const defenceCard = createTestCard({ modifiers: ['defense'] });
    const state = shotAwaitingDefence([defenceCard]);

    // White refuses (§8.3).
    const refused = applyCommitToRangedDefenseEvent(
      createCommitToRangedDefenseEvent({
        committedCard: null,
        eventNumber: 0,
        modifierTypes: [],
        player: 'white',
      }),
      state,
    );

    expect(
      getRangedAttackResolutionState(refused).defendingCommitment,
    ).toStrictEqual({ commitmentType: 'declined' });
    expect(refused.cardState.white.inHand).toStrictEqual([defenceCard]);
  });
});
