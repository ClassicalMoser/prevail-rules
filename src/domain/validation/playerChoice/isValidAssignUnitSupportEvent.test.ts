import type { CommandCard, UnitSupport } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createAssignUnitSupportEvent, createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createPlayableGame,
  createRallyResolutionState,
  createTestCard,
  createTestUnit,
  getUnitByTrait,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidAssignUnitSupportEvent } from './isValidAssignUnitSupportEvent';

/**
 * After a rally, the player who rallied gives each unit on the board one
 * place in a stack their hand holds (§10.4.4). They must fill any open place
 * an uncovered unit could take (§10.4.5), and whatever is left over routs
 * (§10.4.6). The rules live in the legal options; these cases show the
 * validator accepts what they offer and words what they refuse.
 *
 * White holds the initiative and is rallying first. The units are stand-in
 * rows told apart by trait: foot with the formation trait alone, a phalanx
 * that is formation as well, and horse with no formation trait.
 */
const foot = createTestUnit('white', { unitType: getUnitByTrait('formation') });
const phalanx = createTestUnit('white', {
  unitType: getUnitByTrait('formation', 'phalanx'),
});
const horse = createTestUnit('white', { unitType: getUnitByTrait('cavalry') });

/** A stack of places for any formation unit. */
const formationStack: UnitSupport = {
  count: 1,
  supportType: 'trait',
  trait: 'formation',
};

/** A stack of one place for any unit at all. */
const genericStack: UnitSupport = { count: 1, supportType: 'generic' };

/** A card holding this stack, and nothing else that matters here. */
function cardHolding(unitSupport: UnitSupport): CommandCard {
  const card = createTestCard({ unitSupport });
  return card;
}

/**
 * The game at White's support check: the rally has burnt its card and taken
 * the rest back into hand, and no unit has been given a place yet
 * (§10.3.2 step 4).
 */
function onWhiteSupportCheck(
  units: Parameters<typeof createPlayableGame>[0],
  hand: CommandCard[],
): AuthoritativeGameState {
  // White's hand is every card it still owns, back from the rally.
  const game = createPlayableGame(units, {
    hands: { white: hand },
    initiative: 'white',
  });

  // White chose to rally and the burn is done, so the check is due.
  const rally = createRallyResolutionState({
    playerRallied: true,
    rallyResolved: true,
  });
  const cleanup = createCleanupPhaseState({
    firstPlayerRallyResolutionState: rally,
    step: 'firstPlayerResolveRally',
  });
  const onCheck = updatePhaseState(game, cleanup);
  return onCheck;
}

