import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createGameStateWithUnits,
  createMovementResolutionState,
  createRearEngagementState,
  createTestCard,
  createTestUnit,
  placed,
  updateCardState,
} from '@testing';
import { getExpectedMovementResolutionEvent } from './getExpectedMovementResolutionEvent';

/** The game as given, with a card in play for black, the side moving. */
function withBlackCardInPlay(
  state: AuthoritativeGameState,
): AuthoritativeGameState {
  const withCard = updateCardState(state, {
    ...state.cardState,
    black: { ...state.cardState.black, inPlay: createTestCard() },
  });
  return withCard;
}

/** A white unit on E-6, the space the fixture's black mover ends in. */
function enemyOnTarget(): AuthoritativeGameState {
  const state = createGameStateWithUnits([
    placed(createTestUnit('white'), 'E-6', 'north'),
  ]);
  const withCard = withBlackCardInPlay(state);
  return withCard;
}

/**
 * While a unit carries out its move, the next event follows the order of a
 * move (§4.3.10): its commitment, then the move itself, then any engagement
 * the move starts, then the move's end.
 */
describe('getExpectedMovementResolutionEvent function', () => {
  it('asks the moving player to commit while the commitment is pending', () => {
    // Black's unit is chosen and its card not yet committed or declined.
    const gameState = withBlackCardInPlay(createGameStateWithUnits([]));
    const resolutionState = createMovementResolutionState(gameState, {
      commitment: { commitmentType: 'pending' },
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

  it('starts an engagement when the move ends on an enemy', () => {
    // The move is written to end on E-6, where a white unit stands.
    const gameState = enemyOnTarget();
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
    const gameState = withBlackCardInPlay(createEmptyGameState('standard'));
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
    const gameState = enemyOnTarget();
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
    const gameState = enemyOnTarget();
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
    const gameState = withBlackCardInPlay(createEmptyGameState('standard'));
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

  it('throws when the move is already complete', () => {
    // A finished move expects nothing more; asking is the caller's mistake.
    const gameState = enemyOnTarget();
    const resolutionState = createMovementResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedMovementResolutionEvent(gameState, resolutionState, 'black'),
    ).toThrow('Movement resolution state is already complete');
  });
});
