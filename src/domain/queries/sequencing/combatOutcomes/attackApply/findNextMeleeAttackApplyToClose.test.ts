import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createMeleeResolutionState,
  createTestUnit,
} from '@testing';
import { findNextMeleeAttackApplyToClose } from './findNextMeleeAttackApplyToClose';

/**
 * FindNextMeleeAttackApplyToClose: once a melee's results are carried out, each
 * unit's apply is closed in the order the blows take effect, the second
 * player's unit first (§7.5.6).
 */
describe('findNextMeleeAttackApplyToClose function', () => {
  // Black holds the first player's slot and white the second's, so the
  // second player's apply is white's unit.
  const blackUnit = createTestUnit('black', { attack: 2 });
  const whiteUnit = createTestUnit('white', { attack: 2 });
  const state = createEmptyGameState('standard');

  it('returns the second player’s apply first, while it is open', () => {
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        blackUnit,
        {
          completed: false,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        whiteUnit,
        {
          completed: false,
        },
      ),
    });

    // Both are open; the second player's unit is closed out first.
    expect(findNextMeleeAttackApplyToClose(melee)?.defendingUnit).toBe(
      whiteUnit,
    );
  });

  it('returns the first player’s apply once the second player’s is closed', () => {
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        blackUnit,
        {
          completed: false,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        whiteUnit,
        {
          completed: true,
        },
      ),
    });

    expect(findNextMeleeAttackApplyToClose(melee)?.defendingUnit).toBe(
      blackUnit,
    );
  });

  it('returns nothing when both applies are closed', () => {
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        blackUnit,
        {
          completed: true,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        whiteUnit,
        {
          completed: true,
        },
      ),
    });

    expect(findNextMeleeAttackApplyToClose(melee)).toBeUndefined();
  });

  it('returns nothing before both applies are written, because the order is not yet known', () => {
    // The first player's blow has not been measured yet.
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: 'pending',
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        whiteUnit,
        {
          completed: false,
        },
      ),
    });

    expect(findNextMeleeAttackApplyToClose(melee)).toBeUndefined();
  });
});
