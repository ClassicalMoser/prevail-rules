import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';
import { createEmptyGameState } from '@factories';

import { getLegalCommitToRangedDefenseEvents } from './getLegalCommitToRangedDefenseEvents';

/** A card naming Defence: what a shot's target may commit. */
const defenceCard = createTestCard({ modifiers: ['defense'] });
/** A card naming Attack alone: no use to a target. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** A card naming Range alone: a shooter's stat, not a target's. */
const rangeCard = createTestCard({ modifiers: ['range'] });
/**
 * A card naming Flexibility and Attack: the target may commit it for its
 * Flexibility, which shrinks a deficit on its thresholds (§2.5.2); the Attack
 * on it is no use to a target.
 */
const flexibilityAttackCard = createTestCard({
  modifiers: ['flexibility', 'attack'],
});

/**
 * The target of a shot may commit a card once it is named (§4.3.11 step 5):
 * one event per card in hand naming Defence or Flexibility (§8.4), with exactly
 * those of its stats, plus a refusal, offered to the target's owner only.
 */
describe('getLegalCommitToRangedDefenseEvents function', () => {
  /** Black shoots at a white unit; the shooter has refused to commit. */
  function shot(
    whiteHand: ReturnType<typeof createTestCard>[],
    target: 'named' | 'pending',
  ) {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: whiteHand },
    });
    // Where the target stands is not read here.
    const whiteUnit = createUnitWithPlacement({ playerSide: 'white' }).unit;
    const ranged = createRangedAttackResolutionState(withCards, {
      attackingCommitment: { commitmentType: 'declined' },
      defendingCommitment: { commitmentType: 'pending' },
      defendingUnit: target === 'named' ? whiteUnit : 'pending',
      supportingUnits: target === 'named' ? [] : 'pending',
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
  }

  const refuseWhite = {
    choiceType: 'commitToRangedDefense' as const,
    committedCard: null,
    eventType: 'playerChoice' as const,
    modifierTypes: [] as const,
    player: 'white' as const,
  };

  it('offers the target’s owner each Defence card in hand, and a refusal', () => {
    // White holds a Defence card among others it cannot use here.
    const state = shot([attackCard, defenceCard, rangeCard], 'named');

    expect(getLegalCommitToRangedDefenseEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedDefense',
        committedCard: defenceCard,
        eventType: 'playerChoice',
        modifierTypes: ['defense'],
        player: 'white',
      },
      refuseWhite,
    ]);
  });

  it('offers a Flexibility card for its Flexibility alone', () => {
    // §2.5.2: a deficit penalises a unit's thresholds too, so Flexibility can
    // help a target; the card's Attack cannot, and is not applied.
    const state = shot([flexibilityAttackCard], 'named');

    expect(getLegalCommitToRangedDefenseEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedDefense',
        committedCard: flexibilityAttackCard,
        eventType: 'playerChoice',
        modifierTypes: ['flexibility'],
        player: 'white',
      },
      refuseWhite,
    ]);
  });

  it('a target with no Defence or Flexibility card may only refuse', () => {
    // White's Attack and Range cards are no use to a target (§8.4).
    const state = shot([attackCard, rangeCard], 'named');

    expect(getLegalCommitToRangedDefenseEvents(state)).toStrictEqual([
      refuseWhite,
    ]);
  });

  it('offers nothing before the target is named', () => {
    // The shooter has committed but not yet aimed: there is no one to defend.
    const state = shot([defenceCard], 'pending');

    expect(getLegalCommitToRangedDefenseEvents(state)).toStrictEqual([]);
  });

  it('offers nothing outside a Shoot order', () => {
    // Cards are being chosen, no shots taken.
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });

    expect(getLegalCommitToRangedDefenseEvents(state)).toStrictEqual([]);
  });
});
