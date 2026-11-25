import type { ValidationResult } from '@utils';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { isValidAssignUnitSupportEvent } from './isValidAssignUnitSupportEvent';
import { isValidChooseCardEvent } from './isValidChooseCardEvent';
import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';
import { isValidChooseRoutDiscardEvent } from './isValidChooseRoutDiscardEvent';
import { isValidChooseMeleeResolutionEvent } from './isValidMeleeResolutionEvent';
import { isValidChooseRetreatOptionEvent } from './isValidChooseRetreatOptionEvent';
import { isValidChooseWhetherToRetreatEvent } from './isValidChooseWhetherToRetreatEvent';
import { isValidCommitToMeleeEvent } from './isValidCommitToMeleeEvent';
import { isValidCommitToMovementEvent } from './isValidCommitToMovementEvent';
import { isValidCommitToRangedAttackEvent } from './isValidCommitToRangedAttackEvent';
import { isValidCommitToRangedDefenseEvent } from './isValidCommitToRangedDefenseEvent';
import { isValidIssueCommandsEvent } from './isValidIssueCommandsEvent';
import { isValidMoveCommanderEvent } from './isValidMoveCommanderEvent';
import { isValidChooseMovingUnitEvent } from './isValidChooseMovingUnitEvent';
import { isValidMoveUnitEvent } from './isValidMoveUnitEvent';
import { isValidChooseShooterEvent } from './isValidChooseShooterEvent';
import { isValidPerformRangedAttackEvent } from './isValidPerformRangedAttackEvent';
import { isValidSetupUnitsEvent } from './isValidSetupUnitsEvent';

/**
 * Validates that a player choice event is legal under the rules by checking
 * membership against the legality layer's enumerated options (where available).
 *
 * The last question `validatePlayerChoice` asks, once the choice is known to
 * be the one expected and well formed. Each kind of choice is judged by its
 * own validator; this only hands it there, and catches nothing, so a fault a
 * validator finds rises to the entry point as it was thrown.
 *
 * @param event - The player choice event to validate
 * @param state - The current authoritative game state
 * @returns ValidationResult indicating if the player choice event is legal
 */
export function validateLegalPlayerChoice(
  event: PlayerChoiceEvent,
  state: GameState,
): ValidationResult {
  switch (event.choiceType) {
    case 'assignUnitSupport': {
      // After a rally, every unit takes a place under the unit support the hand
      // holds, and an open place an uncovered unit could take must be filled
      // (§10.4.4–10.4.5).
      const support = isValidAssignUnitSupportEvent(event, state);
      return support;
    }
    case 'chooseCard': {
      // A card laid face down in Phase 1 must be one in the player's own hand
      // (§4.1.1).
      const card = isValidChooseCardEvent(event, state);
      return card;
    }
    case 'chooseMeleeResolution': {
      // The first player picks which engagement to fight next, from those still
      // unfought (§4.4.2).
      const meleeOrder = isValidChooseMeleeResolutionEvent(event, state);
      return meleeOrder;
    }
    case 'moveCommander': {
      // A commander moves up to four spaces, never into an enemy (§4.2).
      const commanderMove = isValidMoveCommanderEvent(event, state);
      return commanderMove;
    }
    case 'chooseRally': {
      // At cleanup the first player, then the second, decides whether to rally
      // (§4.5.2–4.5.3).
      const rally = isValidChooseRallyEvent(event, state);
      return rally;
    }
    case 'chooseRoutDiscard': {
      // A rout is paid for with as many cards from hand as the unit's Morale
      // (§9.3.2).
      const discard = isValidChooseRoutDiscardEvent(event, state);
      return discard;
    }
    case 'chooseRetreatOption': {
      // Where several smallest retreats tie, the owner picks one of them
      // (§9.1.3).
      const retreat = isValidChooseRetreatOptionEvent(event, state);
      return retreat;
    }
    case 'chooseWhetherToRetreat': {
      // A defender faster than the unit engaging it from the front may fall back
      // or stand (§6.3.2).
      const fallBack = isValidChooseWhetherToRetreatEvent(event, state);
      return fallBack;
    }
    case 'commitToMelee': {
      // A card committed to a melee comes from hand and names a stat the melee
      // uses, or none is committed (§7.2.2, §8.4).
      const meleeCommitment = isValidCommitToMeleeEvent(event, state);
      return meleeCommitment;
    }
    case 'commitToMovement': {
      // A card committed to a move, or to a front-engagement defence, comes from
      // hand and names Speed or Flexibility, or none is committed (§8.4).
      const movementCommitment = isValidCommitToMovementEvent(event, state);
      return movementCommitment;
    }
    case 'commitToRangedAttack': {
      // The shooter's one card comes from hand and names Attack, Range or
      // Flexibility, or none is committed (§4.3.11 step 2).
      const attackCommitment = isValidCommitToRangedAttackEvent(event, state);
      return attackCommitment;
    }
    case 'commitToRangedDefense': {
      // The target's owner commits a card from hand naming Defence or Flexibility,
      // or none (§4.3.11 step 5).
      const defenceCommitment = isValidCommitToRangedDefenseEvent(event, state);
      return defenceCommitment;
    }
    case 'chooseMovingUnit': {
      // A Move order's next unit is one it ordered that has not yet moved
      // (§4.3.9).
      const nextMover = isValidChooseMovingUnitEvent(event, state);
      return nextMover;
    }
    case 'moveUnit': {
      // A move's path spends no more Speed and Flexibility than the unit has,
      // and ends where a unit may stand (§5).
      const move = isValidMoveUnitEvent(event, state);
      return move;
    }
    case 'issueCommands': {
      // The command on the card in play is spent on units or lines that may be
      // ordered, within its number (§4.3.2–4.3.6).
      const orders = isValidIssueCommandsEvent(event, state);
      return orders;
    }
    case 'setupUnits': {
      // At setup a side places its whole army, and its commander, in its own
      // zone, one unit to a space (§3.5).
      const deployment = isValidSetupUnitsEvent(event, state);
      return deployment;
    }
    case 'chooseShooter': {
      // A Shoot order's next shooter is one it ordered, unengaged, with a target
      // in reach (§4.3.11 step 1).
      const nextShooter = isValidChooseShooterEvent(event, state);
      return nextShooter;
    }
    case 'performRangedAttack': {
      // A shot's target is an unengaged enemy in the shooter's arc, and each
      // supporter could make the same shot itself (§4.3.11 steps 3–4).
      const shot = isValidPerformRangedAttackEvent(event, state);
      return shot;
    }
    default: {
      // Every choice type has a case above, so the type leaves nothing here.
      // TODO(wrong): this returns the unhandled event itself as though it were
      // a ValidationResult, where every other exhaustive default in the
      // domain throws (`applyPlayerChoiceEvent`, `procedureRegistry`). A
      // choice type added without a case would reach a caller as an object
      // with no `result`, which reads as a refusal with no reason. Settled by
      // throwing `Unknown player choice type`, which `validatePlayerChoice`
      // turns into a refusal; a spec forcing an unknown choice through with
      // `as never` would then pin it.
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
