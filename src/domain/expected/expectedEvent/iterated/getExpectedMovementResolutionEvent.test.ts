import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createGameState,
  createMovementResolutionState,
  createRearEngagementState,
  createTestCard,
} from '@testing';
import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';

/**
 * A white unit on E-6, the space the fixture's black mover ends its move in.
 * The mover itself is named on the resolution state and need not stand on
 * the board for this sequencer, which reads only the space the move ends in.
 */
const whiteOnTarget: Parameters<typeof createGameState>[0] = [
  { coord: 'E-6', facing: 'north', player: 'white' },
];

/**
 * While a unit carries out its move, the next event follows the order of a
 * move (§4.3.10): its commitment, then the move itself, then any engagement
 * the move starts, then the move's end.
 */
describe('getExpectedMovementResolutionEvent function', () => {
  it('asks the moving player to commit while the commitment is pending', () => {
    // Black's unit is chosen; no card is committed or declined, and so the
    // move is not yet written either.
    const gameState = createEmptyGameState('standard');
    const resolutionState = createMovementResolutionState(gameState, {
      commitment: { commitmentType: 'pending' },
      targetPlacement: 'pending',
    });

    // The commitment comes before the move.
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMovement',
      playerSource: 'black',
    });
  });

  it('asks the moving player to write the move once the commitment is settled', () => {
    // Black declined to commit, and the move is not yet written.
    const gameState = createEmptyGameState('standard');
    const resolutionState = createMovementResolutionState(gameState, {
      commitment: { commitmentType: 'declined' },
      targetPlacement: 'pending',
    });

    // The move comes next, with any commitment already counted (§4.3.10).
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'moveUnit',
      playerSource: 'black',
    });
  });

  it('starts an engagement when the move ends on an enemy', () => {
    // The move is written to end on E-6, where a white unit stands.
    const gameState = createGameState(whiteOnTarget);
    const resolutionState = createMovementResolutionState(gameState);

    // Ending on an enemy engages it (§6.1.1).
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'startEngagement',
    });
  });

  it('finishes the move when it ends on open ground', () => {
    // The move is written to end on E-6, which is empty.
    const gameState = createEmptyGameState('standard');
    const resolutionState = createMovementResolutionState(gameState);

    // Nothing to engage, so the move is done.
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('finishes the move once its engagement is settled', () => {
    // The move engaged the white unit, and that engagement is over.
    const gameState = createGameState(whiteOnTarget);
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: { ...createFrontEngagementState(), completed: true },
    });

    // The move is done.
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeUnitMovement',
    });
  });

  it('asks the engagement what comes next while it is under way', () => {
    // A front engagement: the defender has committed, and its retreats are
    // not yet worked out (§6.3.2).
    const gameState = createGameState(whiteOnTarget);
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: createFrontEngagementState({
        defensiveCommitment: {
          card: createTestCard(),
          commitmentType: 'completed',
        },
        retreatPaths: 'pending',
      }),
    });

    // The engagement works out where the defender could fall back to.
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveEngageRetreatOption',
    });
  });

  it('a rear engagement under way decides what comes next, though its defender has left the board', () => {
    // §6.3.3: a rear engagement routs the defender off the board at once,
    // but its owner still owes the Morale. The empty target space must not
    // end the move before that rout is paid.
    const gameState = createEmptyGameState('standard');
    const resolutionState = createMovementResolutionState(gameState, {
      engagementState: createRearEngagementState(),
    });

    // The rout is carried out next, not the end of the move.
    expect(
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });
});
