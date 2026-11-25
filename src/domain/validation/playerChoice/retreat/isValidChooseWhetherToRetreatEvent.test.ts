import type { GameState } from '@game';
import {
  createChooseWhetherToRetreatEvent,
  createEmptyGameState,
} from '@factories';
import {
  createFrontEngagementState,
  createGameStateMovingInto,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseWhetherToRetreatEvent } from './isValidChooseWhetherToRetreatEvent';

/**
 * A defender met head on may fall back if it is faster than the unit that
 * walked into it and has somewhere to go (§6.3.2). Whether to is the
 * defender's choice, and either answer is open.
 *
 * Black's unit has walked into White's head on. White has committed its card
 * and has one way back, so White is deciding.
 */
describe('isValidChooseWhetherToRetreatEvent function', () => {
  /** White, the defender, deciding whether to fall back. */
  function whiteDeciding(): GameState {
    const engagement = createFrontEngagementState({
      defendingUnitRetreats: 'pending',
      defensiveCommitment: {
        card: createTestCard(),
        commitmentType: 'completed',
      },
      retreatPaths: [['step']],
    });
    const deciding = createGameStateMovingInto(engagement);
    return deciding;
  }

  it('accepts either answer from the defender: falling back or standing', () => {
    // Falling back is a "may" (§1.2), so standing to fight is as open as
    // retreating.
    const fallsBack = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });
    const stands = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    expect(
      isValidChooseWhetherToRetreatEvent(fallsBack, whiteDeciding()),
    ).toStrictEqual({ result: true });
    expect(
      isValidChooseWhetherToRetreatEvent(stands, whiteDeciding()),
    ).toStrictEqual({ result: true });
  });

  it('refuses an answer from the player whose unit walked in', () => {
    // The engaging unit has no say in whether its enemy falls back.
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'black',
    });

    expect(
      isValidChooseWhetherToRetreatEvent(event, whiteDeciding()),
    ).toStrictEqual({
      errorReason: 'Choose whether to retreat is not legal for black',
      result: false,
    });
  });

  it('throws when no defender is deciding, which the expected check rules out first', () => {
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidChooseWhetherToRetreatEvent(event, state)).toThrow(
      'No front engagement is being resolved',
    );
  });
});
