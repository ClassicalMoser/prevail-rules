import type { PlayerChoiceEventForBoard } from "@events";
import { createEmptyGameState } from "@testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyChooseCardEvent } from "./applyChoices";
import { applyPlayerChoiceEvent } from "./applyPlayerChoiceEvent";

vi.mock("./applyChoices", () => ({
  applyChooseCardEvent: vi.fn(),
  applyChooseMeleeEvent: vi.fn(),
  applyChooseRallyEvent: vi.fn(),
  applyChooseRetreatOptionEvent: vi.fn(),
  applyChooseRoutDiscardEvent: vi.fn(),
  applyChooseWhetherToRetreatEvent: vi.fn(),
  applyCommitToMeleeEvent: vi.fn(),
  applyCommitToMovementEvent: vi.fn(),
  applyCommitToRangedAttackEvent: vi.fn(),
  applyIssueCommandEvent: vi.fn(),
  applyMoveCommanderEvent: vi.fn(),
  applyMoveUnitEvent: vi.fn(),
  applyPerformRangedAttackEvent: vi.fn(),
  applySetupUnitsEvent: vi.fn(),
}));

/**
 * Smoke tests only: real routing coverage lives on each `applyChoices/*` module.
 */
describe("applyPlayerChoiceEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to the handler for the matching choiceType and returns its result", () => {
    const state = createEmptyGameState();
    const event = {
      eventNumber: 0,
      eventType: "playerChoice" as const,
      boardType: "standard" as const,
      player: "black" as const,
      choiceType: "chooseCard" as const,
    } as unknown as PlayerChoiceEventForBoard<typeof state.boardState>;

    vi.mocked(applyChooseCardEvent).mockReturnValue(state);

    const result = applyPlayerChoiceEvent(event, state);

    expect(applyChooseCardEvent).toHaveBeenCalledWith(event, state);
    expect(result).toBe(state);
  });

  it("throws when choiceType is not handled by the switch", () => {
    const state = createEmptyGameState();
    const event = {
      eventNumber: 0,
      eventType: "playerChoice",
      boardType: "standard",
      player: "black",
      choiceType: "unknown",
    } as unknown as PlayerChoiceEventForBoard<typeof state.boardState>;

    expect(() => applyPlayerChoiceEvent(event, state)).toThrow(
      "Unknown player choice event type: unknown",
    );
  });
});
