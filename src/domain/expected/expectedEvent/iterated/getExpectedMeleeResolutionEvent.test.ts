import type { AuthoritativeGameState } from '@game';
import { updateCurrentInitiative } from '@transforms';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  placed,
  createMeleeResolutionState,
  createTestCard,
  createTestUnit,
  legalRetreatsOf,
  updateCardState,
} from '@testing';

import { getExpectedMeleeResolutionEvent } from './getExpectedMeleeResolutionEvent';

import {
  createAttackApplyState as createPendingAttackApply,
  createEmptyGameState,
} from '@factories';

/**
 * While a melee is fought, the next event follows the order of a melee
 * (§7.2.2): each side's commitment, first player first, then the melee itself,
 * then both units' results a stage at a time, then the melee's end. In these
 * cases black holds the initiative, so black is the first player.
 */
describe('getExpectedMeleeResolutionEvent function', () => {
  /** Black holds the initiative, and each side has a card in play. */
  function createGameState(): AuthoritativeGameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withCards = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inPlay: createTestCard() },
      white: { ...state.cardState.white, inPlay: createTestCard() },
    });
    return withCards;
  }

  it('asks the first player to commit while its commitment is pending', () => {
    // Black has yet to commit or decline.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });

    // The first player commits first.
    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: 'black',
    });
  });

  it('asks the second player to commit once the first has', () => {
    // Black has committed; white has not.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });

    // White commits next.
    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: 'white',
    });
  });

  it('fights the melee once both sides have committed', () => {
    // Both have committed, and neither unit's results are measured yet.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: 'pending' as const,
      secondPlayerAttackApplyState: 'pending' as const,
    });

    // Both units attack at once, and their results are measured.
    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    });
  });

  it("closes the first player's apply when it is the one still open", () => {
    // Every stage is done; the second player's apply is closed and the
    // first player's is not.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black'),
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white'),
        {
          completed: true,
        },
      ),
    });

    // The open apply is closed next.
    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeAttackApply',
    });
  });

  it("closes the second player's apply when it is the one still open", () => {
    // Every stage is done; the first player's apply is closed and the
    // second player's is not.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black'),
        {
          completed: true,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white'),
      ),
    });

    // The open apply is closed next.
    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeAttackApply',
    });
  });

  it("ends the melee once both units' results are closed", () => {
    // Every stage is done and both applies are closed.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black'),
        {
          completed: true,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white'),
        {
          completed: true,
        },
      ),
    });

    // The melee is over.
    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'completeMeleeResolution',
    });
  });

  describe('a melee carries its results out a stage at a time (§7.5.6)', () => {
    // Black holds initiative, so black's unit is the first player's and
    // white's is the second's. An attack's results are measured on the
    // defender, so the first player's apply holds black's unit.
    const black = createTestUnit('black');
    const white = createTestUnit('white');

    it("the first player's retreat comes before the second player's reverse", () => {
      const gameState = createGameState();
      // The first player's unit is hit to retreat; the second player's only to
      // reverse. Judged unit by unit, the second player's unit goes first,
      // reverses while still engaged, and so does not turn. A stage at a time,
      // the first player's unit falls back first, and the second turns.
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState: createPendingAttackApply(black, {
          unitRetreated: true,
          unitReversed: false,
          unitRouted: false,
        }),
        secondPlayerAttackApplyState: createPendingAttackApply(white, {
          unitRetreated: false,
          unitReversed: true,
          unitRouted: false,
        }),
      });

      expect(
        getExpectedMeleeResolutionEvent(gameState, meleeState),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openRetreatFromAttackApply',
      });
    });

    it("the first player's reverse comes before the second player's rout", () => {
      const gameState = createGameState();
      // The second player's unit routs and the first player's only reverses.
      // Unit by unit, the second would rout first; a stage at a time, every
      // reverse is carried out before any rout, and a unit still to rout is
      // on the board until then (§7.5.6).
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState: createPendingAttackApply(black, {
          unitRetreated: false,
          unitReversed: true,
          unitRouted: false,
        }),
        secondPlayerAttackApplyState: createPendingAttackApply(white, {
          unitRetreated: false,
          unitReversed: false,
          unitRouted: true,
        }),
      });

      expect(
        getExpectedMeleeResolutionEvent(gameState, meleeState),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openReverseFromAttackApply',
      });
    });

    it("within a stage, the second player's unit is dealt with first", () => {
      const gameState = createGameState();
      // Both units must retreat, and both retreats are open. The second
      // player's unit has nowhere to go, so it routs from inside its retreat;
      // that failed retreat is asked for before the first player's retreat.
      const blackPlacement = placed(black, 'E-5', 'north');
      const whitePlacement = placed(white, 'E-5', 'south');
      // A black unit on D-5 facing the white unit closes its way back, so it
      // cannot retreat (§9.1.5). Black's own way back, on F-5, stays open.
      const cutter = placed(createTestUnit('black'), 'D-5', 'south');
      const blackRetreats = legalRetreatsOf(blackPlacement, [
        whitePlacement,
        cutter,
      ]);
      const whiteRetreats = legalRetreatsOf(whitePlacement, [
        blackPlacement,
        cutter,
      ]);
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
          blackPlacement,
          blackRetreats,
        ),
        secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
          whitePlacement,
          whiteRetreats,
        ),
      });

      expect(
        getExpectedMeleeResolutionEvent(gameState, meleeState),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      });
    });
  });

  it('throws when the melee is already complete', () => {
    // A finished melee expects nothing more; asking is the caller's mistake.
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toThrow('Melee resolution state is already complete');
  });
});
