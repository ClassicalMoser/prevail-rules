import type { GameState } from '@game';
import {
  createAttackApplyStateWithNothingDue,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
  getUnitByStatValue,
  getUnitByTrait,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateResolveRangedAttackEvent } from './generateResolveRangedAttackEvent';

import { createEmptyGameState } from '@factories';
/** Phalanx spearmen: default `inPlay` (+1 attack) keeps strike below retreat. */
const spearmenType = getUnitByTrait('formation', 'phalanx');
/** Low retreat so a cavalry strike forces the defender back. */
const lowRetreatType = getUnitByStatValue('retreat', 1);
/** Cavalry attacker for that low-retreat case. */
const cavalryType = getUnitByTrait('cavalry');

/**
 * `resolveRangedAttack` is the first ranged strike roll: attacker/defender commitments must be
 * settled, and there must be no attack-apply substep yet. Outcome exposes rout/retreat/reverse
 * flags; where a retreat may go is worked out when that retreat opens.
 */
describe('generateResolveRangedAttackEvent function', () => {
  /** Spearmen duel on E-5 under issueCommands ranged CRS; default commitments resolved. */
  function rangedResolutionGameState(): GameState {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { unitType: spearmenType });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackingUnit: createTestUnit('black', { unitType: spearmenType }),
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  it('given low-retreat defender vs cavalry attacker, retreated true with legal set', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { unitType: lowRetreatType });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackingUnit: createTestUnit('black', { unitType: cavalryType }),
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    const event = generateResolveRangedAttackEvent(full);
    expect(event.attackResult.unitRetreated).toBe(true);
  });

  it('given spearmen mirror below retreat threshold, retreated is false', () => {
    const full = rangedResolutionGameState();
    const event = generateResolveRangedAttackEvent(full);
    expect(event.effectType).toBe('resolveRangedAttack');
    expect(event.attackResult.unitRetreated).toBe(false);
  });

  it('given defending commitment pending on ranged CRS, throws defending commitment guard', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Defending commitment is still pending',
    );
  });

  it('given attacking commitment pending on ranged CRS, throws attacking commitment guard', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackingCommitment: { commitmentType: 'pending' },
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Attacking commitment is still pending',
    );
  });

  it('given ranged CRS already holding attackApplyState, throws attack apply already exists', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: createAttackApplyStateWithNothingDue(defendingUnit),
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);
    expect(() => generateResolveRangedAttackEvent(full)).toThrow(
      'Attack apply state already exists',
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
      const state = createEmptyGameState('standard');
      const target = createTestUnit('white', { unitType: cavalryType });
      const withBoard = {
        ...state,
        boardState: addUnitToBoard(
          state.boardState,
          placed(target, 'E-5', 'north'),
        ),
      };
      const supporters = Array.from(
        { length: extras.supporters ?? 0 },
        (_, i) =>
          createTestUnit('black', {
            instanceNumber: i + 2,
            unitType: cavalryType,
          }),
      );
      const commitment = (modifiers?: ('attack' | 'defense')[]) =>
        modifiers === undefined
          ? { commitmentType: 'declined' as const }
          : {
              card: createTestCard({ modifiers }),
              commitmentType: 'completed' as const,
            };
      const ranged = createRangedAttackResolutionState(withBoard, {
        attackingCommitment: commitment(extras.shooterCard),
        attackingUnit: createTestUnit('black', { unitType: cavalryType }),
        defendingCommitment: commitment(extras.targetCard),
        defendingUnit: target,
        supportingUnits: supporters,
      });
      return updatePhaseState(
        withBoard,
        createIssueCommandsPhaseState(withBoard, {
          currentCommandResolutionState: ranged,
        }),
      );
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
