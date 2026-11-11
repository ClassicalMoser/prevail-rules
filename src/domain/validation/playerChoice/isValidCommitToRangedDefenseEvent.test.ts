import {
  createCommitToRangedDefenseEvent,
  createEmptyGameState,
} from '@factories';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidCommitToRangedDefenseEvent } from './isValidCommitToRangedDefenseEvent';

/** A card naming Defence, in white's hand. */
const defenceCard = createTestCard({ modifiers: ['defense'] });
/** The same stat on a card white does not hold. */
const otherDefenceCard = createTestCard({ modifiers: ['defense'] });

/**
 * The target's commitment (§4.3.11 step 5), by membership against
 * getLegalCommitToRangedDefenseEvents: its owner commits a Defence card
 * from hand, or refuses.
 *
 * Black's shot is aimed at a white unit; white holds one Defence card.
 */
describe('isValidCommitToRangedDefenseEvent function', () => {
  function shotAwaitingDefence() {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [defenceCard] },
    });
    // Where the target stands is not read here.
    const target = createUnitWithPlacement({ playerSide: 'white' });
    const shot = createRangedAttackResolutionState(withCards, {
      attackingCommitment: { commitmentType: 'declined' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: target.unit,
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: shot,
      }),
    );
  }

  it('accepts the target’s owner committing its Defence card', () => {
    const event = createCommitToRangedDefenseEvent({
      committedCard: defenceCard,
      modifierTypes: ['defense'],
      player: 'white',
    });

    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({ result: true });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // The real card lists Defence once. A copy listing it twice would count
    // double as a target's defence bonus (§8.4).
    const event = createCommitToRangedDefenseEvent({
      committedCard: { ...defenceCard, modifiers: ['defense', 'defense'] },
      modifierTypes: ['defense'],
      player: 'white',
    });

    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({
      errorReason: `Card ${defenceCard.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('accepts the target’s owner refusing', () => {
    const event = createCommitToRangedDefenseEvent({
      committedCard: null,
      modifierTypes: [],
      player: 'white',
    });

    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({ result: true });
  });

  it('refuses a Defence card the target’s owner does not hold', () => {
    const event = createCommitToRangedDefenseEvent({
      committedCard: otherDefenceCard,
      modifierTypes: ['defense'],
      player: 'white',
    });

    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()).result,
    ).toBe(false);
  });

  it('refuses the shooter committing for the target', () => {
    // Black, the shooter, has no say in the target's Defence.
    const event = createCommitToRangedDefenseEvent({
      committedCard: null,
      modifierTypes: [],
      player: 'black',
    });

    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({
      errorReason:
        'Commit to ranged defense is not legal for black with refuse',
      result: false,
    });
  });
});
