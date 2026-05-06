import type { StandardBoard } from "@entities";
import type { GameStateForBoard } from "@game";
import { gameEffects, GameEffectType } from "@events";
import { createEmptyGameState, procedureRegistryStateFactories } from "@testing";
import { describe, expect, it } from "vitest";

import { generateEventFromProcedure } from "./procedureRegistry";

/**
 * Central dispatch: `generateEventFromProcedure` is overloaded per `effectType` literal.
 * Each row builds minimal valid state from `procedureRegistryStateFactories` and checks the
 * emitted `gameEffect` matches that key. `effectType as never` satisfies overload resolution
 * when the argument is a dynamic union element.
 */
describe("generateEventFromProcedure", () => {
  it.each([...gameEffects])(
    "given factory state for %s, returns gameEffect with matching effectType",
    (effectType) => {
      const state = procedureRegistryStateFactories[effectType]();
      const event = generateEventFromProcedure(state, 0, effectType);
      expect(event.eventType).toBe("gameEffect");
      expect(event.effectType).toBe(effectType);
    },
  );

  it("given effectType not in registry, throws naming the non-existent key", () => {
    const state: GameStateForBoard<StandardBoard> = createEmptyGameState();
    // Deliberate use of unsafe cast to GameEffectType to test the error message
    expect(() => generateEventFromProcedure(state, 0, "notARealEffect" as GameEffectType)).toThrow(
      "No procedure exists for effect type: notARealEffect",
    );
  });
});
