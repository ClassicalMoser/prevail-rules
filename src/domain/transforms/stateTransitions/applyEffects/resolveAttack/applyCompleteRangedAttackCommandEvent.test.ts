import type { CompleteRangedAttackCommandEvent } from '@events';
import { getIssueCommandsPhaseState } from '@queries';
import {
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCompleteRangedAttackCommandEvent } from './applyCompleteRangedAttackCommandEvent';

const event = {
  effectType: 'completeRangedAttackCommand' as const,
  eventType: 'gameEffect' as const,
} satisfies CompleteRangedAttackCommandEvent;

/** In-play command must be rangedAttack for this complete-effect path. */
const rangedCard = {
  ...createTestCard(),
  command: createTestCommand({ type: 'rangedAttack' }),
};

/**
 * A Shoot order ends when no shooter can be chosen (§4.3.11 step 1): the units
 * left are skipped, the player's remaining orders are finished, and the resolve
 * step advances.
 */
describe('applyCompleteRangedAttackCommandEvent function', () => {
  it('ends the order of a player whose remaining units have no legal target, and advances to the second player', () => {
    // Black holds the initiative and plays a Shoot card; its archer on E-5
    // has no enemy anywhere on the board to shoot at.
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const base = updateCurrentInitiative(
      createGameStateWithUnits([attacker]),
      'black',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: rangedCard },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    // Black is carrying out its order, the archer still to act and no shot
    // under way.
    const state = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [attacker.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    const next = applyCompleteRangedAttackCommandEvent(event, state);

    // The unit had no target, so it is skipped, and its owner's orders are done.
    // White issues its orders next.
    expect(getIssueCommandsPhaseState(next)).toMatchObject({
      remainingUnitsFirstPlayer: [],
      step: 'secondPlayerIssueCommands',
    });
  });
});
