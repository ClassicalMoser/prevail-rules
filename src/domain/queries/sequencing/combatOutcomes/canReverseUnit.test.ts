import type { UnitWithPlacement } from '@entities';
import { createEmptyGameState } from '@factories';
import {
  createGameStateWithEngagedUnits,
  createReverseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updateBoardState } from '@transforms';

import { canReverseUnit } from './canReverseUnit';

/**
 * A unit can reverse once it is alone on its hex. An engagement blocks it.
 * An empty hex is not a reverse.
 */
describe('canReverseUnit function', () => {
  it('returns true when the reversing unit is alone on its hex', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const placement = {
      coordinate: 'E-5',
      facing: 'north',
    } satisfies UnitWithPlacement['placement'];
    const reverse = createReverseState({ placement, unit });
    const empty = createEmptyGameState('standard');
    const state = updateBoardState(
      empty,
      addUnitToBoard(empty.boardState, { placement, unit }),
    );

    expect(canReverseUnit(reverse, state)).toBe(true);
  });

  it('returns false when the reversing unit is the primary of an engagement', () => {
    const primary = createTestUnit('white', { attack: 2 });
    const secondary = createTestUnit('black', { attack: 2 });
    const state = createGameStateWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );
    const reverse = createReverseState({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: primary,
    });

    expect(canReverseUnit(reverse, state)).toBe(false);
  });

  it('returns false when the reversing unit is the secondary of an engagement', () => {
    const primary = createTestUnit('white', { attack: 2 });
    const secondary = createTestUnit('black', { attack: 2 });
    const state = createGameStateWithEngagedUnits(
      primary,
      secondary,
      'E-5',
      'north',
    );
    const reverse = createReverseState({
      placement: { coordinate: 'E-5', facing: 'south' },
      unit: secondary,
    });

    expect(canReverseUnit(reverse, state)).toBe(false);
  });

  it('throws when the reversing hex is empty', () => {
    const reverse = createReverseState({
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: createTestUnit('white', { attack: 2 }),
    });

    expect(() =>
      canReverseUnit(reverse, createEmptyGameState('standard')),
    ).toThrow('Unit not present at coordinate');
  });
});
