/**
 * Canonical list of game-effect discriminator strings (`effectType` on game-effect events).
 *
 * **No imports** — lives in `@ruleValues` so `@entities` expected schemas and `@events` game-effect
 * code can share the same tuple without circular ESM init (`z.enum(undefined)` when `@events` loads
 * mid–`@entities` index evaluation).
 */
export const gameEffects = [
  'completeAttackApply',
  'completeCleanupPhase',
  'completeIssueCommandsPhase',
  'completeMoveCommandersPhase',
  'completeMovementCommand',
  'completePlayCardsPhase',
  'completeMeleeResolution',
  'completeRangedAttackCommand',
  'completeResolveMeleePhase',
  'discardPlayedCards',
  'gameOver',
  'resolveEngageRetreatOption',
  'resolveFlankEngagement',
  'resolveInitiative',
  'resolveMelee',
  'resolveRally',
  'resolveRangedAttack',
  'resolveRetreat',
  'resolveReverse',
  'resolveRout',
  'resolveUnitsBroken',
  'revealCards',
  'completeUnitMovement',
  'startEngagement',
  'triggerRoutFromRetreat',
] as const;

export type GameEffectType = (typeof gameEffects)[number];
