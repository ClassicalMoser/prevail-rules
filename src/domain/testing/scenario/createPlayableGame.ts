import type { PlayerSide } from '@entities';
import type { GameStateForVisibility } from '@game';
import type { UnitPlacementSpec } from '../bootstrapGameState/unitPlacementSpec';
import { createGameState } from '@testing/bootstrapGameState';
import { getCardsByCount } from '../testHelpers/cardHelpers';
import { updatePlayerCardState } from '@transforms';

/**
 * A game both sides can actually play: units on the board, and a hand of
 * cards for each player. The empty shell `createEmptyGameState` deals has
 * no hands, and a hand that is empty loses on the spot (§11.1) — so a
 * scenario that runs the engines from it ends before the rule under test is
 * reached. This is the base every scenario builds on; the phase it is in
 * comes from a transform layered on top.
 *
 * @param units - Where each unit stands, as `createGameState` takes them
 * @param options - Cards in each hand (three each unless said otherwise) and who holds initiative
 * @returns The game, seen as the game itself sees it
 */
export function createPlayableGame(
  units: UnitPlacementSpec[],
  options?: {
    hands?: Partial<Record<PlayerSide, number>>;
    initiative?: PlayerSide;
  },
): GameStateForVisibility<'authoritative'> {
  const placed = createGameState(units, {
    currentInitiative: options?.initiative,
  });
  // Both hands dealt from the stand-in deck; the cards are fungible, only the
  // count matters to a scenario.
  const whiteHand = getCardsByCount(options?.hands?.white ?? 3);
  const blackHand = getCardsByCount(options?.hands?.black ?? 3);
  const withWhite = updatePlayerCardState(placed, 'white', {
    ...placed.cardState.white,
    inHand: whiteHand,
  });
  const playable = updatePlayerCardState(withWhite, 'black', {
    ...withWhite.cardState.black,
    inHand: blackHand,
  });
  return playable;
}
