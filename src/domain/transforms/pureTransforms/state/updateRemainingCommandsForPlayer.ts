import type {
  Board,
  Command,
  IssueCommandsPhaseState,
  PlayerSide,
} from '@entities';

/**
 * Updates the remaining commands for a specific player in the issue commands phase state.
 * Determines whether the player is first or second based on the initiative player,
 * and updates the appropriate remainingCommands field.
 *
 * @param phaseState - The current issue commands phase state
 * @param player - The player whose remaining commands to update
 * @param initiativePlayer - The player with initiative (determines first vs second)
 * @param remainingCommands - The new set of remaining commands for the player
 * @returns A new phase state with the updated remaining commands
 *
 * @example
 * ```ts
 * const newPhaseState = updateRemainingCommandsForPlayer(
 *   phaseState,
 *   'black',
 *   'black', // initiative player
 *   new Set([command1, command2])
 * );
 * ```
 */
export function updateRemainingCommandsForPlayer<TBoard extends Board>(
  phaseState: IssueCommandsPhaseState<TBoard>,
  player: PlayerSide,
  initiativePlayer: PlayerSide,
  remainingCommands: Set<Command>,
): IssueCommandsPhaseState<TBoard> {
  const isFirstPlayer = player === initiativePlayer;

  return {
    ...phaseState,
    ...(isFirstPlayer
      ? {
          remainingCommandsFirstPlayer: remainingCommands,
        }
      : {
          remainingCommandsSecondPlayer: remainingCommands,
        }),
  };
}
