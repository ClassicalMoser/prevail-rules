import type { GameStateForBoard } from "@game";
import type { StandardBoard } from "@entities";

import { MOVE_COMMANDERS_PHASE } from "@game";
import { tempCommandCards } from "@sampleValues";
import { createEmptyGameState } from "@testing";
import { updateCardState, updatePhaseState } from "@transforms";
import { describe, expect, it } from "vitest";
import { generateCompleteMoveCommandersPhaseEvent } from "./generateCompleteMoveCommandersPhaseEvent";

/**
 * Move-commanders phase complete: each player’s `inPlay` command (if any) becomes a “remaining”
 * command for the next issue-commands round. First vs second player sets follow `currentInitiative`.
 */
describe("generateCompleteMoveCommandersPhaseEvent", () => {
  /** Black initiative, both inPlay set, MOVE_COMMANDERS_PHASE step `complete`. */
  function createGameStateInCompleteStep(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: "black" });
    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inPlay: tempCommandCards[0] },
      white: { ...current.white, inPlay: tempCommandCards[1] },
    }));
    return updatePhaseState(stateWithCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: "complete",
    });
  }

  it("given both inPlay populated, maps each side command into remainingCommands sets", () => {
    const state = createGameStateInCompleteStep();

    const event = generateCompleteMoveCommandersPhaseEvent(state, 0);

    expect(event.eventType).toBe("gameEffect");
    expect(event.effectType).toBe("completeMoveCommandersPhase");
    expect(event.remainingCommandsFirstPlayer).toEqual(new Set([tempCommandCards[0].command]));
    expect(event.remainingCommandsSecondPlayer).toEqual(new Set([tempCommandCards[1].command]));
  });

  it("given both inPlay null at phase complete, remaining command sets are empty", () => {
    const state = createEmptyGameState();
    const withoutInPlay = updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inPlay: null },
      white: { ...current.white, inPlay: null },
    }));
    const stateWithPhase = updatePhaseState(withoutInPlay, {
      phase: MOVE_COMMANDERS_PHASE,
      step: "complete",
    });

    const event = generateCompleteMoveCommandersPhaseEvent(stateWithPhase, 0);

    expect(event.remainingCommandsFirstPlayer.size).toBe(0);
    expect(event.remainingCommandsSecondPlayer.size).toBe(0);
  });

  it("given white initiative, white command is first-player set and black is second", () => {
    const base = createEmptyGameState({ currentInitiative: "white" });
    const withCards = updateCardState(base, (current) => ({
      ...current,
      black: { ...current.black, inPlay: tempCommandCards[0] },
      white: { ...current.white, inPlay: tempCommandCards[1] },
    }));
    const state = updatePhaseState(withCards, {
      phase: MOVE_COMMANDERS_PHASE,
      step: "complete",
    });

    const event = generateCompleteMoveCommandersPhaseEvent(state, 0);

    expect(event.remainingCommandsFirstPlayer).toEqual(new Set([tempCommandCards[1].command]));
    expect(event.remainingCommandsSecondPlayer).toEqual(new Set([tempCommandCards[0].command]));
  });
});
