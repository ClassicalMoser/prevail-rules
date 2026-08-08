import type { CompleteRangedAttackCommandEvent } from '@events';
import type { GameState } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteRangedAttackCommandEvent } from './applyCompleteRangedAttackCommandEvent';

const event = {
  effectType: 'completeRangedAttackCommand' as const,
  eventNumber: 0,
  eventType: 'gameEffect' as const,
} satisfies CompleteRangedAttackCommandEvent;

const rangedCard =
  tempCommandCards.find((card) => card.command.type === 'rangedAttack') ??
  tempCommandCards[15];

/**
 * Ranged command finished or unfireable remaining: clear CRS; keep shooters or
 * advance the resolve step when nobody has a legal target.
 */
describe(applyCompleteRangedAttackCommandEvent, () => {
  it('given issueCommands holding ranged CRS, after effect currentCommandResolutionState is pending', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const ranged = createRangedAttackResolutionState(withCards);
    const full: GameState = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );

    const next = applyCompleteRangedAttackCommandEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    expect(phase.currentCommandResolutionState).toBe('pending');
  });

  it('given remaining ranged units with no legal target, clears them and advances to secondPlayerIssueCommands', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
      white: { ...state.cardState.white, inPlay: createTestCard() },
    });
    state = updateBoardState(state, addUnitToBoard(state.boardState, attacker));
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [attacker.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteRangedAttackCommandEvent(event, state);
    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    expect(phase.step).toBe('secondPlayerIssueCommands');
    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([]);
    expect(phase.currentCommandResolutionState).toBe('pending');
  });

  it('given a remaining shooter with a legal target, keeps that unit in remaining', () => {
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
    let state = createEmptyGameState({ currentInitiative: 'black' });
    state = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: rangedCard },
      white: { ...state.cardState.white, inPlay: createTestCard() },
    });
    state = updateBoardState(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, attacker), defender),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [attacker.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteRangedAttackCommandEvent(event, state);
    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    expect(phase.step).toBe('firstPlayerResolveCommands');
    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([attacker.unit]);
  });
});
