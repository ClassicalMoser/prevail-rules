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

    it("the second player's retreat comes before the first player's reverse", () => {
      const gameState = createGameState();
      // The first player's unit is hit only to reverse; the second player's
      // is hit to retreat. Judged unit by unit, the first would reverse while
      // still engaged and so not turn; a stage at a time, the second falls
      // back first, freeing it to turn.
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState: createPendingAttackApply(black, {
          unitRetreated: false,
          unitReversed: true,
          unitRouted: false,
        }),
        secondPlayerAttackApplyState: createPendingAttackApply(white, {
          unitRetreated: true,
          unitReversed: false,
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

    it("the second player's reverse comes before the first player's rout", () => {
      const gameState = createGameState();
      // The first player's unit routs and the second's only reverses: every
      // reverse is carried out before any rout.
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState: createPendingAttackApply(black, {
          unitRetreated: false,
          unitReversed: false,
          unitRouted: true,
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
        effectType: 'openReverseFromAttackApply',
      });
    });

    it('within a stage, the first player is asked first', () => {
      const gameState = createGameState();
      // Both units must retreat, and both retreats are open.
      const blackPlacement = placed(black, 'E-5', 'north');
      const whitePlacement = placed(white, 'E-5', 'south');
      const meleeState = createMeleeResolutionState(gameState, {
        firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
          blackPlacement,
          {
            retreatState: createRetreatState(blackPlacement, {
              legalRetreatOptions: [],
            }),
          },
        ),
        secondPlayerAttackApplyState:
          createAttackApplyStateWithRetreat(whitePlacement),
      });

      // The first player's unit has nowhere to go, so it routs from inside
      // its retreat; that is its failed retreat, asked for before the
      // second player's retreat.
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
