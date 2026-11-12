// What a bot takes in before it decides.
export type { BattlefieldSurvey } from './battlefieldSurvey';
export { surveyBattlefield } from './battlefieldSurvey';

// How it values a fight, a place to stand, and a card.
export {
  appraiseBlow,
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
export { boardDistance, facingAlignment } from './boardDistance';

// What it has already read from a view, so it reads each stat once.
export { recallBlow, recallStat } from './recallStat';

// How it picks among scored options.
export { pickBest } from './pickBest';
