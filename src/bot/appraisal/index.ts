// What a bot takes in before it decides.
export type { BattlefieldSurvey } from './battlefieldSurvey';
export { surveyBattlefield } from './battlefieldSurvey';

// How it values a fight, a place to stand, and a card.
export {
  appraiseAttack,
  appraiseMelee,
  CARD_WORTH,
  lossFromResult,
} from './appraiseCombat';
export { appraisePlacement } from './appraisePlacement';
export { appraiseCard, appraiseKeeping, appraisePlaying } from './appraiseCard';

// Who keeps a place under a hand's unit support (§10.4).
export type { SupportStack } from './placeUnderSupport';
export { placeUnderSupport, stacksFor } from './placeUnderSupport';

// The plain geometry it judges by.
export { facingAlignment } from './facingAlignment';

// What it has already read from a view, so it reads each stat once.
export { recallAttackResult, recallStat } from './recallStat';

// How it picks among scored options.
export { pickBest } from './pickBest';
