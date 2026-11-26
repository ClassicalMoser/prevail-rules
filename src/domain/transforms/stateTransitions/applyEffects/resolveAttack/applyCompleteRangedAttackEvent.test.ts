import type { UnitWithPlacement } from '@entities';
import type { CompleteRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createTestCommand,
  createTestUnit,
  createUnitWithPlacement,
  placed,
  updateCardState,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteRangedAttackEvent } from './applyCompleteRangedAttackEvent';

const event = {
  effectType: 'completeRangedAttack' as const,
  eventType: 'gameEffect' as const,
} satisfies CompleteRangedAttackEvent;

/** The order being carried out is a Shoot order. */
const rangedCard = {
  ...createTestCard(),
  command: createTestCommand({ type: 'rangedAttack' }),
};

/**
 * One shot of a Shoot order is done (§4.3.11): the shot is cleared and the
 * next shooter may be chosen. The order ends when no ordered unit is left.
 */
describe('applyCompleteRangedAttackEvent function', () => {
  /** Black's archer on G-5, whose shot has just been carried out. */
  const shooter = placed(
    createTestUnit('black', { instanceNumber: 2, range: 2 }),
    'G-5',
    'north',
  );

  /** White's unit on E-5, which the shot reached and did not move. */
  const target = placed(createTestUnit('white'), 'E-5', 'south');

  /** Black resolving a Shoot order with these units still to act, and a shot under way. */
  function resolvingWithShotUnderWay(
    remaining: UnitWithPlacement[],
  ): GameState {
    // Black holds the initiative and plays a Shoot card.
    const base = updateCurrentInitiative(
      createGameStateWithUnits([shooter, target, ...remaining]),
      'black',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: rangedCard },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });

    // The shot's results, none of them due, are carried out and closed.
    const shot = createRangedAttackResolutionState(withCards, {
      attackApplyState: createAttackApplyStateWithNothingDue(target.unit, {
        completed: true,
      }),
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const resolving = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState({
        currentCommandResolutionState: shot,
        remainingUnitsFirstPlayer: remaining.map((entry) => entry.unit),
        step: 'firstPlayerResolveCommands',
      }),
    );
    return resolving;
  }

  it('clears the shot and keeps a unit still to act, even one with no target now', () => {
    // A unit with no enemy in reach is not dropped from the order: a later
    // shot may give it a target.
    const waiting = createUnitWithPlacement({
      coordinate: 'E-9',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const state = resolvingWithShotUnderWay([waiting]);

    const next = applyCompleteRangedAttackEvent(event, state);

    // No shot is under way, and Black is still carrying out its order.
    expect(getIssueCommandsPhaseState(next)).toMatchObject({
      currentCommandResolutionState: 'pending',
      remainingUnitsFirstPlayer: [waiting.unit],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('leaves the step where it is when no ordered unit is left to act, for the order to be completed next', () => {
    const state = resolvingWithShotUnderWay([]);

    const next = applyCompleteRangedAttackEvent(event, state);

    const phase = getIssueCommandsPhaseState(next);
    // The shot is cleared. Ending the order is not this effect's to decide:
    // the expected engine sees no unit left and asks for
    // completeRangedAttackCommand.
    expect(phase.step).toBe('firstPlayerResolveCommands');
    expect(phase.currentCommandResolutionState).toBe('pending');
  });
});
