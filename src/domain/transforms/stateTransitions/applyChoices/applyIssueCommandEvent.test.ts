import type { IssueCommandEvent } from "@events";
import type { GameStateForBoard } from "@game";
import { ISSUE_COMMANDS_PHASE } from "@game";

import { getIssueCommandsPhaseState } from "@queries";
import { tempCommandCards } from "@sampleValues";
import { createEmptyGameState, createTestUnit } from "@testing";
import { updateCardState, updatePhaseState } from "@transforms/pureTransforms";
import { isSameUnitInstance } from "@validation";
import { describe, expect, it } from "vitest";
import { applyIssueCommandEvent } from "./applyIssueCommandEvent";
import { StandardBoard } from "@entities";

/**
 * Issue-commands: spending a command type removes it from the side’s remaining set and adds
 * the chosen unit instances to the round’s `commandedUnits` (for later resolution ordering).
 */
describe("applyIssueCommandEvent", () => {
  /** firstPlayerIssueCommands with one command left per side from two inPlay cards. */
  function createGameStateWithCommands(
    currentInitiative: "black" | "white" = "black",
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });
    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: tempCommandCards[0],
      },
      white: {
        ...current.white,
        inPlay: tempCommandCards[1],
      },
    }));

    const blackCommand = tempCommandCards[0].command;
    const whiteCommand = tempCommandCards[1].command;

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: ISSUE_COMMANDS_PHASE,
      step: "firstPlayerIssueCommands",
      boardType: "standard",
      remainingCommandsFirstPlayer: new Set([blackCommand]),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set([whiteCommand]),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    });

    return stateWithPhase;
  }

  describe("command spend and commandedUnits", () => {
    it("given black issues their remaining command with one unit, command drops from first-player set and unit commanded", () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit("black", { attack: 3 });
      const command = tempCommandCards[0].command;

      const event: IssueCommandEvent = {
        eventNumber: 0,
        eventType: "playerChoice",
        choiceType: "issueCommand",
        player: "black",
        command,
        units: new Set([unit]),
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== "issueCommands") {
        throw new Error("Expected issueCommands phase");
      }

      expect(phaseState.remainingCommandsFirstPlayer.has(command)).toBe(false);
      // Check unit presence using value equality, not reference equality
      const unitInCommandedUnits = [...newState.currentRoundState.commandedUnits].some(
        (u) => isSameUnitInstance(u, unit).result,
      );
      expect(unitInCommandedUnits).toBe(true);
    });

    it("given white issues second-player command, remainingCommandsSecondPlayer loses that command", () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit("white", { attack: 3 });
      const command = tempCommandCards[1].command;

      const event: IssueCommandEvent = {
        eventNumber: 0,
        eventType: "playerChoice",
        choiceType: "issueCommand",
        player: "white",
        command,
        units: new Set([unit]),
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== "issueCommands") {
        throw new Error("Expected issueCommands phase");
      }

      expect(phaseState.remainingCommandsSecondPlayer.has(command)).toBe(false);
      // Check unit presence using value equality, not reference equality
      const unitInCommandedUnits = [...newState.currentRoundState.commandedUnits].some(
        (u) => isSameUnitInstance(u, unit).result,
      );
      expect(unitInCommandedUnits).toBe(true);
    });

    it("given black issues one command for two units, both appear in commandedUnits size 2", () => {
      const state = createGameStateWithCommands();
      const unit1 = createTestUnit("black", { attack: 3 });
      const unit2 = createTestUnit("black", { attack: 3, instanceNumber: 2 });
      const command = tempCommandCards[0].command;

      const event: IssueCommandEvent = {
        eventNumber: 0,
        eventType: "playerChoice",
        choiceType: "issueCommand",
        player: "black",
        command,
        units: new Set([unit1, unit2]),
      };

      const newState = applyIssueCommandEvent(event, state);

      // Check unit presence using value equality, not reference equality
      const unit1InCommandedUnits = [...newState.currentRoundState.commandedUnits].some(
        (u) => isSameUnitInstance(u, unit1).result,
      );
      const unit2InCommandedUnits = [...newState.currentRoundState.commandedUnits].some(
        (u) => isSameUnitInstance(u, unit2).result,
      );
      expect(unit1InCommandedUnits).toBe(true);
      expect(unit2InCommandedUnits).toBe(true);
      expect(newState.currentRoundState.commandedUnits.size).toBe(2);
    });
  });

  describe("structural update", () => {
    it("given phase commandedUnits and remaining set sizes before apply, input state unchanged after apply", () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit("black", { attack: 3 });
      const command = tempCommandCards[0].command;
      const phaseState = getIssueCommandsPhaseState(state);
      const originalRemainingCommandsSize = phaseState.remainingCommandsFirstPlayer.size;
      const originalCommandedUnitsSize = state.currentRoundState.commandedUnits.size;

      const event: IssueCommandEvent = {
        eventNumber: 0,
        eventType: "playerChoice",
        choiceType: "issueCommand",
        player: "black",
        command,
        units: new Set([unit]),
      };

      applyIssueCommandEvent(event, state);

      // Original state should be unchanged
      const phaseStateAfter = getIssueCommandsPhaseState(state);
      expect(phaseStateAfter.remainingCommandsFirstPlayer.size).toBe(originalRemainingCommandsSize);
      expect(state.currentRoundState.commandedUnits.size).toBe(originalCommandedUnitsSize);
    });
  });
});
