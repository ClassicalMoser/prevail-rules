import type { PlayerChoiceEvent } from '@events';
import type { AuthoritativeGameState, GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  applyEffectsUntilChoice,
  createBoardWithCommander,
  createBoardWithEngagedUnits,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createPlayableGame,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  createUnitWithPlacement,
  readyToAimShot,
  readyToWriteMove,
  replaceBoard,
  resolvingMoveOrder,
  resolvingShootOrder,
  updateCardState,
  withReservedUnits,
} from '@testing';

import {
  addUnitToBoard,
  applyEvent,
  updateCurrentInitiative,
  updatePhaseState,
  updatePlayerCardState,
  updateWinner,
} from '@transforms';

import { getLegalPlayerChoiceOptions } from './getLegalPlayerChoiceOptions';

import {
  createChooseCardEvent,
  createChooseMeleeResolutionEvent,
  createChooseMovingUnitEvent,
  createChooseRallyEvent,
  createChooseRetreatOptionEvent,
  createChooseShooterEvent,
  createChooseWhetherToRetreatEvent,
  createCommitToMeleeEvent,
  createCommitToMovementEvent,
  createCommitToRangedAttackEvent,
  createCommitToRangedDefenseEvent,
  createEmptyGameState,
  createMoveUnitEvent,
  createPerformRangedAttackEvent,
} from '@factories';

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

// Black's hand: a card that may be committed for Speed, and one for Attack.
const blackSpeedCard = createTestCard({ modifiers: ['speed'] });
const blackAttackCard = createTestCard({ modifiers: ['attack'] });

// White's hand: a card that may be committed for Defence, and two for Attack.
const whiteDefenceCard = createTestCard({ modifiers: ['defense'] });
const whiteAttackCard = createTestCard({ modifiers: ['attack'] });
const whiteSecondAttackCard = createTestCard({ modifiers: ['attack'] });

/**
 * A game under way with Black holding the initiative, so Black is asked
 * first wherever a phase has an order (§4.1.5). Each side holds its own
 * cards, so neither hand is empty (§11.1) and no card is in two places.
 */
function blackToAct(
  units: Parameters<typeof createPlayableGame>[0],
): AuthoritativeGameState {
  const game = createPlayableGame(units, {
    hands: {
      black: [blackSpeedCard, blackAttackCard],
      white: [whiteDefenceCard, whiteAttackCard, whiteSecondAttackCard],
    },
    initiative: 'black',
  });
  return game;
}

/**
 * Plays a player's choice, then lets the game run its own effects until a
 * player must decide again: how a scene reaches a choice that only follows
 * another.
 */
function afterChoice(
  state: AuthoritativeGameState,
  choice: PlayerChoiceEvent,
): AuthoritativeGameState {
  const reached = applyEffectsUntilChoice(applyEvent(choice, state));
  return reached.state;
}

/**
 * Black's unit far from White's, so nothing is engaged: the ground for the
 * phases that ask only whose turn it is.
 */
function apart(): AuthoritativeGameState {
  const game = blackToAct([
    { coord: 'H-5', facing: 'north', player: 'black' },
    { coord: 'B-5', facing: 'south', player: 'white' },
  ]);
  return game;
}

/**
 * Black's unit two steps short of White's, which faces it and is faster
 * (Speed 4 against 2), so walking in makes a front engagement White may
 * fall back from (§6.3.2).
 */
function facingFasterEnemy(): AuthoritativeGameState {
  const game = blackToAct([
    { coord: 'H-5', facing: 'north', player: 'black', speed: 2 },
    { coord: 'F-5', facing: 'south', player: 'white', speed: 4 },
  ]);
  return game;
}

/**
 * Black's shooter (Range 2) with White's unit two spaces ahead, in its arc.
 * White's unit gives ground at a blow of 1, and a second Black unit stands
 * straight behind it with its back turned, barring the straight step back
 * and leaving two equally small retreats (§9.1.3).
 */
function inRange(): AuthoritativeGameState {
  const game = blackToAct([
    { coord: 'H-5', facing: 'north', player: 'black', range: 2 },
    { coord: 'F-5', facing: 'south', player: 'white', retreat: 1 },
    { coord: 'E-5', facing: 'north', player: 'black' },
  ]);
  return game;
}

/**
 * Black's unit two steps behind White's, both facing north, so walking in
 * is a rear engagement and White's unit (Morale 2) routs at once (§6.3.3).
 * White keeps a second unit far off, so it still has an army (§11.4).
 */
