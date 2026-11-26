import type { GameState } from '@game';
import { getFrontEngagementStateFromMovement } from '@queries';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyChooseWhetherToRetreatEvent } from './applyChooseWhetherToRetreatEvent';

import {
  createChooseWhetherToRetreatEvent,
  createEmptyGameState,
} from '@factories';

/**
 * Black's Speed-2 unit has walked head-on into white's Speed-3 unit on E-5,
 * and white is now asked whether to fall back: it is strictly faster, and
 * it has declined to commit a card (§6.3.2 steps 1–2).
 *
 * @returns The game waiting on white's `chooseWhetherToRetreat`
 */
function defenderMayFallBack(): GameState {
  // The two units locked in E-5: white facing south, black squared up to it.
  const defender = createTestUnit('white', { speed: 3 });
  const engager = createTestUnit('black', { speed: 2 });
  const engaged = updateCurrentInitiative(
    createGameStateWithEngagedUnits(defender, engager, 'E-5', 'south'),
    'black',
  );

  // The front engagement, with the retreats the engine offers white on open
  // ground behind it.
  const engagement = createFrontEngagementState({
    defensiveCommitment: { commitmentType: 'declined' },
    engagingSpeed: 2,
    retreatPaths: legalRetreatsOf(placed(defender, 'E-5', 'south')),
  });

  // Black's move, which ended in that engagement.
  const movement = createMovementResolutionState(engaged, {
    commitment: { commitmentType: 'declined' },
    engagementState: engagement,
    moveCommander: false,
    movingUnit: engager,
    targetPlacement: { coordinate: 'E-5', facing: 'north' },
  });
  const offered = createGameStateResolvingCommand(movement, engaged);
  return offered;
}

/**
 * Front engagement during movement: the defender says whether it falls back
 * (§6.3.2). Declining ends the engagement; accepting leaves the retreat for
 * `openRetreatFromEngagement` to open.
 */
describe('applyChooseWhetherToRetreatEvent function', () => {
  it('accepting records the choice and leaves the retreat to be opened', () => {
    // §6.3.2: the defender falls back. Where it may go is worked out by the
    // effect that opens the retreat next, so nothing is opened here.
    const state = defenderMayFallBack();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    // White falls back; the retreat is still to open, and the engagement
    // goes on until it has.
    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(true);
    expect(engagementState.engagementResolutionState.retreatState).toBe(
      'pending',
    );
    expect(engagementState.completed).toBe(false);
  });

  it('standing its ground completes the engagement, its retreat bypassed', () => {
    // §6.3.2 step 4: a defender that does not fall back stays locked in,
    // and the two fight in Phase 4.
    const state = defenderMayFallBack();
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    // White stands, and the engagement is settled for the move to finish.
    expect(
      engagementState.engagementResolutionState.defendingUnitRetreats,
    ).toBe(false);
    expect(engagementState.completed).toBe(true);
    // Standing, the defender will never fall back.
    expect(engagementState.engagementResolutionState.retreatState).toBe(
      'bypassed',
    );
  });

  it('leaves the input engagement slice unchanged after apply', () => {
    const state = defenderMayFallBack();
    const engagementBefore =
      getFrontEngagementStateFromMovement(state).engagementResolutionState;
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    applyChooseWhetherToRetreatEvent(event, state);

    // The state it was given still reads as it did: a new state is returned.
    expect(
      getFrontEngagementStateFromMovement(state).engagementResolutionState,
    ).toStrictEqual(engagementBefore);
  });

  it('throws when not in issueCommands', () => {
    // A defender is asked only during a move, in Phase 3.
    const state = createEmptyGameState('standard');
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    expect(() =>
      applyChooseWhetherToRetreatEvent(event, stateInPlayCards),
    ).toThrow(new Error('Not in issueCommands phase'));
  });

  it('throws when current command resolution is not movement', () => {
    // A shot never engages, so no defender is asked to fall back.
    const state = createEmptyGameState('standard');
    const phaseState = createIssueCommandsPhaseState({
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: true,
      player: 'white',
    });

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPhase)).toThrow(
      new Error('Current command resolution is not a movement'),
    );
  });

  it('throws when the move has not met an enemy', () => {
    // A move that has not engaged anyone has no defender to ask.
    const state = createGameStateMovingInto('pending');
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    expect(() => applyChooseWhetherToRetreatEvent(event, state)).toThrow(
      new Error('No engagement state found in movement resolution'),
    );
  });

  it('throws when the engagement is from the flank', () => {
    // A defender hit in the flank may not fall back (§6.3.4), so it is
    // never asked.
    const state = createGameStateMovingInto(createFlankEngagementState());
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    expect(() => applyChooseWhetherToRetreatEvent(event, state)).toThrow(
      new Error('Engagement type is not front'),
    );
  });
});
