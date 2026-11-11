import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
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

import { createEmptyGameState } from '@factories';
/**
 * Perform-ranged-attack atoms: one attacker, one defender, supporters that
 * can independently hit that defender.
 *
 * Board: letters decrease toward north (A is northernmost).
 */
describe('performRangedAttack legality atoms', () => {
  /** In-play command must be rangedAttack for these atoms to open. */
  const rangedCard = {
    ...createTestCard(),
    command: createTestCommand({ type: 'rangedAttack' }),
  };
  /** Default createTestCard command type is movement. */
  const movementCard = createTestCard();

  function place(...units: ReturnType<typeof createUnitWithPlacement>[]) {
    let state = createEmptyGameState('standard');
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

  describe('getLegalRangedAttackers function', () => {
    it('returns remaining unengaged units with range > 0 and a legal target', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { instanceNumber: 1, range: 2 },
      });
      const defender = createUnitWithPlacement({
        coordinate: 'D-5',
        facing: 'south',
        playerSide: 'white',
      });
      const state = awaitingResolve([attacker], [attacker, defender]);

      expect(getLegalRangedAttackers(state)).toStrictEqual({
        attackers: [attacker],
        player: 'black',
      });
    });

    it('answers that nobody can shoot when the only unit has range 0', () => {
      const meleeOnly = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 0 },
      });
      const state = awaitingResolve([meleeOnly], [meleeOnly]);

      // A real answer: the order ends with no shot taken.
      expect(getLegalRangedAttackers(state)).toStrictEqual({
        attackers: [],
        player: 'black',
      });
    });

    it('answers that nobody can shoot when units have range but no legal target', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 2 },
      });
      const state = awaitingResolve([attacker], [attacker]);

      // A unit with nothing to shoot at is passed over (§4.3.11 step 1).
      expect(getLegalRangedAttackers(state)).toStrictEqual({
        attackers: [],
        player: 'black',
      });
    });

    it('throws when asked outside the issue commands phase, where nothing asks', () => {
      // The players are still choosing their cards.
      const state = updatePhaseState(createEmptyGameState('standard'), {
        phase: PLAY_CARDS_PHASE,
        step: 'chooseCards',
      });
      expect(() => getLegalRangedAttackers(state)).toThrow(
        'Expected issueCommands phase, got playCards',
      );
    });

    it('throws when the card in play is not a ranged attack order', () => {
      const attacker = createUnitWithPlacement({
        coordinate: 'E-5',
        facing: 'north',
        playerSide: 'black',
        unitOptions: { range: 2 },
      });
      let state = createEmptyGameState('standard');
      state = updateCardState(state, {
        ...state.cardState,
        black: { ...state.cardState.black, inPlay: movementCard },
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
      expect(() => getLegalRangedAttackers(state)).toThrow(
        'The card black has in play is not a ranged attack order',
      );
    });
  });

  describe('getLegalRangedAttackTargets function', () => {
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

  describe('getLegalRangedAttackSupporters function', () => {
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
