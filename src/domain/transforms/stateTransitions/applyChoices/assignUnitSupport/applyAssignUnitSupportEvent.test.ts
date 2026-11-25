import type { UnitWithPlacement } from '@entities';
import { createAssignUnitSupportEvent, createEmptyGameState } from '@factories';
import { findUnitWithPlacementOnBoard, getCleanupPhaseState } from '@queries';
import {
  createBoardWithUnits,
  createCleanupPhaseState,
  createRallyResolutionState,
  createTestCard,
  createTestUnit,
  placed,
  replaceBoard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfBypassed, throwIfPending } from '@utils';

import { applyAssignUnitSupportEvent } from './applyAssignUnitSupportEvent';

/**
 * After a rally, the player who rallied gives each of their units on the
 * board a place in the stacks their hand holds (§10.4.4). Whatever gets no
 * place routs, all together, and its Morale is owed in one payment (§10.4.6,
 * §10.4.7).
 */
describe('applyAssignUnitSupportEvent function', () => {
  // Two of white's units: one its card holds, and one with Morale to pay.
  const covered = createTestUnit('white', { instanceNumber: 1 });
  const uncovered = createTestUnit('white', { instanceNumber: 2, morale: 2 });

  // White's one card holds a single place for any unit (§10.4.2).
  const card = createTestCard({
    unitSupport: { count: 1, supportType: 'generic' },
  });

  /**
   * White, holding the initiative, has rallied first in cleanup and now
   * places its units on the board, holding the one card.
   */
  function whiteAssigningSupport(units: UnitWithPlacement[]) {
    const empty = createEmptyGameState('standard');
    const withHand = updateCardState(empty, {
      ...empty.cardState,
      white: { ...empty.cardState.white, inHand: [card] },
    });
    const withBoard = replaceBoard(withHand, createBoardWithUnits(units));

    // White's rally is resolved: the burn done and the cards back in hand.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
    });
    const cleanup = createCleanupPhaseState({
      firstPlayerRallyResolutionState: rally,
      step: 'firstPlayerResolveRally',
    });
    const assigning = updatePhaseState(withBoard, cleanup);
    return assigning;
  }

  it('routs the units given no place, and opens their Morale debt', () => {
    // Two units on the board, and a card with one place.
    const state = whiteAssigningSupport([
      placed(covered, 'E-5', 'south'),
      placed(uncovered, 'E-6', 'south'),
    ]);

    // White gives the place to the unit on E-5.
    const next = applyAssignUnitSupportEvent(
      createAssignUnitSupportEvent({
        assignments: [{ unit: covered, unitSupport: card.unitSupport }],
        player: 'white',
      }),
      state,
    );

    // The unit held together stays; the other leaves the board for good
    // (§10.4.6).
    expect(findUnitWithPlacementOnBoard(next, covered)).toStrictEqual(
      placed(covered, 'E-5', 'south'),
    );
    expect(findUnitWithPlacementOnBoard(next, uncovered)).toBeUndefined();
    expect(next.routedUnits).toStrictEqual([uncovered]);

    // The rally stays open on white's step until the Morale is paid.
    const cleanup = getCleanupPhaseState(next);
    expect(cleanup.step).toBe('firstPlayerResolveRally');
    const rally = throwIfPending(
      cleanup.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(rally.unitsLostSupport).toStrictEqual([uncovered]);
    expect(
      throwIfBypassed(throwIfPending(rally.routState, 'rout'), 'rout')
        .completed,
    ).toBe(false);
  });

  it('routs nothing when every unit has a place, and cleanup moves on', () => {
    // One unit on the board, and a card with one place.
    const state = whiteAssigningSupport([placed(covered, 'E-5', 'south')]);

    // White gives it the place.
    const next = applyAssignUnitSupportEvent(
      createAssignUnitSupportEvent({
        assignments: [{ unit: covered, unitSupport: card.unitSupport }],
        player: 'white',
      }),
      state,
    );

    // Nothing routed, so there is nothing to pay, and black chooses whether
    // to rally next (§10.3.6).
    expect(next.routedUnits).toStrictEqual([]);
    const cleanup = getCleanupPhaseState(next);
    expect(cleanup.step).toBe('secondPlayerChooseRally');
    const rally = throwIfPending(
      cleanup.firstPlayerRallyResolutionState,
      'rally',
    );
    // Every unit kept its support, so the rally costs no rout.
    expect(rally.unitsLostSupport).toStrictEqual([]);
    expect(rally.routState).toBe('bypassed');
  });
});
