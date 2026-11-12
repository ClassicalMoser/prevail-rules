// What every decision is made from.
export type { BotContext } from './botContext';

// Round 0: deploying the army.
export { chooseSetup } from './chooseSetup';

// Phase 1 and 2: the card to play and where the general goes.
export { choosePlayCard } from './choosePlayCard';
export { chooseCommanderMove } from './chooseCommanderMove';

// Phase 3: orders, moves and shots.
export { chooseOrder } from './chooseOrder';
export { chooseMovingUnit, chooseUnitMove } from './chooseMovement';
export { chooseShooter, chooseShotTarget } from './chooseShot';
export { appraiseBestShot, appraiseMoveGain } from './appraiseOrder';

// Cards committed for +1, whenever the rules allow it.
export {
  chooseCommitment,
  meleeCommitmentGain,
  movementCommitmentGain,
  rangedAttackCommitmentGain,
  rangedDefenseCommitmentGain,
} from './chooseCommitment';

// Engagements and their fights.
export {
  chooseNextFight,
  chooseRetreatOption,
  chooseWhetherToRetreat,
} from './chooseFight';

// Paying for routs, and Phase 5's rally.
export { chooseRoutDiscard } from './chooseRoutDiscard';
export { chooseRally, chooseUnitSupport } from './chooseRally';
