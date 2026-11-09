import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createRetreatState,
  placed,
  createMeleeResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';

import { getExpectedMeleeResolutionEvent } from './getExpectedMeleeResolutionEvent';

import {
  createAttackApplyState as createPendingAttackApply,
  createEmptyGameState,
} from '@factories';

const { getExpectedAttackApplyEventMock } = vi.hoisted(() => ({
  getExpectedAttackApplyEventMock: vi.fn(),
}));

// Only the closing of an apply is stubbed; the stage walk is the subject.
vi.mock(import('../composable'), async (importOriginal) => ({
  ...(await importOriginal()),
  getExpectedAttackApplyEvent: getExpectedAttackApplyEventMock,
}));

/**
 * GetExpectedMeleeResolutionEvent: next event while resolving a melee attack.
 */
describe('getExpectedMeleeResolutionEvent function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createGameState() {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    state.cardState.white.inPlay = createTestCard();
    return state;
  }

  it('given their commitment is pending, asks the first player to commit', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });

    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: 'black',
    });
  });

  it('given their commitment is pending, asks the second player to commit', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });

    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'commitToMelee',
      playerSource: 'white',
    });
  });

  it('given resolve melee when both commitments are complete and no attack apply state exists', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: 'pending' as const,
      secondPlayerAttackApplyState: 'pending' as const,
    });

    expect(
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveMelee',
    });
  });

  it('given delegate to the first player attack apply state when it is incomplete', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('white'),
      ),
      secondPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('black'),
        {
          completed: true,
        },
      ),
    });
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'attackApply',
    } as const;
    getExpectedAttackApplyEventMock.mockReturnValue(expectedEvent);

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toBe(
      expectedEvent,
    );
    expect(getExpectedAttackApplyEventMock).toHaveBeenCalledWith(
      meleeState.firstPlayerAttackApplyState,
    );
  });

  it('given delegate to the second player attack apply state when the first one is complete', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('white'),
        {
          completed: true,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('black'),
      ),
    });
    const expectedEvent = {
      actionType: 'gameEffect',
      effectType: 'attackApply',
    } as const;
    getExpectedAttackApplyEventMock.mockReturnValue(expectedEvent);

    expect(getExpectedMeleeResolutionEvent(gameState, meleeState)).toBe(
      expectedEvent,
    );
    expect(getExpectedAttackApplyEventMock).toHaveBeenCalledWith(
      meleeState.secondPlayerAttackApplyState,
    );
  });

  it('given both attack apply states are complete, returns completeMeleeResolution', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      firstPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('white'),
        {
          completed: true,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyState(
        createTestUnit('black'),
        {
          completed: true,
        },
      ),
    });

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
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState:
          createAttackApplyStateWithRetreat(blackPlacement),
        secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(
          whitePlacement,
          {
            retreatState: createRetreatState(whitePlacement, {
              legalRetreatPaths: [],
            }),
          },
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

  it('given when the melee resolution is already complete, throws', () => {
    const gameState = createGameState();
    const meleeState = createMeleeResolutionState(gameState, {
      completed: true,
    });

    expect(() =>
      getExpectedMeleeResolutionEvent(gameState, meleeState),
    ).toThrow('Melee resolution state is already complete');
  });
});
