import { createEmptyGameState } from '@factories';
import {
  getCleanupPhaseState,
  getMeleeRoutState,
  getRangedAttackRetreatState,
  getRangedAttackRoutState,
  getRearEngagementRoutState,
  getRoutStateFromRally,
} from '@queries';
import { throwIfPending } from '@utils';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createCleanupPhaseStateWithRallyRout,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';

import { updateCurrentInitiative } from '../state/updateCurrentInitiative';
import { updatePhaseState } from '../state/updatePhaseState';
import { updateRoutState } from './updateRoutState';

/**
 * A rout is opened by whatever caused it: an attack's results, a rear
 * engagement (§6.3.3), a rally's support check (§10.4.6), or a retreat with
 * nowhere to go (§9.1.6). This writer finds the one the routing player owns
 * and writes the rout there as it now stands; it never opens one, and closing
 * the parent is `settleRout`'s.
 */
describe('updateRoutState function', () => {
  const whiteUnit = createTestUnit('white', { attack: 2 });
  const blackUnit = createTestUnit('black', { attack: 2 });

  // White's rout once its cost is worked out: two cards, not yet chosen.
  const priced = createRoutState('white', whiteUnit, { numberToDiscard: 2 });

  it('writes the rout of a defender caught from behind onto the rear engagement', () => {
    // A move came up behind white's unit, whose rout is open.
    const defender = createTestUnit('white');
    const caught = createGameStateMovingInto(createRearEngagementState());
    const owed = createRoutState('white', defender, { numberToDiscard: 2 });

    const after = updateRoutState(caught, owed);

    // The rear engagement holds the priced rout.
    expect(getRearEngagementRoutState(after)).toBe(owed);
  });

  it('writes the rout a shot caused onto the shot’s results', () => {
    // A shot routed white's unit outright, and the rout is open.
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithRout(whiteUnit),
      }),
      empty,
    );

    const after = updateRoutState(shooting, priced);

    // The shot's results hold the priced rout.
    expect(getRangedAttackRoutState(after)).toBe(priced);
  });

  it('writes the rout of a unit that could not retreat into the retreat, not onto the results around it', () => {
    // A shot drove white's unit back against the board's south edge, so its
    // retreat holds an open rout.
    const atTheEdge = legalRetreatsOf(placed(whiteUnit, 'L-5', 'north'));
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithRetreat(
          whiteUnit,
          atTheEdge,
          {
            retreatState: createRetreatState(whiteUnit, atTheEdge, {
              routState: createRoutState('white', whiteUnit),
            }),
          },
        ),
      }),
      empty,
    );

    const after = updateRoutState(shooting, priced);

    // The retreat holds the priced rout.
    expect(getRangedAttackRetreatState(after).routState).toBe(priced);
  });

  it('in a melee where both units routed, writes only the routing player’s side', () => {
    // Black holds the initiative; each blow routed the other unit, and both
    // routs are open.
    const blackRout = createRoutState('black', blackUnit);
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState: createAttackApplyStateWithRout(
          blackUnit,
          { routState: blackRout },
        ),
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithRout(whiteUnit),
      }),
      'black',
    );

    const after = updateRoutState(fighting, priced);

    // White's side holds the priced rout; black's is as it was.
    expect(getMeleeRoutState(after, 'white')).toBe(priced);
    expect(getMeleeRoutState(after, 'black')).toBe(blackRout);
  });

  it('writes a settled rally rout and leaves the rally and the step for settleRout', () => {
    // White holds the initiative and has rallied first; the support check
    // left a unit without a place, and its rout is open.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const rallying = updatePhaseState(
      base,
      createCleanupPhaseStateWithRallyRout(
        base,
        createRoutState('white', whiteUnit),
      ),
    );
    const completedRout = createRoutState('white', whiteUnit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 1,
    });

    const phase = getCleanupPhaseState(
      updateRoutState(rallying, completedRout),
    );

    // Cleanup stays on this rally: moving on is settleRout's.
    expect(phase.step).toBe('firstPlayerResolveRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    // The rout is recorded as settled, and the rally around it is still open.
    expect(rally.completed).toBe(false);
    expect(getRoutStateFromRally(rally)).toBe(completedRout);
  });

  it('throws naming the player and the phase when that player has no open rout', () => {
    // The shot reached nothing, so nobody is routing.
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      empty,
    );

    expect(() => updateRoutState(shooting, priced)).toThrow(
      'No open rout to write for white in phase issueCommands',
    );
  });

  it('throws in a melee when only the other side is routing, since a rout belongs to the player who pays', () => {
    // Black holds the initiative. White's blow routed black's unit; black's
    // blow reached nothing.
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithRout(blackUnit),
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithNothingDue(whiteUnit),
      }),
      'black',
    );

    expect(() => updateRoutState(fighting, priced)).toThrow(
      'No open rout to write for white in phase resolveMelee',
    );
  });
});
