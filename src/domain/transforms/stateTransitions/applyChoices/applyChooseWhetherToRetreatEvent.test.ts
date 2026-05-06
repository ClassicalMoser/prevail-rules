import type { ChooseWhetherToRetreatEvent } from "@events";
import { getFrontEngagementStateFromMovement } from "@queries";
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
} from "@testing";
import { updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";
import { applyChooseWhetherToRetreatEvent } from "./applyChooseWhetherToRetreatEvent";

/**
 * Front engagement during movement: defender commits whether to attempt retreat before the
 * engine resolves strike; stored on `engagementResolutionState.defendingUnitRetreats`.
 */
describe("applyChooseWhetherToRetreatEvent", () => {
  /** issueCommands with movement CRS and default front engagement factory state. */
  function createStateWithFrontEngagement() {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state, {
        engagementState: createFrontEngagementState(),
      }),
    });
    return updatePhaseState(state, phaseState);
  }

  it("given front engagement and white choosesToRetreat true, defendingUnitRetreats is true", () => {
    const state = createStateWithFrontEngagement();
    const event: ChooseWhetherToRetreatEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseWhetherToRetreat",
      player: "white",
      choosesToRetreat: true,
    };

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    expect(engagementState.engagementResolutionState.defendingUnitRetreats).toBe(true);
  });

  it("given same stack and white choosesToRetreat false, defendingUnitRetreats is false", () => {
    const state = createStateWithFrontEngagement();
    const event: ChooseWhetherToRetreatEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseWhetherToRetreat",
      player: "white",
      choosesToRetreat: false,
    };

    const newState = applyChooseWhetherToRetreatEvent(event, state);
    const engagementState = getFrontEngagementStateFromMovement(newState);

    expect(engagementState.engagementResolutionState.defendingUnitRetreats).toBe(false);
  });

  it("given black defender events, true vs false flip defendingUnitRetreats the same as white", () => {
    const state = createStateWithFrontEngagement();
    const retreatEvent: ChooseWhetherToRetreatEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseWhetherToRetreat",
      player: "black",
      choosesToRetreat: true,
    };
    const stayEvent: ChooseWhetherToRetreatEvent = {
      ...retreatEvent,
      choosesToRetreat: false,
    };

    expect(
      getFrontEngagementStateFromMovement(applyChooseWhetherToRetreatEvent(retreatEvent, state))
        .engagementResolutionState.defendingUnitRetreats,
    ).toBe(true);
    expect(
      getFrontEngagementStateFromMovement(applyChooseWhetherToRetreatEvent(stayEvent, state))
        .engagementResolutionState.defendingUnitRetreats,
    ).toBe(false);
  });

  it("given engagement snapshot before apply, input movement engagement slice unchanged after apply", () => {
    const state = createStateWithFrontEngagement();
    const engagementBefore = getFrontEngagementStateFromMovement(state).engagementResolutionState;
    const event: ChooseWhetherToRetreatEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseWhetherToRetreat",
      player: "white",
      choosesToRetreat: true,
    };

    applyChooseWhetherToRetreatEvent(event, state);

    expect(getFrontEngagementStateFromMovement(state).engagementResolutionState).toEqual(
      engagementBefore,
    );
  });

  it("given playCards phase, throws not in issueCommands", () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(state, createPlayCardsPhaseState());
    const event: ChooseWhetherToRetreatEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseWhetherToRetreat",
      player: "white",
      choosesToRetreat: true,
    };

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPlayCards)).toThrow(
      "Not in issueCommands phase",
    );
  });

  it("given issueCommands ranged CRS, throws current command resolution is not movement", () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const event: ChooseWhetherToRetreatEvent = {
      eventNumber: 0,
      eventType: "playerChoice",
      choiceType: "chooseWhetherToRetreat",
      player: "white",
      choosesToRetreat: true,
    };

    expect(() => applyChooseWhetherToRetreatEvent(event, stateInPhase)).toThrow(
      "Current command resolution is not a movement",
    );
  });
});
