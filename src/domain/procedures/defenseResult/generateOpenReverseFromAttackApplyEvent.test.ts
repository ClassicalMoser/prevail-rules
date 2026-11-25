import type { AttackApplyState, GameState } from '@game';
import { createAttackApplyState } from '@factories';
import {
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';

import { generateOpenReverseFromAttackApplyEvent } from './generateOpenReverseFromAttackApplyEvent';

/**
 * An attack that reversed leaves the reverse slot pending until this opener runs.
 */
describe('generateOpenReverseFromAttackApplyEvent function', () => {
  // White's unit on E-5 facing north, and the black archer that shot at it
  // from two spaces ahead.
  const target = placed(createTestUnit('white', { attack: 2 }), 'E-5', 'north');
  const shooter = placed(
    createTestUnit('black', { attack: 2 }),
    'C-5',
    'south',
  );

  /** Phase 3, carrying out black's shot, its result on white's target measured. */
  function resolvingShot(attackApplyState: AttackApplyState): GameState {
    const board = createGameStateWithUnits([target, shooter]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState,
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const resolving = createGameStateResolvingCommand(shot, board);
    return resolving;
  }

  it('names the effect for a reverse waiting to open, and carries nothing', () => {
    // The shot reached the target's Reverse and nothing else.
    const state = resolvingShot(
      createAttackApplyState(target.unit, {
        unitRetreated: false,
        unitReversed: true,
        unitRouted: false,
      }),
    );

    // Which apply it opens on is the state's to name, not the event's.
    expect(generateOpenReverseFromAttackApplyEvent(state)).toStrictEqual({
      effectType: 'openReverseFromAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('throws when the attack reached no reverse', () => {
    // The shot reached only the target's Retreat, so no reverse is owed.
    const state = resolvingShot(
      createAttackApplyState(target.unit, {
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      }),
    );

    expect(() => generateOpenReverseFromAttackApplyEvent(state)).toThrow(
      'The reverse is not pending on the ranged attack apply',
    );
  });
});
