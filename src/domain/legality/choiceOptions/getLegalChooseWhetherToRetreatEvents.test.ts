import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createGameStateMovingInto,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalChooseWhetherToRetreatEvents } from './getLegalChooseWhetherToRetreatEvents';

/** The defender's commitment, made: a stand-in card, since its stat is not read. */
const committed = {
  card: createTestCard(),
  commitmentType: 'completed' as const,
};

/**
 * GetLegalChooseWhetherToRetreatEvents: yes/no for the front-engagement
 * defender when defendingUnitRetreats is pending and retreat is allowed.
 *
 * A defender in a front engagement that is faster than the engaging unit and
 * has somewhere to fall back to may choose to retreat, or stand and fight
 * (§6.3.2). It is asked only at that moment: after its commitment, once its
 * retreat is known to exist, and before it has answered.
 */
describe('getLegalChooseWhetherToRetreatEvents function', () => {
  it('returns yes and no for the defending player', () => {
    // Black's unit moved head on into white's; white has committed, and one
    // way back is open to it.
    const state = createGameStateMovingInto(
      createFrontEngagementState({
        defendingUnitRetreats: 'pending',
        defensiveCommitment: committed,
        retreatPaths: [['step']],
      }),
    );

    // White, the defender, may fall back or stand.
    expect(getLegalChooseWhetherToRetreatEvents(state)).toStrictEqual([
      {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: true,
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: false,
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });

  it('throws when no front engagement is being resolved, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    // Only a front engagement offers a defender the choice.
    expect(() => getLegalChooseWhetherToRetreatEvents(state)).toThrow(
      'No front engagement is being resolved',
    );
  });

  it('throws before the defender has committed, since its commitment comes first', () => {
    // The engagement has just opened; white's commitment is still owed.
    const state = createGameStateMovingInto(createFrontEngagementState());

    // A Speed card committed now could decide whether it may fall back.
    expect(() => getLegalChooseWhetherToRetreatEvents(state)).toThrow(
      'The defender has not yet committed',
    );
  });

  it('throws while it is not yet worked out whether the defender can retreat', () => {
    // White has committed; its Speed and its ways back are still to be found.
    const state = createGameStateMovingInto(
      createFrontEngagementState({
        defensiveCommitment: committed,
        retreatPaths: 'pending',
      }),
    );

    // It is asked only once a retreat is known to exist.
    expect(() => getLegalChooseWhetherToRetreatEvents(state)).toThrow(
      'It is not yet known whether the defender can retreat',
    );
  });

  it('throws when the defender cannot retreat, since it is not asked', () => {
    // White has committed and has no way back.
    const state = createGameStateMovingInto(
      createFrontEngagementState({
        defendingUnitRetreats: 'pending',
        defensiveCommitment: committed,
        retreatPaths: [],
      }),
    );

    // A defender with nowhere to fall back to stays and fights.
    expect(() => getLegalChooseWhetherToRetreatEvents(state)).toThrow(
      'The defender has nowhere to retreat to',
    );
  });

  it('throws once the defender has chosen to stand, since the choice is made', () => {
    // White could have fallen back and chose to stand.
    const state = createGameStateMovingInto(
      createFrontEngagementState({
        defendingUnitRetreats: false,
        defensiveCommitment: committed,
        retreatPaths: [['step']],
      }),
    );

    // The choice is not offered twice.
    expect(() => getLegalChooseWhetherToRetreatEvents(state)).toThrow(
      'The defender has already decided whether to retreat',
    );
  });
});
