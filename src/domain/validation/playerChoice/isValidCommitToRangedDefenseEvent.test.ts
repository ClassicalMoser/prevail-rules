import type { GameState } from '@game';
import {
  createCommitToRangedDefenseEvent,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import {
  createGameStateResolvingCommand,
  createRangedAttackResolutionState,
  createTestCard,
  createUnitWithPlacement,
} from '@testing';
import { updateCurrentInitiative, updatePlayerCardState } from '@transforms';

import { isValidCommitToRangedDefenseEvent } from './isValidCommitToRangedDefenseEvent';

/** A card naming Defence, in white's hand. */
const defenceCard = createTestCard({ modifiers: ['defense'] });
/** The same stat on a card white does not hold. */
const otherDefenceCard = createTestCard({ modifiers: ['defense'] });

/**
 * Black's shot, aimed at a white unit: black has declined to commit, named
 * the target, and white now answers (§4.3.11 step 5). White holds one
 * Defence card.
 */
function shotAwaitingDefence(): GameState {
  // Black holds the initiative, so its Shoot order is the one being resolved.
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  // Where the target stands is not read here.
  const target = createUnitWithPlacement({ playerSide: 'white' });
  const shot = createRangedAttackResolutionState(base, {
    attackingCommitment: { commitmentType: 'declined' },
    defendingCommitment: { commitmentType: 'pending' },
    defendingUnit: target.unit,
  });
  const shooting = createGameStateResolvingCommand(shot, base);

  // White's hand, the cards it may commit from.
  const withHand = updatePlayerCardState(
    shooting,
    'white',
    createOwnedCardState({ inHand: [defenceCard] }),
  );
  return withHand;
}

/**
 * The target's commitment (§4.3.11 step 5), by membership against
 * getLegalCommitToRangedDefenseEvents: its owner commits a Defence card
 * from hand, or refuses.
 *
 * Black's shot is aimed at a white unit; white holds one Defence card.
 */
describe('isValidCommitToRangedDefenseEvent function', () => {
  it('accepts the target’s owner committing its Defence card', () => {
    const event = createCommitToRangedDefenseEvent({
      committedCard: defenceCard,
      player: 'white',
    });

    // White's Defence card is offered, so committing it is legal.
    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({ result: true });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // The real card lists Defence once. A copy listing it twice would count
    // double as a target's defence bonus (§8.4).
    const inflated = createTestCard({
      id: defenceCard.id,
      modifiers: ['defense', 'defense'],
    });
    const event = createCommitToRangedDefenseEvent({
      committedCard: inflated,
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
      committedCard: 'none',
      player: 'white',
    });

    // Declining is always open (§8.3).
    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({ result: true });
  });

  it('refuses a Defence card the target’s owner does not hold', () => {
    const event = createCommitToRangedDefenseEvent({
      committedCard: otherDefenceCard,
      player: 'white',
    });

    // Only a card in hand may be committed (§8.6); the reason names the
    // target's answer to the shot.
    expect(
      isValidCommitToRangedDefenseEvent(event, shotAwaitingDefence()),
    ).toStrictEqual({
      errorReason: `Commit to ranged defense is not legal for white with card ${otherDefenceCard.id}`,
      result: false,
    });
  });

  it('refuses the shooter committing for the target', () => {
    // Black, the shooter, has no say in the target's Defence.
    const event = createCommitToRangedDefenseEvent({
      committedCard: 'none',
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

  it('throws while the shot has no target yet, which the expected check rules out first', () => {
    // The shooter is named but has not yet committed or named its target, so
    // nobody is defending (§7.4.5).
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const shot = createRangedAttackResolutionState(base, {
      attackingCommitment: { commitmentType: 'pending' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: 'pending',
      supportingUnits: 'pending',
    });
    const state = createGameStateResolvingCommand(shot, base);
    const event = createCommitToRangedDefenseEvent({
      committedCard: 'none',
      player: 'white',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidCommitToRangedDefenseEvent(event, state)).toThrow(
      'The shot’s target is not yet named',
    );
  });
});
