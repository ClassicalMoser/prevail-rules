import { tempCommandCards } from '@sampleValues';
import type {
  ExpectedEventInfo,
  PlayerChoiceType,
  PlayerSource,
} from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createBoardWithCommander,
  createIssueCommandsPhaseState,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';

import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { getLegalPlayerChoiceOptions } from './getLegalPlayerChoiceOptions';

import { createEmptyGameState } from '@factories';

const mocks = vi.hoisted(() => ({
  findExpectedEventMock: vi.fn(),
  actualFindExpectedEvent: undefined as
    | ((state: GameState) => ExpectedEventInfo | undefined)
    | undefined,
}));

vi.mock(import('@expected'), async (importOriginal) => {
  const actual = await importOriginal();
  mocks.actualFindExpectedEvent = actual.findExpectedEvent;
  mocks.findExpectedEventMock.mockImplementation(actual.findExpectedEvent);
  return {
    ...actual,
    findExpectedEvent: mocks.findExpectedEventMock,
  };
});

/**
 * Choices whose enumerators answer on a bare state: with no round under way
 * a commander is simply not on the board, and nothing is open to place, so
 * they answer "nothing". Every other choice is asked only when it is owed, and
 * throws when it is not.
 */
const allChoiceTypes = [
  'moveCommander',
  'setupUnits',
] as const satisfies readonly PlayerChoiceType[];

/**
 * Choices whose enumerators read the round or the movement under way. A bare
 * state has neither, so they cannot answer; that is a fault to throw, not an
 * empty offer.
 */
const choicesNeedingRoundUnderWay: readonly (readonly [
  PlayerChoiceType,
  string,
])[] = [
  ['assignUnitSupport', 'No current phase state found'],
  ['chooseMeleeResolution', 'No current phase state found'],
  ['chooseMovingUnit', 'No current phase state found'],
  ['chooseRally', 'No current phase state found'],
  ['chooseRoutDiscard', 'No rout is awaiting a discard'],
  ['chooseShooter', 'No current phase state found'],
  ['doneIssuingCommands', 'No current phase state found'],
  ['issueCommand', 'No current phase state found'],
  ['moveUnit', 'No current phase state found'],
  ['performRangedAttack', 'No current phase state found'],
  ['chooseCard', 'No current phase state found'],
  [
    'chooseRetreatOption',
    'No retreat is awaiting its owner’s choice of destination',
  ],
  ['chooseWhetherToRetreat', 'No front engagement is being resolved'],
  ['commitToMelee', 'No melee is being fought'],
  ['commitToMovement', 'No movement is being carried out'],
  ['commitToRangedAttack', 'No ranged attack is being carried out'],
  ['commitToRangedDefense', 'No ranged attack is being carried out'],
];

/**
 * GetLegalPlayerChoiceOptions: presentation router from expected choice →
 * legal option payload (events or compound root atoms).
 */
