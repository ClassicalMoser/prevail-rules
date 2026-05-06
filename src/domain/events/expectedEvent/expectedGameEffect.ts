import type { GameEffectType } from "@ruleValues";

/**
 * Expected event is a game effect (deterministic action).
 * Board-agnostic: spatial payloads live on {@link GameEffectEvent}, not here (Layer 4).
 */
export interface ExpectedGameEffect {
  /** Discriminator for the union. */
  actionType: "gameEffect";
  /** The specific effect type expected (e.g., 'resolveRally', 'revealCards'). */
  effectType: GameEffectType;
}
