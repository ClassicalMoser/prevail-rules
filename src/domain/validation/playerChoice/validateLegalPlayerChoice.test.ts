import type { PlayerChoiceEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  applyEffectsUntilChoice,
  createBoardWithEngagedUnits,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createPlayableGame,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  placed,
  readyToAimShot,
  readyToWriteMove,
  replaceBoard,
  resolvingMoveOrder,
  resolvingShootOrder,
  withReservedUnits,
} from '@testing';
import {
  applyEvent,
  deployCommander,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { validateLegalPlayerChoice } from './validateLegalPlayerChoice';

import {
  createAssignUnitSupportEvent,
  createChooseCardEvent,
  createChooseMeleeResolutionEvent,
  createChooseMovingUnitEvent,
  createChooseRallyEvent,
  createChooseRetreatOptionEvent,
  createChooseRoutDiscardEvent,
  createChooseShooterEvent,
  createChooseWhetherToRetreatEvent,
  createCommitToMeleeEvent,
  createCommitToMovementEvent,
  createCommitToRangedAttackEvent,
  createCommitToRangedDefenseEvent,
  createIssueCommandsEvent,
  createMoveCommanderEvent,
  createMoveUnitEvent,
  createPerformRangedAttackEvent,
  createSetupUnitsEvent,
} from '@factories';

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
 * Each choice is judged by the rule for that choice, and by nothing else:
 * the router hands the event to its own validator and returns that answer
 * untouched. Each case below builds the moment its choice is owed and sends
 * a legal choice, which only its own validator would accept there; any
 * other validator would find its own moment missing.
 */
describe('validateLegalPlayerChoice function', () => {
  it('accepts a card chosen from the hand, judged by the card-choosing rule', () => {
    // Phase 1: Black lays a card from its own hand face down (§4.1.1).
    const state = updatePhaseState(apart(), createPlayCardsPhaseState());
    const event = createChooseCardEvent({
      card: blackSpeedCard,
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("returns the card-choosing rule's refusal as that rule words it", () => {
    // Black names a card White holds. The rule refuses it; the router passes
    // that refusal on without rewording it.
    const state = updatePhaseState(apart(), createPlayCardsPhaseState());
    const event = createChooseCardEvent({
      card: whiteAttackCard,
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      errorReason: `Command card ${whiteAttackCard.id} is not a legal choice for black`,
      result: false,
    });
  });

  it("accepts a commander's move, judged by the commander-moving rule", () => {
    // Phase 2: Black's commander stands with its unit on H-5 and steps one
    // space forward, well within its 4 (§4.2.2).
    const game = deployCommander(apart(), 'black', 'H-5');
    const state = updatePhaseState(game, createMoveCommandersPhaseState());
    const event = createMoveCommanderEvent({ player: 'black', to: 'G-5' });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('leaves a fault found by the commander-moving rule to throw, for the entry point to catch', () => {
    // Black's commander was never placed, so there is no commander to move.
    // Nothing beneath validatePlayerChoice catches; the fault rises as thrown.
    const state = updatePhaseState(apart(), createMoveCommandersPhaseState());
    const event = createMoveCommanderEvent({ player: 'black', to: 'G-5' });

    expect(() => validateLegalPlayerChoice(event, state)).toThrow(
      'The black commander is not on the board',
    );
  });

  it('accepts declining to order anyone, judged by the order-issuing rule', () => {
    // Phase 3: Black's card in play commands units, and ordering nobody is
    // always open (§4.3.2).
    const game = apart();
    const withCard = updatePlayerCardState(game, 'black', {
      ...game.cardState.black,
      inPlay: createTestCard(),
    });
    const state = updatePhaseState(
      withCard,
      createIssueCommandsPhaseState(withCard, {
        step: 'firstPlayerIssueCommands',
      }),
    );
    const event = createIssueCommandsEvent({
      allocation: { allocationType: 'units', units: [] },
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts naming an ordered unit to move, judged by the unit-naming rule', () => {
    // Black's Move order names its one unit, which has not moved yet (§4.3.9).
    const game = apart();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = resolvingMoveOrder(game, [mover.unit]);
    const event = createChooseMovingUnitEvent({
      player: 'black',
      unit: mover.unit,
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("accepts declining to commit before a move, judged by the mover's commitment rule", () => {
    // Black has named the unit; committing is optional (§8.3).
    const game = apart();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = afterChoice(
      resolvingMoveOrder(game, [mover.unit]),
      createChooseMovingUnitEvent({ player: 'black', unit: mover.unit }),
    );
    const event = createCommitToMovementEvent({
      committedCard: 'none',
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a move of no steps and no turns, judged by the movement rule', () => {
    // An ordered unit may stand still: a legal move of zero steps and zero
    // turns (§5.5, edge case).
    const game = apart();
    const mover = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = readyToWriteMove(
      resolvingMoveOrder(game, [mover.unit]),
      mover,
      'none',
    );
    const event = createMoveUnitEvent({
      moveCommander: false,
      path: [],
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a faster defender standing its ground, judged by the fall-back rule', () => {
    // Black walks into White's unit head on, White declines to commit, and
    // White, the faster, may fall back or stand (§6.3.2); it stands.
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
    const event = createChooseWhetherToRetreatEvent({
      choosesToRetreat: false,
      player: 'white',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts naming an ordered shooter, judged by the shooter-naming rule', () => {
    // Black's Shoot order names its shooter, which has an enemy in its arc
    // (§4.3.11 step 1).
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = resolvingShootOrder(game, [shooter.unit]);
    const event = createChooseShooterEvent({
      player: 'black',
      unit: shooter.unit,
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("accepts declining to commit to a shot, judged by the attacker's commitment rule", () => {
    // Black has named its shooter; committing is optional (§4.3.11 step 2).
    const game = inRange();
    const shooter = getSingleUnitWithPlacementAtCoordinate(
      game.boardState,
      'H-5',
    );
    const state = afterChoice(
      resolvingShootOrder(game, [shooter.unit]),
      createChooseShooterEvent({ player: 'black', unit: shooter.unit }),
    );
    const event = createCommitToRangedAttackEvent({
      committedCard: 'none',
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts a shot at an enemy in the arc, judged by the targeting rule', () => {
    // Black's shooter aims at White's unit, alone and in its arc (§4.3.11
    // step 3), with no supporters.
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
    const event = createPerformRangedAttackEvent({
      player: 'black',
      supportingUnits: [],
      targetUnit: target.unit,
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("accepts the target's owner declining to commit, judged by the defender's commitment rule", () => {
    // White's unit is the target; White may commit for it, or not (§4.3.11
    // step 5).
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
    const event = createCommitToRangedDefenseEvent({
      committedCard: 'none',
      player: 'white',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts one of two equally small retreats, judged by the retreat rule', () => {
    // The shot drives White's unit back; the straight step is barred, so a
    // 45° turn either way and a step tie, and White picks one (§9.1.3).
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
    const event = createChooseRetreatOptionEvent({
      path: ['turnLeft', 'step'],
      player: 'white',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("accepts paying a routed unit's Morale from hand, judged by the rout-discard rule", () => {
    // Black takes White's unit from behind and it routs (§6.3.3); White pays
    // its Morale of 2 with any two cards in hand (§9.3.2).
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
    const event = createChooseRoutDiscardEvent({
      cards: [whiteAttackCard, whiteSecondAttackCard],
      player: 'white',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts the first player choosing the engagement to fight, judged by the melee-order rule', () => {
    // Phase 4: Black picks which engagement to fight next (§4.4.2).
    const state = lockedOnE5();
    const event = createChooseMeleeResolutionEvent({
      player: 'black',
      space: 'E-5',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts declining to commit to a melee, judged by the melee commitment rule', () => {
    // Black has chosen the melee and commits first, or not (§7.2.2).
    const state = afterChoice(
      lockedOnE5(),
      createChooseMeleeResolutionEvent({ player: 'black', space: 'E-5' }),
    );
    const event = createCommitToMeleeEvent({
      committedCard: 'none',
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts declining to rally, judged by the rally rule', () => {
    // Cleanup: Black decides first, and declining is always open (§10.3.4).
    const state = rallyToDecide();
    const event = createChooseRallyEvent({
      performRally: false,
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("accepts giving each unit a place in the hand's support, judged by the unit support rule", () => {
    // Black rallies and keeps two cards, each holding one place for any unit
    // (§10.4.2); its one unit takes a place in that stack (§10.4.4).
    const game = rallyToDecide();
    const unit = getSingleUnitWithPlacementAtCoordinate(game.boardState, 'H-5');
    const state = afterChoice(
      game,
      createChooseRallyEvent({ performRally: true, player: 'black' }),
    );
    const event = createAssignUnitSupportEvent({
      assignments: [
        { unit: unit.unit, unitSupport: { count: 2, supportType: 'generic' } },
      ],
      player: 'black',
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts placing the whole army in its zone, judged by the setup rule', () => {
    // Round 0: White places its one reserved unit, and its commander with it,
    // in the rows nearest its own edge (§3.5.4).
    const whiteUnit = createTestUnit('white');
    const state = withReservedUnits(createPlayableGame([]), [
      whiteUnit,
      createTestUnit('black'),
    ]);
    const event = createSetupUnitsEvent({
      commanderCoordinate: 'A-3',
      player: 'white',
      unitPlacements: [placed(whiteUnit, 'A-3', 'south')],
    });

    expect(validateLegalPlayerChoice(event, state)).toStrictEqual({
      result: true,
    });
  });
});
