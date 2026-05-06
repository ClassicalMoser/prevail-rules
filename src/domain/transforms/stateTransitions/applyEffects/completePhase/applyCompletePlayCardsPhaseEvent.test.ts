import type { StandardBoard } from "@entities";
import type { CompletePlayCardsPhaseEvent } from "@events";
import type { GameStateForBoard } from "@game";
import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from "@game";

import { createEmptyGameState, createPlayCardsPhaseState } from "@testing";
import { updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";

import { applyCompletePlayCardsPhaseEvent } from "./applyCompletePlayCardsPhaseEvent";

/**
 * End of simultaneous card play: `playCards` is recorded in `completedPhases` and the round
 * advances to `moveCommanders.moveFirstCommander`.
 */
describe("applyCompletePlayCardsPhaseEvent", () => {
  it("given playCards complete step, next phase moveCommanders and completedPhases lists playCards", () => {
    const state = createEmptyGameState();
    const full: GameStateForBoard<StandardBoard> = updatePhaseState(
      state,
      createPlayCardsPhaseState({ step: "complete" }),
    );

    const event: CompletePlayCardsPhaseEvent = {
      eventNumber: 0,
      eventType: "gameEffect",
      effectType: "completePlayCardsPhase",
    };

    const next = applyCompletePlayCardsPhaseEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe(MOVE_COMMANDERS_PHASE);
    expect(phase?.step).toBe("moveFirstCommander");
    const completed = [...next.currentRoundState.completedPhases];
    expect(completed).toHaveLength(1);
    expect(completed[0]?.phase).toBe(PLAY_CARDS_PHASE);
  });
});
