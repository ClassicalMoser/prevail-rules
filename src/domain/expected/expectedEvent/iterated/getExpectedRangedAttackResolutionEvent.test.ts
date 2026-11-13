import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRout,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import { getExpectedRangedAttackResolutionEvent } from './getExpectedRangedAttackResolutionEvent';

/** An empty board with a card in play on each side. */
function createGameState(): AuthoritativeGameState {
  const state = createEmptyGameState('standard');
  const withCards = updateCardState(state, {
    ...state.cardState,
    black: { ...state.cardState.black, inPlay: createTestCard() },
    white: { ...state.cardState.white, inPlay: createTestCard() },
  });
  return withCards;
}

/**
 * While a shot is carried out, the next event follows the order of a ranged
 * attack (§4.3.11): the shooter's commitment, its target, the target's
 * commitment, the shot itself, its results, and the shot's end. In these
 * cases black shoots at a white unit.
 */
describe('getExpectedRangedAttackResolutionEvent function', () => {
  it('asks the shooter to commit while its commitment is pending', () => {
    // The shooter is named and its card not yet committed or declined.
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackingCommitment: { commitmentType: 'pending' },
    });

    // Black commits before anything else.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      playerSource: 'black',
    });
  });

  it('once the shooter has committed, asks it to name its target', () => {
    // Black refused to commit; nothing is aimed yet (§4.3.11 step 3).
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackingCommitment: { commitmentType: 'declined' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });

    // Black names its target and any supporters.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'performRangedAttack',
      playerSource: 'black',
    });
  });

  it('asks the shooter for its commitment before its target, even with nothing aimed', () => {
    // The shooter is named and nothing else: the card comes first (§4.3.11 step 2).
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackingCommitment: { commitmentType: 'pending' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });

    // A Range card reaches further, so it must be committed before aiming.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToRangedAttack',
      playerSource: 'black',
    });
  });

  it('once the target is named, asks its owner to commit for Defence or Flexibility', () => {
    // Black's shot is aimed at the white unit the fixture names.
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      defendingCommitment: { commitmentType: 'pending' },
    });

    // White, knowing what it faces, decides next.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToRangedDefense',
      playerSource: 'white',
    });
  });

  it('measures the shot once both commitments are made', () => {
    // Both sides have committed, and the shot has not been measured.
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: 'pending',
    });

    // The attack value is set against the target's thresholds.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRangedAttack',
    });
  });

  it("carries out the shot's results while they are under way", () => {
    // The shot reached the target's Rout, and the rout is open but not paid.
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: createAttackApplyStateWithRout(createTestUnit('white')),
    });

    // The rout is carried out next.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('once the shot’s result is settled, expects the shot to be completed', () => {
    // The shot's results have all been carried out.
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      attackApplyState: createAttackApplyStateWithRout(
        createTestUnit('white'),
        { completed: true },
      ),
    });

    // This shot ends, and the next shooter can be chosen.
    expect(
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeRangedAttack',
    });
  });

  it('throws when the shot is already complete', () => {
    // A finished shot expects nothing more; asking is the caller's mistake.
    const gameState = createGameState();
    const resolutionState = createRangedAttackResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedRangedAttackResolutionEvent(
        gameState,
        resolutionState,
        'black',
      ),
    ).toThrow('Ranged attack resolution state is already complete');
  });
});
