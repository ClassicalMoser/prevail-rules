import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalRangedAttackers } from './getLegalRangedAttackers';
import {
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
} from './getLegalRangedAttackOptions';

/**
 * Perform-ranged-attack atoms: one attacker, one defender, supporters that
 * can independently hit that defender.
 *
 * Board: letters decrease toward north (A is northernmost).
 */
describe('performRangedAttack legality atoms', () => {
  const rangedCard = tempCommandCards[15];

  function place(...units: ReturnType<typeof createUnitWithPlacement>[]) {
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
    });
    for (const unit of units) {
      state = updateBoardState(state, addUnitToBoard(state.boardState, unit));
    }
    return state;
  }

  function awaitingResolve(
    remaining: ReturnType<typeof createUnitWithPlacement>[],
    boardUnits: ReturnType<typeof createUnitWithPlacement>[],
  ) {
    let state = place(...boardUnits);
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: remaining.map((u) => u.unit),
        step: 'firstPlayerResolveCommands',
      }),
    );
    return state;
  }

  describe(getLegalRangedAttackers, () => {
    it('returns remaining unengaged units with range > 0', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { instanceNumber: 1, range: 2 },
      });
      const state = awaitingResolve([attacker], [attacker]);

      expect(getLegalRangedAttackers(state)).toStrictEqual({
        attackers: [attacker],
        player: 'black',
      });
    });

    it('excludes units with range 0', () => {
      const meleeOnly = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 0 },
      });
      const state = awaitingResolve([meleeOnly], [meleeOnly]);
      expect(getLegalRangedAttackers(state)).toBeNull();
    });

    it('returns null when not awaiting performRangedAttack', () => {
      const state = updatePhaseState(createEmptyGameState(), {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });
      expect(getLegalRangedAttackers(state)).toBeNull();
    });

    it('returns null when in-play command is not rangedAttack', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 2 },
      });
      let state = createEmptyGameState({ currentInitiative: 'black' });
      state = updateCardState(state, {
        ...state.cardState,
        black: { ...state.cardState.black, inPlay: tempCommandCards[0] },
      });
      state = updateBoardState(
        state,
        addUnitToBoard(state.boardState, attacker),
      );
      state = updatePhaseState(
        state,
        createIssueCommandsPhaseState(state, {
          currentCommandResolutionState: 'pending',
          remainingUnitsFirstPlayer: [attacker.unit],
          step: 'firstPlayerResolveCommands',
        }),
      );
      expect(getLegalRangedAttackers(state)).toBeNull();
    });
  });

  describe(getLegalRangedAttackTargets, () => {
    it('includes an enemy in the attacker front arc within range', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 2 },
      });
      const defender = createUnitWithPlacement({
        coordinate: 'D-5',
        facing: 'south',
        playerSide: 'white',
      });
      const state = awaitingResolve([attacker], [attacker, defender]);

      expect(getLegalRangedAttackTargets(attacker, state)).toStrictEqual([
        defender,
      ]);
    });

    it('excludes enemies outside range / arc', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 1 },
      });
      const outOfRange = createUnitWithPlacement({
        coordinate: 'C-5',
        facing: 'south',
        playerSide: 'white',
      });
      const state = awaitingResolve([attacker], [attacker, outOfRange]);

      expect(getLegalRangedAttackTargets(attacker, state)).toStrictEqual([]);
    });
  });

  describe(getLegalRangedAttackSupporters, () => {
    it('includes a remaining friendly that can also hit the same target', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { instanceNumber: 1, range: 2 },
      });
      const supporter = createUnitWithPlacement({
        coordinate: 'E-4',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { instanceNumber: 2, range: 2 },
      });
      const defender = createUnitWithPlacement({
        coordinate: 'D-5',
        facing: 'south',
        playerSide: 'white',
      });
      const state = awaitingResolve(
        [attacker, supporter],
        [attacker, supporter, defender],
      );

      expect(
        getLegalRangedAttackSupporters(attacker, defender, state),
      ).toStrictEqual([supporter]);
    });

    it('excludes a remaining friendly that cannot hit the target', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { instanceNumber: 1, range: 2 },
      });
      const facingAway = createUnitWithPlacement({
        coordinate: 'E-4',
        facing: 'south',
        playerSide: 'black',
        unitOptions: { instanceNumber: 2, range: 2 },
      });
      const defender = createUnitWithPlacement({
        coordinate: 'D-5',
        facing: 'south',
        playerSide: 'white',
      });
      const state = awaitingResolve(
        [attacker, facingAway],
        [attacker, facingAway, defender],
      );

      expect(
        getLegalRangedAttackSupporters(attacker, defender, state),
      ).toStrictEqual([]);
    });

    it('excludes the attacker itself', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 2 },
      });
      const defender = createUnitWithPlacement({
        coordinate: 'D-5',
        facing: 'south',
        playerSide: 'white',
      });
      const state = awaitingResolve([attacker], [attacker, defender]);

      expect(
        getLegalRangedAttackSupporters(attacker, defender, state),
      ).toStrictEqual([]);
    });
  });
});