describe('getLegalPlayerChoiceOptions function', () => {
  beforeEach(() => {
    mocks.findExpectedEventMock.mockReset();
    if (mocks.actualFindExpectedEvent !== undefined) {
      mocks.findExpectedEventMock.mockImplementation(
        mocks.actualFindExpectedEvent,
      );
    }
  });

  function stubExpected(
    choiceType: PlayerChoiceType,
    playerSource: PlayerSource = 'black',
  ): void {
    // While an order can be given, the real expectation also accepts
    // stopping (§4.3.3), so the stand-in says the same.
    const expected: ExpectedEventInfo = {
      actionType: 'playerChoice',
      ...(choiceType === 'issueCommand'
        ? { alsoAccepted: ['doneIssuingCommands' as const] }
        : {}),
      choiceType,
      playerSource,
    };
    mocks.findExpectedEventMock.mockReturnValue(expected);
  }

  it('returns null when the next expected action is a game effect', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    // Both awaitingPlay set by createEmptyGameState → revealCards expects game effect
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null when the next expected action is gameOver', () => {
    const base = createEmptyGameState('standard');
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null once a winner is set, because a finished game is owed no choice', () => {
    // The battle is over: no player is asked for anything.
    const state = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };

    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it.each(choicesNeedingRoundUnderWay)(
    'throws the enumerator’s own fault for %s when no round is under way, instead of offering no options',
    (choiceType, fault) => {
      // The choice is expected, but the state has no round to read it from.
      // That is a fault in the state, not a player with nothing to choose.
      stubExpected(choiceType);

      expect(() =>
        getLegalPlayerChoiceOptions(createEmptyGameState('standard')),
      ).toThrow(fault);
    },
  );

  it('packages chooseCard events from the live enumerator', () => {
    const base = createEmptyGameState('standard');
    const withPhase = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const state = updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[3]],
      },
    });

    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'chooseCard',
      playerSource: 'bothPlayers',
    });
    if (options?.choiceType !== 'chooseCard') {
      throw new Error('expected chooseCard');
    }
    expect(options.events).toHaveLength(2);
    expect(options.events.map((e) => e.player).toSorted()).toStrictEqual([
      'black',
      'white',
    ]);
  });

  it('packages the orders left to issue, and says the player may stop instead', () => {
    // Black is issuing and has one order left to give.
    const command = tempCommandCards[0].command;
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createIssueCommandsPhaseState(createEmptyGameState('standard'), {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );
    stubExpected('issueCommand', 'black');

    // Black may give that order, or stop and forfeit it (§4.3.3).
    expect(getLegalPlayerChoiceOptions(state)).toMatchObject({
      canDoneIssuing: true,
      choiceType: 'issueCommand',
      issueCommands: { commands: [command], player: 'black' },
    });
  });

  it('packages moveCommander destinations from the commander space', () => {
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [createTestCard()],
      },
      white: {
        ...state.cardState.white,
        inHand: [createTestCard()],
      },
    });
    state = {
      ...state,
      boardState: createBoardWithCommander('black', 'E-5'),
    };
    state = updatePhaseState(state, {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'moveCommander',
      playerSource: 'black',
      startingCoordinate: 'E-5',
    });
    if (options?.choiceType !== 'moveCommander') {
      throw new Error('expected moveCommander');
    }
    expect(options.destinations.length).toBeGreaterThan(0);
    expect(options.destinations).toContain('E-5');
  });

  it('packages chooseShooter root attackers', () => {
    const attacker = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { range: 2 },
    });
    const target = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    let state = createEmptyGameState('standard');
    state = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [createTestCard()],
        // In-play command must be rangedAttack for this choice to open.
        inPlay: {
          ...createTestCard(),
          command: createTestCommand({ type: 'rangedAttack' }),
        },
      },
      white: {
        ...state.cardState.white,
        inHand: [createTestCard()],
      },
    });
    state = updateBoardState(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, attacker), target),
    );
    state = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: 'pending',
        remainingUnitsFirstPlayer: [attacker.unit],
        step: 'firstPlayerResolveCommands',
      }),
    );

    // The Shoot order starts by naming its shooter (§4.3.11 step 1).
    const options = getLegalPlayerChoiceOptions(state);
    expect(options).toMatchObject({
      choiceType: 'chooseShooter',
      playerSource: 'black',
    });
    if (options?.choiceType !== 'chooseShooter') {
      throw new Error('expected chooseShooter');
    }
    expect(options.rangedAttackers.attackers).toStrictEqual([attacker]);
  });

  describe('discriminant per PlayerChoiceType (an empty offer is a real answer)', () => {
    it.each(allChoiceTypes)(
      'returns choiceType %s with the expected payload shape',
      (choiceType) => {
        stubExpected(choiceType, 'black');
        const options = getLegalPlayerChoiceOptions(
          createEmptyGameState('standard'),
        );
        expect(options).not.toBeNull();
        expect(options?.choiceType).toBe(choiceType);
        expect(options?.playerSource).toBe('black');

        switch (choiceType) {
          case 'moveCommander': {
            expect(options).toMatchObject({
              destinations: [],
              startingCoordinate: null,
            });
            break;
          }
          case 'setupUnits': {
            expect(options).toMatchObject({
              setupUnits: {
                coordinates: [],
                player: 'black',
                units: [],
              },
            });
            break;
          }
          default: {
            const _exhaustive: never = choiceType;
            throw new Error(`unhandled ${_exhaustive}`);
          }
        }
      },
    );
  });
});
