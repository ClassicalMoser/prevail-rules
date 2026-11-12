/**
 * Event discriminator literals only — no imports from `gameEffects` / `eventType` / schemas.
 * Game-effect and player-choice modules import from here so `eventType.ts` can safely pull
 * `gameEffectEventSchema` without circular init while cards are still loading.
 */
export const eventTypes = ['playerChoice', 'gameEffect'] as const;

/** The two kinds of event: a player's act, or a fact the game records. */
export type EventTypeLiteral = (typeof eventTypes)[number];

/** The kind of event a player's act is. */
export const PLAYER_CHOICE_EVENT_TYPE: 'playerChoice' = eventTypes[0];

/** The kind of event a fact the game records is. */
export const GAME_EFFECT_EVENT_TYPE: 'gameEffect' = eventTypes[1];
