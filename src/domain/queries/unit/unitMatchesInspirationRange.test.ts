import type { Restrictions } from '@entities';
import { createEmptyGameState } from '@factories';
import { createUnitWithPlacement } from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
} from '@transforms';
import { unitMatchesInspirationRange } from './unitMatchesInspirationRange';

/** Restrictions that name only a range from the commander. */
function rangeOf(inspirationRangeRestriction: number): Restrictions {
  return { inspirationRangeRestriction, restrictionType: 'none' };
}

/**
 * UnitMatchesInspirationRange: whether a unit stands close enough to its
 * commander for a card's inspiration range to reach it (§4.2.7).
 */
describe('unitMatchesInspirationRange function', () => {
  // A black unit on E-5, a commander on E-5 beside it or two spaces off.
  const unit = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'black',
  });

  /** The unit on E-5 and, if given, black's commander where it stands. */
  function gameWithCommanderAt(commander?: 'E-5' | 'E-6' | 'E-8') {
    const state = createEmptyGameState('standard');
    const withUnit = addUnitToBoard(state.boardState, unit);
    const board =
      commander === undefined
        ? withUnit
        : addCommanderToBoard(withUnit, 'black', commander);
    return updateBoardState(state, board);
  }

  it('reaches a unit wherever it stands when the range is unrestricted, even with no commander', () => {
    // A range printed — (stored as −1) restricts nothing (§4.2.7).
    expect(
      unitMatchesInspirationRange(
        unit.unit,
        rangeOf(-1),
        gameWithCommanderAt(),
      ),
    ).toBe(true);
  });

  it('reaches only the commander’s own space when the range is 0', () => {
    // The commander shares the unit's space, so a range of 0 reaches it.
    expect(
      unitMatchesInspirationRange(
        unit.unit,
        rangeOf(0),
        gameWithCommanderAt('E-5'),
      ),
    ).toBe(true);
    // One space away is out of a range of 0.
    expect(
      unitMatchesInspirationRange(
        unit.unit,
        rangeOf(0),
        gameWithCommanderAt('E-6'),
      ),
    ).toBe(false);
  });

  it('reaches a unit within the range and not one beyond it', () => {
    // The commander stands three spaces from the unit.
    const state = gameWithCommanderAt('E-8');

    expect(unitMatchesInspirationRange(unit.unit, rangeOf(3), state)).toBe(
      true,
    );
    expect(unitMatchesInspirationRange(unit.unit, rangeOf(2), state)).toBe(
      false,
    );
  });

  it('reaches nothing once the commander has fallen, whatever the range', () => {
    // A defeated commander is off the board, so every range fails (§4.2.8).
    expect(
      unitMatchesInspirationRange(unit.unit, rangeOf(5), gameWithCommanderAt()),
    ).toBe(false);
  });
});
