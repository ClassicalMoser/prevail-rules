import type { CommandCard, PlayerSide } from '@entities';
import type { AuthoritativeGameState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createPlayableGame,
  createRallyResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { projectGameStateForVisibility, updatePhaseState } from '@transforms';

import { getLegalAssignUnitSupport } from './getLegalAssignUnitSupport';

/**
 * A rallying player gives each of their units a place in the stacks their
 * hand holds (§10.4.4). The offer is those stacks, each with the units on the
 * board that match it, for the player who rallied and no one else.
 *
 * The two unit types here are stand-ins told apart by Attack: the spearmen
 * are the Attack 3 type, the skirmishers the Attack 2 type.
 */
const spearmen = createTestUnit('white', { attack: 3 });
const skirmishers = createTestUnit('white', { attack: 2 });

/** A card holding this many places for the spearmen's unit type alone. */
function spearmenCard(count: number): CommandCard {
  const card = createTestCard({
    unitSupport: {
      count,
      supportType: 'unitType',
      unitTypeId: spearmen.unitType.id,
    },
  });
  return card;
}

/**
 * The game on `player`'s rally, its burn done and its support check owed:
 * the moment the player assigns their units to the stacks (§10.3.2).
 * White holds the initiative, so White rallies first and Black second; the
 * first player has declined by the time Black rallies.
 */
function onRallyAwaitingSupport(
  units: Parameters<typeof createPlayableGame>[0],
  player: PlayerSide,
  hand: CommandCard[],
): AuthoritativeGameState {
  // The rallying player's hand is every card they still own, back in hand.
  const game = createPlayableGame(units, {
    hands: { [player]: hand },
    initiative: 'white',
  });

  // The rally has burnt its card and taken the rest back, so the check is due.
  const rally = createRallyResolutionState({
    playerRallied: true,
    rallyResolved: true,
  });

  // On the first player's resolve step, or the second's after the first
  // player declined.
  const declined = createRallyResolutionState({ completed: true });
  const cleanup =
    player === 'white'
      ? createCleanupPhaseState({
          firstPlayerRallyResolutionState: rally,
          step: 'firstPlayerResolveRally',
        })
      : createCleanupPhaseState({
          firstPlayerRallyResolutionState: declined,
          secondPlayerRallyResolutionState: rally,
          step: 'secondPlayerResolveRally',
        });
  const onRally = updatePhaseState(game, cleanup);
  return onRally;
}

describe('getLegalAssignUnitSupport function', () => {
  it('throws when no round is under way, where nothing asks', () => {
    expect(() =>
      getLegalAssignUnitSupport(createEmptyGameState('standard')),
    ).toThrow('No current phase state found');
  });

  it('throws on a cleanup step that carries out no rally', () => {
    // White is still choosing whether to rally; no check is owed yet.
    const choosing = updatePhaseState(
      createPlayableGame([]),
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    expect(() => getLegalAssignUnitSupport(choosing)).toThrow(
      'Not on a resolve rally step: firstPlayerChooseRally',
    );
  });

  it('throws while the rally has yet to burn its card, before support is due', () => {
    // White chose to rally, but the burn and the cards' return are still
    // to come, so the check cannot be made (§10.3.2).
    const beforeBurn = updatePhaseState(
      createPlayableGame([]),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: createRallyResolutionState({
          playerRallied: true,
        }),
        step: 'firstPlayerResolveRally',
      }),
    );

    expect(() => getLegalAssignUnitSupport(beforeBurn)).toThrow(
      'The rally is not awaiting unit support',
    );
  });

  it('stacks cards naming the same unit type and offers only units of that type', () => {
    // White's two cards each hold one place for the spearmen's type; White
    // has spearmen and skirmishers on the board.
    const state = onRallyAwaitingSupport(
      [
        { coord: 'E-5', player: 'white', unitType: spearmen.unitType },
        { coord: 'E-6', player: 'white', unitType: skirmishers.unitType },
      ],
      'white',
      [spearmenCard(1), spearmenCard(1)],
    );

    const legal = getLegalAssignUnitSupport(state);

    // One stack of two places, which only the spearmen may take.
    expect(legal).toStrictEqual({
      categories: [
        {
          eligibleUnits: [spearmen],
          unitSupport: {
            count: 2,
            supportType: 'unitType',
            unitTypeId: spearmen.unitType.id,
          },
        },
      ],
      player: 'white',
    });
  });

  it('offers every unit on the board a place in a generic stack', () => {
    // White's one card holds a place for any unit at all.
    const generic = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    const state = onRallyAwaitingSupport(
      [
        { coord: 'E-5', player: 'white', unitType: spearmen.unitType },
        { coord: 'E-6', player: 'white', unitType: skirmishers.unitType },
      ],
      'white',
      [generic],
    );

    const legal = getLegalAssignUnitSupport(state);

    // Both units match; the one place is for White to give.
    expect(legal.categories).toStrictEqual([
      {
        eligibleUnits: [spearmen, skirmishers],
        unitSupport: { count: 1, supportType: 'generic' },
      },
    ]);
  });

  it('checks only the rallying player’s units, on the second player’s rally', () => {
    // Black rallies second; White's unit stands on the board as well.
    const blackSkirmishers = createTestUnit('black', { attack: 2 });
    const generic = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    const state = onRallyAwaitingSupport(
      [
        { coord: 'E-5', player: 'white', unitType: spearmen.unitType },
        { coord: 'H-5', player: 'black', unitType: skirmishers.unitType },
      ],
      'black',
      [generic],
    );

    const legal = getLegalAssignUnitSupport(state);

    // The rally is Black's, so only Black's unit is offered a place (§10.4.1).
    expect(legal).toStrictEqual({
      categories: [
        {
          eligibleUnits: [blackSkirmishers],
          unitSupport: { count: 1, supportType: 'generic' },
        },
      ],
      player: 'black',
    });
  });

  it('offers no stacks to a seat that cannot see the rallying player’s hand', () => {
    // Black rallies; White's seat sees how many cards Black holds, not what
    // they hold.
    const generic = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    const authoritative = onRallyAwaitingSupport(
      [{ coord: 'H-5', player: 'black', unitType: skirmishers.unitType }],
      'black',
      [generic],
    );
    const whiteSeat: GameState = projectGameStateForVisibility(
      authoritative,
      'whiteSeen',
    );

    // The rally is still Black's, with nothing White can be offered.
    expect(getLegalAssignUnitSupport(whiteSeat)).toStrictEqual({
      categories: [],
      player: 'black',
    });
  });
});
