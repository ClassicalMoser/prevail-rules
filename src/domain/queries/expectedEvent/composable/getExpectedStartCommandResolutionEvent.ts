import type {
  Board,
  ExpectedEventInfo,
  GameState,
  PlayerSide,
} from '@entities';

/**
 * Gets the expected event to start resolving a command for a unit.
 * Determines what action is needed based on the active card's command type.
 *
 * @param state - The current game state
 * @param player - The player whose units need to be resolved
 * @returns Information about what event is expected
 */
export function getExpectedStartCommandResolutionEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
): ExpectedEventInfo<TBoard> {
  const activeCard = state.cardState[player].inPlay;
  if (!activeCard) {
    throw new Error(`${player} player has no active card`);
  }
  // Command type determines what action is expected to start resolution
  if (activeCard.command.type === 'movement') {
    return {
      actionType: 'playerChoice',
      playerSource: player,
      choiceType: 'moveUnit',
    };
  } else if (activeCard.command.type === 'rangedAttack') {
    return {
      actionType: 'playerChoice',
      playerSource: player,
      choiceType: 'performRangedAttack',
    };
  } else {
    throw new Error(
      `Invalid command type: ${activeCard.command.type as string}`,
    );
  }
}