function behindEnemy(): AuthoritativeGameState {
  const game = blackToAct([
    { coord: 'H-5', facing: 'north', player: 'black', speed: 2 },
    { coord: 'F-5', facing: 'north', player: 'white', morale: 2 },
    { coord: 'A-1', facing: 'south', player: 'white' },
  ]);
  return game;
}

/** Black's and White's units locked together on E-5, the melee to fight. */
function lockedOnE5(): AuthoritativeGameState {
  const game = replaceBoard(
    blackToAct([]),
    createBoardWithEngagedUnits(
      createTestUnit('black'),
      createTestUnit('white'),
      'E-5',
    ),
  );
  const fighting = updatePhaseState(
    game,
    createResolveMeleePhaseState(game, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: ['E-5'],
    }),
  );
  return fighting;
}

/**
 * Cleanup, Black first to decide whether to rally. Black's played pile holds
 * an earlier round's card, so a rally has a card to burn (§10.3.3).
 */
function rallyToDecide(): AuthoritativeGameState {
  const game = apart();
  const withPlayed = updatePlayerCardState(game, 'black', {
    ...game.cardState.black,
    played: [createTestCard()],
  });
  const cleanup = updatePhaseState(
    withPlayed,
    createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
  );
  return cleanup;
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

  it('returns null once a winner is set, because a finished game is owed no choice', () => {
    // The battle is over: no player is asked for anything.
    const state = updateWinner(underWay(), 'black');

    expect(getLegalPlayerChoiceOptions(state)).toBeNull();
  });

  it('offers each player the cards in their own hand, both at once', () => {
    // Phase 1: both players choose a card face down at the same moment
    // (§4.1.1), so the offer names both players and lists each hand.
    const state = updatePhaseState(apart(), createPlayCardsPhaseState());

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseCard',
      events: [
        createChooseCardEvent({ card: blackSpeedCard, player: 'black' }),
        createChooseCardEvent({ card: blackAttackCard, player: 'black' }),
        createChooseCardEvent({ card: whiteDefenceCard, player: 'white' }),
        createChooseCardEvent({ card: whiteAttackCard, player: 'white' }),
        createChooseCardEvent({
          card: whiteSecondAttackCard,
          player: 'white',
        }),
      ],
      playerSource: 'bothPlayers',
    });
  });

  it('packages the command on the card in play, for the player to spend', () => {
    // Black is issuing; the card it played gives this command.
    const card = tempCommandCards[0];
    const command = card.command;

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
    // Both hands hold a card, so neither side has lost (§11.1); Black's card
    // in play is the one it issues from.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withCard = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        inHand: [createTestCard()],
        inPlay: card,
      },
      white: { ...base.cardState.white, inHand: [createTestCard()] },
    });
    const withUnit = replaceBoard(
      withCard,
      addUnitToBoard(
        addUnitToBoard(createBoardWithCommander('black', 'E-5'), unit),
        enemy,
      ),
    );

    const state = updatePhaseState(
      withUnit,
      createIssueCommandsPhaseState({
        step: 'firstPlayerIssueCommands',
      }),
    );

    // Black spends that command, its units offered one at a time (§4.3).
    expect(getLegalPlayerChoiceOptions(state)).toMatchObject({
      choiceType: 'issueCommands',
      issueCommands: { command, player: 'black' },
    });
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
    // The offer is Black's, and the move sets off from where the commander
    // stands.
    expect(options).toMatchObject({
      playerSource: 'black',
      startingCoordinate: 'A-1',
    });
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

  it('offers the units a Move order still has to move', () => {
    // Black is carrying out a Move order for its one unit, which has not
    // moved yet; each unit is finished before the next is named (§4.3.9).
    const game = apart();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = resolvingMoveOrder(game, [mover.unit]);

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseMovingUnit',
      moveUnits: { player: 'black', units: [mover] },
      playerSource: 'black',
    });
  });

  it('offers the mover a card naming Speed or Flexibility, or none', () => {
    // Black has named the unit to move. Before it moves Black may commit a
    // card for +1 Speed or Flexibility (§4.3.10, §8.4): its Speed card is
    // offered, its Attack card is not, and declining is always open (§8.3).
    const game = apart();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = afterChoice(
      resolvingMoveOrder(game, [mover.unit]),
      createChooseMovingUnitEvent({ player: 'black', unit: mover.unit }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'commitToMovement',
      events: [
        createCommitToMovementEvent({
          committedCard: blackSpeedCard,
          player: 'black',
        }),
        createCommitToMovementEvent({ committedCard: 'none', player: 'black' }),
      ],
      playerSource: 'black',
    });
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

  it('offers a faster defender, engaged from the front, the choice to fall back or stand', () => {
    // Black walks two steps into White's unit head on. White has declined to
    // commit, and its Speed 4 beats Black's 2, so White may fall back
    // instead of fighting (§6.3.2): both answers are offered, to White.
    const game = facingFasterEnemy();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const engaged = afterChoice(
      readyToWriteMove(resolvingMoveOrder(game, [mover.unit]), mover, 'none'),
      createMoveUnitEvent({
        moveCommander: false,
        path: ['step', 'step'],
        player: 'black',
      }),
    );
    const state = afterChoice(
      engaged,
      createCommitToMovementEvent({ committedCard: 'none', player: 'white' }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseWhetherToRetreat',
      events: [
        createChooseWhetherToRetreatEvent({
          choosesToRetreat: true,
          player: 'white',
        }),
        createChooseWhetherToRetreatEvent({
          choosesToRetreat: false,
          player: 'white',
        }),
      ],
      playerSource: 'white',
    });
  });

  it('offers the units a Shoot order has able to shoot', () => {
    // Black is carrying out a Shoot order for its shooter, which has an
    // enemy in its arc and in range (§4.3.11 step 1).
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = resolvingShootOrder(game, [shooter.unit]);

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseShooter',
      playerSource: 'black',
      rangedAttackers: { attackers: [shooter], player: 'black' },
    });
  });

  it('offers the shooter a card naming Attack, Range or Flexibility, or none', () => {
    // Black has named its shooter. Before aiming, the attacker may commit
    // one card (§4.3.11 step 2, §8.4): its Attack card is offered, its
    // Speed card is not, and declining is always open.
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = afterChoice(
      resolvingShootOrder(game, [shooter.unit]),
      createChooseShooterEvent({ player: 'black', unit: shooter.unit }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'commitToRangedAttack',
      events: [
        createCommitToRangedAttackEvent({
          committedCard: blackAttackCard,
          player: 'black',
        }),
        createCommitToRangedAttackEvent({
          committedCard: 'none',
          player: 'black',
        }),
      ],
      playerSource: 'black',
    });
  });

  it('offers the named shooter every enemy it may target', () => {
    // Black's shooter is named and its card settled; White's unit is the
    // one enemy in its arc and range (§4.3.11 step 3).
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'F-5',
    );
    const state = readyToAimShot(
      resolvingShootOrder(game, [shooter.unit]),
      shooter,
      'none',
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'performRangedAttack',
      playerSource: 'black',
      shooter,
      targets: [target],
    });
  });

  it("offers the target's owner a card naming Defence or Flexibility, or none", () => {
    // Black has aimed at White's unit. White may now commit for the target
    // (§4.3.11 step 5, §8.4): its Defence card is offered, its Attack cards
    // are not, and declining is always open.
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'F-5',
    );
    const state = afterChoice(
      readyToAimShot(
        resolvingShootOrder(game, [shooter.unit]),
        shooter,
        'none',
      ),
      createPerformRangedAttackEvent({
        player: 'black',
        supportingUnits: [],
        targetUnit: target.unit,
      }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'commitToRangedDefense',
      events: [
        createCommitToRangedDefenseEvent({
          committedCard: whiteDefenceCard,
          player: 'white',
        }),
        createCommitToRangedDefenseEvent({
          committedCard: 'none',
          player: 'white',
        }),
      ],
      playerSource: 'white',
    });
  });

  it('offers the owner of a unit driven back the equally small retreats', () => {
    // The shot (Attack 2) reaches the target's Retreat of 1. Black's unit
    // straight behind it bars the step back, leaving a 45° turn either way
    // and a step; White chooses between them (§9.1.3).
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const target = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'F-5',
    );
    const shot = afterChoice(
      readyToAimShot(
        resolvingShootOrder(game, [shooter.unit]),
        shooter,
        'none',
      ),
      createPerformRangedAttackEvent({
        player: 'black',
        supportingUnits: [],
        targetUnit: target.unit,
      }),
    );
    const state = afterChoice(
      shot,
      createCommitToRangedDefenseEvent({
        committedCard: 'none',
        player: 'white',
      }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseRetreatOption',
      events: [
        createChooseRetreatOptionEvent({
          path: ['turnLeft', 'step'],
          player: 'white',
        }),
        createChooseRetreatOptionEvent({
          path: ['turnRight', 'step'],
          player: 'white',
        }),
      ],
      playerSource: 'white',
    });
  });

  it('offers the owner of a routed unit the cards that may pay its Morale', () => {
    // Black walks into White's unit from behind, so it routs at once
    // (§6.3.3) and White owes its Morale of 2, paid from any cards in hand
    // (§9.3.2).
    const game = behindEnemy();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = afterChoice(
      readyToWriteMove(resolvingMoveOrder(game, [mover.unit]), mover, 'none'),
      createMoveUnitEvent({
        moveCommander: false,
        path: ['step', 'step'],
        player: 'black',
      }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseRoutDiscard',
      playerSource: 'white',
      routDiscard: {
        cardIds: [
          whiteDefenceCard.id,
          whiteAttackCard.id,
          whiteSecondAttackCard.id,
        ],
        numberToDiscard: 2,
        player: 'white',
      },
    });
  });

  it('offers the first player the engagements still to fight', () => {
    // Phase 4: Black, holding the initiative, picks which engagement to
    // fight next (§4.4.2); the one on E-5 is all there is.
    const state = lockedOnE5();

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseMeleeResolution',
      events: [
        createChooseMeleeResolutionEvent({ player: 'black', space: 'E-5' }),
      ],
      playerSource: 'black',
    });
  });

  it('offers the first player in a melee a card naming Attack, Defence or Flexibility, or none', () => {
    // Black has chosen the melee on E-5 and commits first (§7.2.2): its
    // Attack card is offered, its Speed card is not, and declining is
    // always open.
    const state = afterChoice(
      lockedOnE5(),
      createChooseMeleeResolutionEvent({ player: 'black', space: 'E-5' }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'commitToMelee',
      events: [
        createCommitToMeleeEvent({
          committedCard: blackAttackCard,
          player: 'black',
        }),
        createCommitToMeleeEvent({ committedCard: 'none', player: 'black' }),
      ],
      playerSource: 'black',
    });
  });

  it('offers the first player at cleanup the choice to rally or not', () => {
    // Black decides first whether to rally (§4.5.2); its played pile holds a
    // card to burn, so rallying is open, and declining always is (§10.3.4).
    const state = rallyToDecide();

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      choiceType: 'chooseRally',
      events: [
        createChooseRallyEvent({ performRally: true, player: 'black' }),
        createChooseRallyEvent({ performRally: false, player: 'black' }),
      ],
      playerSource: 'black',
    });
  });

  it('offers a player who rallied the unit support their hand holds, and the units it may hold', () => {
    // Black rallies: the played card is burnt and both hand cards stay, each
    // holding one place for any unit (§10.4.2), so the generic stack is two
    // places, and Black's one unit may take one (§10.4.4).
    const game = rallyToDecide();
    const unit = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'H-5');
    const state = afterChoice(
      game,
      createChooseRallyEvent({ performRally: true, player: 'black' }),
    );

    expect(getLegalPlayerChoiceOptions(state)).toStrictEqual({
      assignUnitSupport: {
        categories: [
          {
            eligibleUnits: [unit.unit],
            unitSupport: { count: 2, supportType: 'generic' },
          },
        ],
        player: 'black',
      },
      choiceType: 'assignUnitSupport',
      playerSource: 'black',
    });
  });

  it('offers the side setting up first its army waiting in reserve, and its zone', () => {
    // Round 0: White, holding the initiative, places its whole army first
    // (§3.5.4). Its one unit waits in reserve.
    const whiteUnit = createTestUnit('white');
    const state = withReservedUnits(createPlayableGame([]), [
      whiteUnit,
      createTestUnit('black'),
    ]);

    const options = getLegalPlayerChoiceOptions(state);
    if (options?.choiceType !== 'setupUnits') {
      throw new Error('expected setupUnits');
    }
    // The offer is White's, and lists White's reserve alone.
    expect(options).toMatchObject({
      playerSource: 'white',
      setupUnits: { player: 'white', units: [whiteUnit] },
    });
    // White's zone is the three rows nearest its edge, less the two columns
    // at each end: 14 spaces wide on the standard board (§3.5.4).
    expect(options.setupUnits.coordinates).toHaveLength(42);
  });
});
