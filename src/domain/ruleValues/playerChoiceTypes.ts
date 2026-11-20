/**
 * Canonical list of player-choice discriminator strings (`choiceType` on
 * player-choice events), written out by hand.
 *
 * **No imports**: it lives in `@ruleValues`, beside the game-effect types, so
 * every layer can name a choice without loading the choice events.
 * `playerChoice.ts` in `@events` asserts it against the union of choice
 * events, so a missing or extra entry fails to compile.
 */
export const playerChoices = [
  'assignUnitSupport',
  'chooseCard',
  'chooseShooter',
  'chooseMeleeResolution',
  'chooseMovingUnit',
  'chooseRally',
  'chooseRoutDiscard',
  'chooseRetreatOption',
  'commitToMelee',
  'commitToMovement',
  'chooseWhetherToRetreat',
  'commitToRangedAttack',
  'commitToRangedDefense',
  'issueCommands',
  'moveCommander',
  'moveUnit',
  'performRangedAttack',
  'setupUnits',
] as const;

/** Discriminator string for a player-choice event (`choiceType`). */
export type PlayerChoiceType = (typeof playerChoices)[number];
