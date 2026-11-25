import type { GameState, RangedAttackResolutionState } from '@game';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
  placed,
} from '@testing';

import { generateResolveRangedAttackEvent } from './generateResolveRangedAttackEvent';

/** Black's skirmisher (Attack 2, Range 2), the shooter. */
const skirmisher = createTestUnit('black', { attack: 2, range: 2 });

/** White's cavalry (Retreat 3, Reverse 5, Rout 7), the target. */
const cavalry = createTestUnit('white', {
  attack: 4,
  retreat: 3,
  reverse: 5,
  rout: 7,
});

/**
 * Black's skirmisher on C-5 facing south, with White's cavalry two spaces
 * ahead on E-5, inside its forward arc at Range 2 (§2.4.3), in the middle of
 * this shot. The shot is as far along as `progress` says; by default both
 * players have declined to commit and the target is named with no supporters.
 *
 * @param progress - The parts of the shot the case sets
 * @returns The game, carrying out that shot
 */
function shootingCavalry(
  progress: Partial<RangedAttackResolutionState>,
): GameState {
  // The shooter and its target where they stand.
  const board = createGameStateWithUnits([
    placed(skirmisher, 'C-5', 'south'),
    placed(cavalry, 'E-5', 'north'),
  ]);

  // The shot, as far as play has written it.
  const shot = createRangedAttackResolutionState(board, {
    attackingCommitment: { commitmentType: 'declined' },
    attackingUnit: skirmisher,
    defendingCommitment: { commitmentType: 'declined' },
    defendingUnit: cavalry,
    supportingUnits: [],
    ...progress,
  });

  // Phase 3, Black carrying out that Shoot order.
  const shooting = createGameStateResolvingCommand(shot, board);
  return shooting;
}

/**
 * `resolveRangedAttack` is the first ranged strike roll: attacker/defender commitments must be
 * settled, and there must be no attack-apply substep yet. Outcome exposes rout/retreat/reverse
 * flags; where a retreat may go is worked out when that retreat opens.
 */
