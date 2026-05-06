import type { CompleteRangedAttackCommandEvent } from "@events";
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
} from "@testing";
import { StandardBoard } from "@entities";
import type { GameStateForBoard } from "@game";
import { updateCardState, updatePhaseState } from "@transforms/pureTransforms";
import { describe, expect, it } from "vitest";

import { applyCompleteRangedAttackCommandEvent } from "./applyCompleteRangedAttackCommandEvent";

/**
 * Ranged command fully finished (including apply substeps): clears `currentCommandResolutionState`
 * so the issuing player can continue down their remaining-units queue.
 */
describe("applyCompleteRangedAttackCommandEvent", () => {
  it("given issueCommands holding ranged CRS, after effect currentCommandResolutionState is undefined", () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const ranged = createRangedAttackResolutionState(withCards);
    const full: GameStateForBoard<StandardBoard> = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );

    const event = {
      eventNumber: 0,
      eventType: "gameEffect" as const,
      effectType: "completeRangedAttackCommand" as const,
    } satisfies CompleteRangedAttackCommandEvent;

    const next = applyCompleteRangedAttackCommandEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== "issueCommands") throw new Error("issue");
    expect(phase.currentCommandResolutionState).toBeUndefined();
  });
});
