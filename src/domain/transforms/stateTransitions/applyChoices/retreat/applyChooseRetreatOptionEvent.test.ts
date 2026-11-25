import type { MoveDelta, PlayerSide, UnitWithPlacement } from '@entities';
import type { AuthoritativeGameState, GameState } from '@game';
import {
  getFrontEngagementRetreatState,
  getMeleeRetreatState,
  getOtherPlayer,
  getRangedAttackRetreatState,
} from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  enemyBlockingStraightBack,
  legalRetreatsOf,
  placed,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyChooseRetreatOptionEvent } from './applyChooseRetreatOptionEvent';

import { createChooseRetreatOptionEvent } from '@factories';

/**
 * A unit on E-5 facing north, forced back, with an enemy on F-5 that has its
 * back to it: the enemy bars the straight step back without cutting the
 * retreat off, which leaves two equally small ways round it, a 45° turn
 * either way and a step (§9.1.3). Its owner chooses between them.
 *
 * Black holds the initiative throughout.
 *
 * @param side - The side of the unit falling back
 * @param others - Who else stands on the board besides it and the enemy behind it
 * @returns The game with those units placed, the unit falling back, and the
 * retreats the engine offers it
 */
function fallingBackFromE5(
  side: PlayerSide,
  others: UnitWithPlacement[],
): {
  retreating: UnitWithPlacement;
  retreats: MoveDelta[][];
  state: AuthoritativeGameState;
} {
  // The unit falling back, and the enemy at its back.
  const retreating = placed(createTestUnit(side), 'E-5', 'north');
  const blocker = enemyBlockingStraightBack(retreating);

  // The retreats are the engine's to work out, from the unit and the enemy
  // behind it.
  const retreats = legalRetreatsOf(retreating, [blocker]);

  // Everyone on the board, black to act first.
  const state = updateCurrentInitiative(
    createGameStateWithUnits([retreating, blocker, ...others]),
    'black',
  );
  return { retreating, retreats, state };
}

/**
 * After `resolveRetreat` lists the legal ways back, the defender picks one by its path: this choice writes
 * `chosenRetreatPath` on the active retreat substep (ranged attack-apply or the correct melee side).
 */