// TODO(misleading): "roll" — the game has no dice; a shot is measured, its
// attack value set against the target's thresholds (§7.4.3, §7.5.1). Settle
// by saying "measure".
describe('generateResolveRangedAttackEvent function', () => {
  it('records what the shot reached against its target, and nothing else', () => {
    // A second skirmisher, ordered by the same Shoot and able to make the same
    // shot from C-6, supports it (§7.3.4).
    const supporter = createTestUnit('black', {
      attack: 2,
      instanceNumber: 2,
      range: 2,
    });
    const board = createGameStateWithUnits([
      placed(skirmisher, 'C-5', 'south'),
      placed(supporter, 'C-6', 'south'),
      placed(cavalry, 'E-5', 'north'),
    ]);
    const shot = createRangedAttackResolutionState(board, {
      attackingCommitment: { commitmentType: 'declined' },
      attackingUnit: skirmisher,
      defendingCommitment: { commitmentType: 'declined' },
      defendingUnit: cavalry,
      supportingUnits: [supporter],
    });
    const state = createGameStateResolvingCommand(shot, board);

    // 2 + 1 = 3 meets the cavalry's Retreat and nothing more. The target is
    // the one the shot holds, so the event does not name it.
    expect(generateResolveRangedAttackEvent(state)).toStrictEqual({
      attackResult: {
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      },
      effectType: 'resolveRangedAttack',
      eventType: 'gameEffect',
    });
  });

  it('refuses to measure a shot before the shooter has committed or declined (§4.3.11 step 2)', () => {
    // The shooter's commitment window is still open.
    const state = shootingCavalry({
      attackingCommitment: { commitmentType: 'pending' },
    });

    // The shooter commits before it aims, so nothing can be measured yet.
    expect(() => generateResolveRangedAttackEvent(state)).toThrow(
      'Attacking commitment is still pending',
    );
  });

  it("refuses to measure a shot before the target's owner has committed or declined (§4.3.11 step 5)", () => {
    // The target is named; its owner has not answered.
    const state = shootingCavalry({
      defendingCommitment: { commitmentType: 'pending' },
    });

    // A Defence card would raise the thresholds this shot is measured against.
    expect(() => generateResolveRangedAttackEvent(state)).toThrow(
      'Defending commitment is still pending',
    );
  });

  it('measures a shot only once', () => {
    // The shot's result is already written: it reached nothing.
    const state = shootingCavalry({
      attackApplyState: createAttackApplyStateWithNothingDue(cavalry),
    });

    // A second measure would replace the result being carried out.
    expect(() => generateResolveRangedAttackEvent(state)).toThrow(
      'Attack apply state already exists',
    );
  });

  it('refuses to measure a shot with no target named', () => {
    // Play names the target before the target's owner commits, so this state,
    // with both commitments made and no target, is forged to reach the guard.
    const state = shootingCavalry({
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });

    // Without a target there are no thresholds to measure against.
    expect(() => generateResolveRangedAttackEvent(state)).toThrow(
      'The target of the shot has not been named',
    );
  });

  it('refuses to measure a shot whose supporters are not named', () => {
    // Play names the supporters with the target, in one choice, so a named
    // target without them is forged to reach the guard.
    const state = shootingCavalry({ supportingUnits: 'pending' });

    // Each supporter adds to the shot, so it cannot be counted without them.
    expect(() => generateResolveRangedAttackEvent(state)).toThrow(
      'The supporters of the shot have not been named',
    );
  });

  describe('what is added to a shot, and what raises the target (§7.3.4, §8.4)', () => {
    /**
     * A black cavalry shooter (Attack 4) at a white cavalry target on E-5
     * (Retreat 3, Reverse 5, Rout 7). `extras` names what is brought to the
     * shot: supporters, the shooter's committed card, the target's.
     */
    function cavalryShot(extras: {
      supporters?: number;
      shooterCard?: ('attack' | 'defense')[];
      targetCard?: ('attack' | 'defense')[];
    }): GameState {
      // The stand-in catalog has no unit with Attack 4 and any Range, so this
      // shooter could not be ordered to shoot (§4.3.11 step 1). The measure
      // of a shot does not read Range, and Attack 4 is what these cases need.
      const shooter = createTestUnit('black', {
        attack: 4,
        retreat: 3,
        reverse: 5,
        rout: 7,
      });
      const supporters = Array.from(
        { length: extras.supporters ?? 0 },
        (_, i) =>
          createTestUnit('black', {
            attack: 4,
            instanceNumber: i + 2,
            retreat: 3,
            reverse: 5,
            rout: 7,
          }),
      );

      // The shooter on C-5 and its supporters beside it to the east, all
      // facing the target on E-5.
      const board = createGameStateWithUnits([
        placed(shooter, 'C-5', 'south'),
        ...supporters.map((supporter, i) =>
          placed(supporter, i === 0 ? 'C-6' : 'C-4', 'south'),
        ),
        placed(cavalry, 'E-5', 'north'),
      ]);

      // A card committed naming these stats, or a refusal.
      const commitment = (modifiers?: ('attack' | 'defense')[]) =>
        modifiers === undefined
          ? { commitmentType: 'declined' as const }
          : {
              card: createTestCard({ modifiers }),
              commitmentType: 'completed' as const,
            };
      const ranged = createRangedAttackResolutionState(board, {
        attackingCommitment: commitment(extras.shooterCard),
        attackingUnit: shooter,
        defendingCommitment: commitment(extras.targetCard),
        defendingUnit: cavalry,
        supportingUnits: supporters,
      });
      const shooting = createGameStateResolvingCommand(ranged, board);
      return shooting;
    }

    it('a lone shot of 4 reaches the target’s Retreat but not its Reverse', () => {
      const event = generateResolveRangedAttackEvent(cavalryShot({}));

      expect(event.attackResult.unitRetreated).toBe(true);
      expect(event.attackResult.unitReversed).toBe(false);
    });

    it('each supporter adds 1 to the shot', () => {
      // One supporter makes it 5, which meets the target's Reverse of 5.
      const event = generateResolveRangedAttackEvent(
        cavalryShot({ supporters: 1 }),
      );

      expect(event.attackResult.unitReversed).toBe(true);
    });

    it('the shooter’s committed Attack card adds 1 to the shot', () => {
      const event = generateResolveRangedAttackEvent(
        cavalryShot({ shooterCard: ['attack'] }),
      );

      // 4 + 1 = 5 meets the target's Reverse of 5.
      expect(event.attackResult.unitReversed).toBe(true);
    });

    it('the target’s committed Defence card raises its thresholds by 1', () => {
      // A supporter makes the shot 5, which would meet Reverse 5; the target's
      // Defence makes its Reverse 6, so it holds, though its Retreat of 4 is
      // still reached.
      const event = generateResolveRangedAttackEvent(
        cavalryShot({ supporters: 1, targetCard: ['defense'] }),
      );

      expect(event.attackResult.unitReversed).toBe(false);
      expect(event.attackResult.unitRetreated).toBe(true);
    });
  });
});
