/**
 * Event discriminator literals only — no imports from `gameEffects` / `eventType` / schemas.
 * Game-effect and player-choice modules import from here so `eventType.ts` can safely pull
 * `gameEffectEventSchema` without circular init while cards are still loading.
 */
export const eventTypes = ["playerChoice", "gameEffect"] as const;

export type EventTypeLiteral = (typeof eventTypes)[number];

export const PLAYER_CHOICE_EVENT_TYPE: "playerChoice" = eventTypes[0];

export const GAME_EFFECT_EVENT_TYPE: "gameEffect" = eventTypes[1];
