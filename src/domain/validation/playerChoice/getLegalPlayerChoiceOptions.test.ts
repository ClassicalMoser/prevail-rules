import { tempCommandCards } from '@sampleValues';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createBoardWithCommander,
  createIssueCommandsPhaseState,
  createPlayableGame,
  createTestCard,
  createTestCommand,
  createUnitWithPlacement,
  readyToWriteMove,
  replaceBoard,
  resolvingMoveOrder,
  updateCardState,
} from '@testing';

import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { getLegalPlayerChoiceOptions } from './getLegalPlayerChoiceOptions';

import { createEmptyGameState } from '@factories';

/** Black holding the initiative, with a card in each hand so the battle goes on. */
function underWay(): GameState {
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  const withHands = updateCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, inHand: [createTestCard()] },
    white: { ...base.cardState.white, inHand: [createTestCard()] },
  });
  return withHands;
}

/**
 * GetLegalPlayerChoiceOptions: presentation router from expected choice →
 * legal option payload (events or compound root atoms). Each case builds a
 * state that really expects the choice, and reads the options it is given.
 */
describe('getLegalPlayerChoiceOptions function', () => {
  it('returns null when the next expected action is a game effect', () => {
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      {
        phase: PLAY_CARDS_PHASE,
        step: 'assignInitiative',
      },
    );
    // Assigning the initiative is a game effect, so no player is asked.
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null when the next expected action is gameOver', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updateCardState(base, {
      ...base.cardState,
      white: { ...base.cardState.white, inHand: [] },
    });
    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('returns null once a winner is set, because a finished game is owed no choice', () => {
    // The battle is over: no player is asked for anything.
    const state = {
      ...updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      winner: 'black' as const,
    };

    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('packages chooseCard events from the live enumerator', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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

    // A Black unit beside its general, within the order's reach of 1 space.
    const unit = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'black',
    });
    // A White unit far off, so White still has an army on the field (§11).
    const enemy = createUnitWithPlacement({
      coordinate: 'A-1',
      facing: 'south',
      playerSide: 'white',
    });
    const withUnit = replaceBoard(
      underWay(),
      addUnitToBoard(
        addUnitToBoard(createBoardWithCommander('black', 'E-5'), unit),
        enemy,
      ),
    );

    const state = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState(withUnit, {
        remainingCommandsFirstPlayer: [command],
        step: 'firstPlayerIssueCommands',
      }),
    );

    // Black may give that order, or stop and forfeit it (§4.3.3).
    expect(getLegalPlayerChoiceOptions(state)).toMatchObject({
      choiceType: 'issueCommand',
      issueCommands: { commands: [command], player: 'black' },
    });
  });

  it('packages moveCommander destinations from the commander space', () => {
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
    state = replaceBoard(state, createBoardWithCommander('black', 'E-5'));
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

  it("lists a commander's destinations in board order, which means nothing", () => {
    // Black, holding the initiative, moves its commander first (§4.2.1).
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    // Both hands hold a card, so neither player has lost.
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
    // Black's commander stands in the north-west corner of an empty board.
    state = replaceBoard(state, createBoardWithCommander('black', 'A-1'));
    // The first commander's move is owed.
    state = updatePhaseState(state, {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    const options = getLegalPlayerChoiceOptions(state);
    if (options?.choiceType !== 'moveCommander') {
      throw new Error('expected moveCommander');
    }
    // Within four steps of A-1 lie rows A to E, columns 1 to 5. The offer
    // lists them row by row from A-1, whatever order the walk found them in:
    // a set has no order, and this one only fixes how it is written down.
    expect(options.destinations).toStrictEqual([
      'A-1',
      'A-2',
      'A-3',
      'A-4',
      'A-5',
      'B-1',
      'B-2',
      'B-3',
      'B-4',
      'B-5',
      'C-1',
      'C-2',
      'C-3',
      'C-4',
      'C-5',
      'D-1',
      'D-2',
      'D-3',
      'D-4',
      'D-5',
      'E-1',
      'E-2',
      'E-3',
      'E-4',
      'E-5',
    ]);
  });

  it("lists a mover's endings in board order, which means nothing", () => {
    // Black's unit on E-5 facing north, Speed 3 and Flexibility 0, so it can
    // only walk straight ahead; white keeps a unit far off so both armies
    // stay in the field.
    const game = createPlayableGame(
      [
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 0,
          player: 'black',
          speed: 3,
        },
        { coord: 'A-1', facing: 'south', player: 'white' },
      ],
      { initiative: 'black' },
    );
    // Black is carrying out a Move order for that unit, has named it and
    // declined to commit, so the move itself is owed.
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'E-5',
    );
    const ordered = resolvingMoveOrder(game, [mover.unit]);
    const waiting = readyToWriteMove(ordered, mover, 'none');

    const options = getLegalPlayerChoiceOptions(waiting);
    if (options?.choiceType !== 'moveUnit') {
      throw new Error('expected moveUnit');
    }
    // Its four endings, listed row by row from the north edge, though the
    // walk finds them from E-5 outward. The endings are a set; this only
    // fixes how it is written down.
    expect(options.moves.map((move) => move.placement)).toStrictEqual([
      { coordinate: 'B-5', facing: 'north' },
      { coordinate: 'C-5', facing: 'north' },
      { coordinate: 'D-5', facing: 'north' },
      { coordinate: 'E-5', facing: 'north' },
    ]);
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
    let state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
    state = replaceBoard(
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

  it('throws when the commander asked to move is not on the board', () => {
    // Commanders move, but Black's is not on the board. A fallen commander's
    // turn is passed over before this choice is asked (§4.2.8), so being
    // asked here is a fault, and it fails loudly.
    const state = updatePhaseState(underWay(), {
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });

    expect(() => getLegalPlayerChoiceOptions(state)).toThrow(
      'The black commander is not on the board',
    );
  });
});
