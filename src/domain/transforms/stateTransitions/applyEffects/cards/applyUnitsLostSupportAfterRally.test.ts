import type { AuthoritativeGameState } from '@game';
import { createOpenedRallyResolutionState } from '@factories';
import {
  findCommanderSpace,
  getBoardSpace,
  getCleanupPhaseState,
  getRallyResolutionState,
} from '@queries';
import {
  createCleanupPhaseState,
  createGameStateWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { deployCommander, updatePhaseState } from '@transforms/pureTransforms';

import { applyUnitsLostSupportAfterRally } from './applyUnitsLostSupportAfterRally';

// White's army: one unit its cards held a place for, two they did not.
const kept = createTestUnit('white', { instanceNumber: 1 });
const leftOverA = createTestUnit('white', { instanceNumber: 2 });
const leftOverB = createTestUnit('white', { instanceNumber: 3 });

// A Black unit across the field.
const enemy = createTestUnit('black');

/**
 * Cleanup on White's rally, the burn done and every card back in hand, so the
 * support check is owed. White holds the initiative, so its rally is the
 * first (§10.3.1).
 */
function supportCheckOwed(): AuthoritativeGameState {
  // White's three units in a row, and Black's facing them.
  const withUnits = createGameStateWithUnits([
    placed(kept, 'E-5', 'north'),
    placed(leftOverA, 'E-6', 'north'),
    placed(leftOverB, 'E-7', 'north'),
    placed(enemy, 'C-6', 'south'),
  ]);

  // White chose to rally, and its cards are back in hand.
  const rally = {
    ...createOpenedRallyResolutionState(true),
    rallyResolved: true,
  };
  const owed = updatePhaseState(
    withUnits,
    createCleanupPhaseState({
      firstPlayerRallyResolutionState: rally,
      step: 'firstPlayerResolveRally',
    }),
  );
  return owed;
}

/**
 * After a rally, every unit the player's cards could not find a place for
 * routs, all at once, and its owner pays their summed Morale (§10.4.6,
 * §10.4.7). The player chose the places; this carries out what their choice
 * left uncovered.
 */
describe('applyUnitsLostSupportAfterRally function', () => {
  it('routs every unit left without a place, all at once', () => {
    const next = applyUnitsLostSupportAfterRally(supportCheckOwed(), 'white', [
      leftOverA,
      leftOverB,
    ]);

    // Both left the board; the unit with a place stays.
    expect(getBoardSpace(next.boardState, 'E-6').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(getBoardSpace(next.boardState, 'E-7').unitPresence).toStrictEqual({
      presenceType: 'none',
    });
    expect(getBoardSpace(next.boardState, 'E-5').unitPresence).toMatchObject({
      presenceType: 'single',
      unit: kept,
    });

    // They are out of the game for good (§9.3.1).
    expect(next.routedUnits).toStrictEqual([leftOverA, leftOverB]);
  });

  it('opens one rout for them together, and the rally waits on it', () => {
    const next = applyUnitsLostSupportAfterRally(supportCheckOwed(), 'white', [
      leftOverA,
      leftOverB,
    ]);

    // The rally records who lost their place, and the one rout that costs:
    // their Morale is summed and paid at once (§9.3.3).
    expect(getRallyResolutionState(next, 'white')).toMatchObject({
      routState: {
        cardsChosen: false,
        completed: false,
        numberToDiscard: 'pending',
        player: 'white',
        substepType: 'rout',
        unitsToRout: [leftOverA, leftOverB],
      },
      unitsLostSupport: [leftOverA, leftOverB],
    });

    // White's rally goes on until the rout is paid, before Black decides
    // whether to rally (§10.3.6).
    expect(getCleanupPhaseState(next).step).toBe('firstPlayerResolveRally');
  });

  it("leaves a commander standing where its unit routed, since the support check's rout takes none", () => {
    // White's commander shares the space of a unit about to rout.
    const withCommander = deployCommander(supportCheckOwed(), 'white', 'E-6');

    const next = applyUnitsLostSupportAfterRally(withCommander, 'white', [
      leftOverA,
    ]);

    // A commander falls only with a unit routed in combat (§4.2.8).
    expect(findCommanderSpace('white', next)).toBe('E-6');
  });

  it("touches no unit of the other side: a rally checks only the rallying player's army", () => {
    // A Black unit named among White's uncovered is not White's to rout.
    const next = applyUnitsLostSupportAfterRally(supportCheckOwed(), 'white', [
      enemy,
    ]);

    // Black's unit still stands (§10.4.1).
    expect(getBoardSpace(next.boardState, 'C-6').unitPresence).toMatchObject({
      presenceType: 'single',
      unit: enemy,
    });
    expect(next.routedUnits).toStrictEqual([]);
  });

  it('with every unit given a place, routs nothing, and the second player chooses whether to rally', () => {
    const next = applyUnitsLostSupportAfterRally(
      supportCheckOwed(),
      'white',
      [],
    );

    // Nobody lost a place, so nothing routs, and with nothing to pay the
    // rally is over, closed as `settleRout` closes one that routed units.
    expect(getRallyResolutionState(next, 'white')).toMatchObject({
      completed: true,
      routState: 'bypassed',
      unitsLostSupport: [],
    });

    // White's rally is over; Black decides next (§10.3.6).
    expect(getCleanupPhaseState(next).step).toBe('secondPlayerChooseRally');
  });

  it('throws before the burn: the cards are not back in hand yet', () => {
    // White chose to rally, but nothing has been burnt or returned.
    const beforeBurn = updatePhaseState(
      supportCheckOwed(),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createOpenedRallyResolutionState(true),
        step: 'firstPlayerResolveRally',
      }),
    );

    // The check counts every card the player owns, so it follows the burn
    // (§10.4.1).
    expect(() =>
      applyUnitsLostSupportAfterRally(beforeBurn, 'white', [leftOverA]),
    ).toThrow('Rally has not been resolved yet');
  });
});
