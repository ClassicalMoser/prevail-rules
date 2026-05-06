import type { GameEffectEventForBoard } from "@events";
import { createEmptyGameState } from "@testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyDiscardPlayedCardsEvent } from "./applyEffects";
import { applyGameEffectEvent } from "./applyGameEffectEvent";

vi.mock("./applyEffects", () => ({
  applyCompleteAttackApplyEvent: vi.fn(),
  applyCompleteCleanupPhaseEvent: vi.fn(),
  applyCompleteIssueCommandsPhaseEvent: vi.fn(),
  applyCompleteMeleeResolutionEvent: vi.fn(),
  applyCompleteMoveCommandersPhaseEvent: vi.fn(),
  applyCompletePlayCardsPhaseEvent: vi.fn(),
  applyCompleteRangedAttackCommandEvent: vi.fn(),
  applyCompleteResolveMeleePhaseEvent: vi.fn(),
  applyCompleteUnitMovementEvent: vi.fn(),
  applyDiscardPlayedCardsEvent: vi.fn(),
  applyResolveEngageRetreatOptionEvent: vi.fn(),
  applyResolveFlankEngagementEvent: vi.fn(),
  applyResolveInitiativeEvent: vi.fn(),
  applyResolveMeleeEvent: vi.fn(),
  applyResolveRallyEvent: vi.fn(),
  applyResolveRangedAttackEvent: vi.fn(),
  applyResolveRetreatEvent: vi.fn(),
  applyResolveReverseEvent: vi.fn(),
  applyResolveRoutEvent: vi.fn(),
  applyResolveUnitsBrokenEvent: vi.fn(),
  applyRevealCardsEvent: vi.fn(),
  applyStartEngagementEvent: vi.fn(),
  applyTriggerRoutFromRetreatEvent: vi.fn(),
}));

/**
 * Smoke tests only: real routing coverage lives on each `applyEffects/*` module.
 */
describe("applyGameEffectEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to the handler for the matching effectType and returns its result", () => {
    const state = createEmptyGameState();
    const event = {
      eventNumber: 0,
      eventType: "gameEffect" as const,
      boardType: "standard" as const,
      effectType: "discardPlayedCards" as const,
    } as GameEffectEventForBoard<typeof state.boardState>;

    vi.mocked(applyDiscardPlayedCardsEvent).mockReturnValue(state);

    const result = applyGameEffectEvent(event, state);

    expect(applyDiscardPlayedCardsEvent).toHaveBeenCalledWith(event, state);
    expect(result).toBe(state);
  });

  it("throws when effectType is not handled by the switch", () => {
    const state = createEmptyGameState();
    const event = {
      eventNumber: 0,
      eventType: "gameEffect",
      effectType: "unknown",
    } as unknown as GameEffectEventForBoard<typeof state.boardState>;

    expect(() => applyGameEffectEvent(event, state)).toThrow(
      "Unreachable: unhandled game effect event (effectType not in switch)",
    );
  });
});