describe('applyChooseRetreatOptionEvent function', () => {
  /**
   * White's unit on E-5 driven back by a shot from black's Range-2 unit on
   * C-5, its retreat open on the shot's attack apply.
   */
  function whiteFallingBackFromShot(): GameState {
    const shooter = placed(
      createTestUnit('black', { range: 2 }),
      'C-5',
      'south',
    );
    const { retreating, retreats, state } = fallingBackFromE5('white', [
      shooter,
    ]);
    const shot = createRangedAttackResolutionState(state, {
      attackApplyState: createAttackApplyStateWithRetreat(
        retreating.unit,
        retreats,
      ),
      attackingCommitment: { commitmentType: 'declined' },
      attackingUnit: shooter.unit,
      defendingCommitment: { commitmentType: 'declined' },
      defendingUnit: retreating.unit,
    });
    const shooting = createGameStateResolvingCommand(shot, state);
    return shooting;
  }

  /**
   * One side's unit on E-5 driven back in a melee with an enemy in its
   * space, its retreat open on its own side's attack apply.
   */
  function fallingBackFromMelee(side: PlayerSide): GameState {
    // The enemy it is fighting, squared up to it in E-5.
    const opponent = placed(
      createTestUnit(getOtherPlayer(side), { instanceNumber: 2 }),
      'E-5',
      'south',
    );
    const { retreating, retreats, state } = fallingBackFromE5(side, [opponent]);

    // Black holds the initiative, so its unit is the first player's, and
    // white's the second's (§4.1.5).
    const retreatApply = createAttackApplyStateWithRetreat(
      retreating.unit,
      retreats,
    );
    const melee = createMeleeResolutionState(
      state,
      side === 'white'
        ? { attackOnSecondPlayerApplyState: retreatApply }
        : { attackOnFirstPlayerApplyState: retreatApply },
    );
    const fighting = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );
    return fighting;
  }

  it('records the path white chose on the retreat a shot forced', () => {
    const state = whiteFallingBackFromShot();

    // White takes the way round that turns right, then steps back.
    const newState = applyChooseRetreatOptionEvent(
      createChooseRetreatOptionEvent({
        path: ['turnRight', 'step'],
        player: 'white',
      }),
      state,
    );

    // That is the retreat to carry out.
    expect(
      getRangedAttackRetreatState(newState).chosenRetreatPath,
    ).toStrictEqual(['turnRight', 'step']);
  });

  it('records the path white chose on its own side of a melee', () => {
    const state = fallingBackFromMelee('white');

    // White, the second player, takes the right-hand way round.
    const newState = applyChooseRetreatOptionEvent(
      createChooseRetreatOptionEvent({
        path: ['turnRight', 'step'],
        player: 'white',
      }),
      state,
    );

    // White's retreat records it.
    expect(
      getMeleeRetreatState(newState, 'white').chosenRetreatPath,
    ).toStrictEqual(['turnRight', 'step']);
  });

  it('records the path black chose on its own side of a melee', () => {
    const state = fallingBackFromMelee('black');

    // Black, the first player, takes the right-hand way round.
    const newState = applyChooseRetreatOptionEvent(
      createChooseRetreatOptionEvent({
        path: ['turnRight', 'step'],
        player: 'black',
      }),
      state,
    );

    // Black's retreat records it.
    expect(
      getMeleeRetreatState(newState, 'black').chosenRetreatPath,
    ).toStrictEqual(['turnRight', 'step']);
  });

  it('records the chosen retreat on a front-engagement nested retreat', () => {
    // Black's unit has walked head-on into white's on E-5, and white has
    // chosen to fall back (§6.3.2).
    const engager = placed(
      createTestUnit('black', { instanceNumber: 2 }),
      'E-5',
      'south',
    );
    const { retreating, retreats, state } = fallingBackFromE5('white', [
      engager,
    ]);
    const movement = createMovementResolutionState(state, {
      commitment: { commitmentType: 'declined' },
      engagementState: createFrontEngagementState({
        defendingUnitRetreats: true,
        defensiveCommitment: { commitmentType: 'declined' },
        retreatPaths: retreats,
        retreatState: createRetreatState(retreating.unit, retreats),
      }),
      moveCommander: false,
      movingUnit: engager.unit,
      targetPlacement: engager.placement,
    });
    const moving = createGameStateResolvingCommand(movement, state);

    // White takes the right-hand way round.
    const newState = applyChooseRetreatOptionEvent(
      createChooseRetreatOptionEvent({
        path: ['turnRight', 'step'],
        player: 'white',
      }),
      moving,
    );

    // The retreat inside the engagement records it.
    expect(
      getFrontEngagementRetreatState(newState).chosenRetreatPath,
    ).toStrictEqual(['turnRight', 'step']);
  });

  it('throws when the player choosing has no retreat open', () => {
    // A shot that reached none of white's thresholds: white is not falling
    // back, so it has no retreat to choose.
    const shooter = placed(
      createTestUnit('black', { range: 2 }),
      'C-5',
      'south',
    );
    const { retreating, state } = fallingBackFromE5('white', [shooter]);
    const shot = createRangedAttackResolutionState(state, {
      attackApplyState: createAttackApplyStateWithNothingDue(retreating.unit),
      attackingCommitment: { commitmentType: 'declined' },
      attackingUnit: shooter.unit,
      defendingCommitment: { commitmentType: 'declined' },
      defendingUnit: retreating.unit,
    });
    const shooting = createGameStateResolvingCommand(shot, state);

    expect(() =>
      applyChooseRetreatOptionEvent(
        createChooseRetreatOptionEvent({
          path: ['turnRight', 'step'],
          player: 'white',
        }),
        shooting,
      ),
    ).toThrow(new Error('No retreat is in play for white'));
  });
});