describe('isValidAssignUnitSupportEvent function', () => {
  it('accepts filling the one place a stack holds, and letting a matching unit left over rout', () => {
    // One place for any unit, and two units on the board.
    const state = onWhiteSupportCheck(
      [
        { coord: 'E-5', player: 'white', unitType: foot.unitType },
        { coord: 'E-6', player: 'white', unitType: horse.unitType },
      ],
      [cardHolding(genericStack)],
    );

    // The foot takes the place; the stack is full, so the horse routs.
    const event = createAssignUnitSupportEvent({
      assignments: [{ unit: foot, unitSupport: genericStack }],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts no assignment when no stack matches any unit on the board', () => {
    // A formation stack, and only horse on the board: a stack need not be
    // filled when no unit matches it (§10.4.4), so the horse routs.
    const state = onWhiteSupportCheck(
      [{ coord: 'E-5', player: 'white', unitType: horse.unitType }],
      [cardHolding(formationStack)],
    );
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a poor choice of stack that leaves a place open no uncovered unit can take', () => {
    // A place for the phalanx's own type, and a place for any formation unit.
    const phalanxTypeStack: UnitSupport = {
      count: 1,
      supportType: 'unitType',
      unitTypeId: phalanx.unitType.id,
    };
    const state = onWhiteSupportCheck(
      [
        { coord: 'E-5', player: 'white', unitType: phalanx.unitType },
        { coord: 'E-6', player: 'white', unitType: foot.unitType },
      ],
      [cardHolding(phalanxTypeStack), cardHolding(formationStack)],
    );

    // The phalanx takes the formation place the foot needed. The phalanx
    // place stays open, but the foot cannot take it, so the foot routs. The
    // player need not find the arrangement that saves the most (§10.4.5).
    const event = createAssignUnitSupportEvent({
      assignments: [{ unit: phalanx, unitSupport: formationStack }],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('refuses stopping while an open place could take an uncovered unit', () => {
    // A formation place, and foot that could take it.
    const state = onWhiteSupportCheck(
      [{ coord: 'E-5', player: 'white', unitType: foot.unitType }],
      [cardHolding(formationStack)],
    );

    // Leaving the place empty would rout the foot for nothing (§10.4.5).
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      errorReason:
        'Support assignment is not maximal: unused slots could still cover uncovered units',
      result: false,
    });
  });

  it('refuses a second unit in a stack whose one place is filled', () => {
    // One place for any unit, and two units on the board.
    const state = onWhiteSupportCheck(
      [
        { coord: 'E-5', player: 'white', unitType: foot.unitType },
        { coord: 'E-6', player: 'white', unitType: horse.unitType },
      ],
      [cardHolding(genericStack)],
    );

    // Both are put in it; the horse, second, finds the place taken. The
    // reason is judged against the places filled before it alone.
    const event = createAssignUnitSupportEvent({
      assignments: [
        { unit: foot, unitSupport: genericStack },
        { unit: horse, unitSupport: genericStack },
      ],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      errorReason: 'Assignment for generic:1 exceeds support count 1',
      result: false,
    });
  });

  it('refuses a unit in a stack it does not match', () => {
    // A formation place, foot that matches it and horse that does not.
    const state = onWhiteSupportCheck(
      [
        { coord: 'E-5', player: 'white', unitType: foot.unitType },
        { coord: 'E-6', player: 'white', unitType: horse.unitType },
      ],
      [cardHolding(formationStack)],
    );

    // The horse is put in the formation stack (§10.4.4).
    const event = createAssignUnitSupportEvent({
      assignments: [{ unit: horse, unitSupport: formationStack }],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      errorReason: 'Unit does not match support trait:formation:1',
      result: false,
    });
  });

  it('refuses the same unit given the same place twice, since a unit takes only one place', () => {
    const state = onWhiteSupportCheck(
      [{ coord: 'E-5', player: 'white', unitType: foot.unitType }],
      [cardHolding(formationStack)],
    );
    // The unit is listed twice under the one unit support (§10.4.4).
    const event = createAssignUnitSupportEvent({
      assignments: [
        { unit: foot, unitSupport: formationStack },
        { unit: foot, unitSupport: formationStack },
      ],
      player: 'white',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      errorReason: 'Unit is assigned support more than once',
      result: false,
    });
  });

  it('refuses an assignment from the player who did not rally', () => {
    const state = onWhiteSupportCheck(
      [{ coord: 'E-5', player: 'white', unitType: foot.unitType }],
      [cardHolding(formationStack)],
    );

    // Only the player who rallied checks their units (§10.4.1).
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'black',
    });

    expect(isValidAssignUnitSupportEvent(event, state)).toStrictEqual({
      errorReason: 'Expected assign unit support from white, got black',
      result: false,
    });
  });

  it('throws when asked where no rally awaits unit support, which the expected check rules out first', () => {
    const event = createAssignUnitSupportEvent({
      assignments: [],
      player: 'white',
    });

    // Support sent with no round under way is refused by the expected check
    // before membership is asked; reaching here is a fault.
    expect(() =>
      isValidAssignUnitSupportEvent(event, createEmptyGameState('standard')),
    ).toThrow('No current phase state found');
  });
});
