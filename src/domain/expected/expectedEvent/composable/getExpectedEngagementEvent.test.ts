import type { Commitment } from '@game';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';

import { getExpectedEngagementEvent } from './getExpectedEngagementEvent';

/**
 * GetExpectedEngagementEvent: expected player-choice or effect for the current engagement resolution sub-step.
 *
 * Does not validate board context (empty square, already engaged, friendly unit): that belongs to callers
 * that build `EngagementState` from live game state.
 */
describe('getExpectedEngagementEvent function', () => {
  // In every case black's unit moved in, so white's unit is the defender.

  it('throws once the engagement is complete, since the move finishes instead', () => {
    // The engagement is closed; the move that started it should finish now.
    const engagementState = {
      ...createFrontEngagementState(),
      completed: true,
    };

    expect(() => getExpectedEngagementEvent(engagementState, 'black')).toThrow(
      'Engagement state is already complete',
    );
  });

  describe('from the flank the defender is wheeled round (§6.3.4)', () => {
    it('waits on the engine to wheel the defender', () => {
      // The defender has not been turned to face the engaging unit yet.
      const engagementState = createFlankEngagementState({
        defenderRotated: false,
      });

      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveFlankEngagement',
      });
    });

    it('throws once the defender is wheeled but the engagement still reads open', () => {
      // Wheeling the defender closes the engagement in the same write.
      const engagementState = createFlankEngagementState({
        defenderRotated: true,
      });

      expect(() =>
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toThrow(
        'Flank engagement resolution complete but not marked as completed',
      );
    });
  });

  describe('from the rear the defender routs on the spot (§6.3.3)', () => {
    // White's unit, caught from behind.
    const defender = createTestUnit('white');
    // Its rout, paid in full.
    const paid = createRoutState('white', defender, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 1,
    });

    it('waits on the rout of the defender', () => {
      // The rout opened as the engagement started; its Morale is not counted.
      const engagementState = createRearEngagementState({
        routState: createRoutState('white', defender),
      });

      // The open rout's own next step: its Morale counted first.
      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveRout',
      });
    });

    it('throws once the rout is paid and the rear engagement closed, but the engagement still reads open', () => {
      // Paying closes both the rear engagement and the engagement together.
      const engagementState = createRearEngagementState({
        completed: true,
        routState: paid,
      });

      expect(() =>
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toThrow('Rear engagement resolution state is already complete');
    });

    it('throws once the rout is paid but the rear engagement still reads open', () => {
      // Paying closes the rear engagement in the same write.
      const engagementState = createRearEngagementState({ routState: paid });

      expect(() =>
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toThrow('Rear engagement resolution complete but not advanced');
    });
  });

  describe('from the front the defender may fall back if faster (§6.3.2)', () => {
    // White's defender declined to commit a card.
    const declined: Commitment = { commitmentType: 'declined' };
    // The defender: white, on E-5 facing north.
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    // Open ground behind: one way back.
    const openGround = legalRetreatsOf(defender);
    // A black unit on F-5 looking away blocks the space straight back but not
    // the way round, leaving two tied ways back (§9.1.3).
    const tied = legalRetreatsOf(defender, [
      createUnitWithPlacement({
        coordinate: 'F-5',
        facing: 'south',
        playerSide: 'black',
      }),
    ]);

    it('first asks the defender whether to commit a card', () => {
      // The engagement has just started.
      const engagementState = createFrontEngagementState();

      // The defender is the side that did not move in.
      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'playerChoice',
        choiceType: 'commitToMovement',
        playerSource: 'white',
      });
    });

    it('then waits on the engine to compare Speeds and find where the defender may fall back', () => {
      // The defender's commitment is in; whether it may fall back is not known.
      const engagementState = createFrontEngagementState({
        defensiveCommitment: declined,
      });

      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveEngageRetreatOption',
      });
    });

    it('throws when the defender was found no retreat but the engagement still reads open', () => {
      // No retreat closes the engagement in the same write; the two fight in
      // Phase 4.
      const engagementState = createFrontEngagementState({
        defensiveCommitment: declined,
        retreatPaths: [],
      });

      expect(() =>
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toThrow('Defending unit cannot retreat');
    });

    it('asks a defender with somewhere to go whether to fall back', () => {
      // The defender is the faster and has a way back.
      const engagementState = createFrontEngagementState({
        defensiveCommitment: declined,
        retreatPaths: openGround,
      });

      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'playerChoice',
        choiceType: 'chooseWhetherToRetreat',
        playerSource: 'white',
      });
    });

    it('throws when the defender chose to stand but the engagement still reads open', () => {
      // Standing closes the engagement in the same write.
      const engagementState = createFrontEngagementState({
        defendingUnitRetreats: false,
        defensiveCommitment: declined,
        retreatPaths: openGround,
        retreatState: 'bypassed',
      });

      expect(() =>
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toThrow(
        'Front engagement resolution complete but not marked as completed',
      );
    });

    it('opens the retreat once the defender has chosen to fall back', () => {
      // §6.3.2: the defender accepted, and its retreat is not open yet; the
      // effect that opens it works out where it may go.
      const engagementState = createFrontEngagementState({
        defendingUnitRetreats: true,
        defensiveCommitment: declined,
        retreatPaths: openGround,
      });

      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openRetreatFromEngagement',
      });
    });

    it('asks the defender to choose among tied ways back once its retreat is open', () => {
      // Two tied ways back, so the defender has a real choice to make.
      const engagementState = createFrontEngagementState({
        defendingUnitRetreats: true,
        defensiveCommitment: declined,
        retreatPaths: tied,
        retreatState: createRetreatState(defender.unit, tied),
      });

      // The open retreat's own next step, asked of the retreating unit's owner.
      expect(
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toStrictEqual({
        actionType: 'playerChoice',
        choiceType: 'chooseRetreatOption',
        playerSource: 'white',
      });
    });

    it('throws once the retreat is finished but the engagement still reads open', () => {
      // The one way back was taken; finishing the retreat ends the engagement
      // with no melee (§6.3.2 step 3).
      const engagementState = createFrontEngagementState({
        defendingUnitRetreats: true,
        defensiveCommitment: declined,
        retreatPaths: openGround,
        retreatState: createRetreatState(defender.unit, openGround, {
          completed: true,
        }),
      });

      expect(() =>
        getExpectedEngagementEvent(engagementState, 'black'),
      ).toThrow(
        'Front engagement retreat completed but engagement not marked as completed',
      );
    });
  });

  it('refuses an engagement of no known kind, by name', () => {
    const front = createFrontEngagementState();
    const engagementState = {
      ...front,
      engagementResolutionState: {
        ...front.engagementResolutionState,
        // An engagement type the type forbids, to reach the refusal.
        engagementType: 'invalid',
      } as never,
    };

    expect(() => getExpectedEngagementEvent(engagementState, 'black')).toThrow(
      'Invalid engagement type',
    );
  });
});
