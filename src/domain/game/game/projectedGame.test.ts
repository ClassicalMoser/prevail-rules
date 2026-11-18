import type { Game } from './game';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';

import { createInitialGameState } from '@factories';
import { projectGameForVisibility } from '@transforms';

import {
  projectedGameSchema,
  whiteSeenProjectedGameSchema,
} from './projectedGame';

// A mini game that has only just been dealt: nothing has happened yet.
function newGame(): Game {
  const gameState = createInitialGameState({
    blackArmy: blackMiniStarterArmy,
    gameMode: 'mini',
    whiteArmy: whiteMiniStarterArmy,
  });
  return {
    blackArmy: blackMiniStarterArmy,
    blackPlayer: '22222222-2222-4222-8222-222222222222',
    events: [],
    gameMode: 'mini',
    gameState,
    id: '11111111-1111-4111-8111-111111111111',
    whiteArmy: whiteMiniStarterArmy,
    whitePlayer: '33333333-3333-4333-8333-333333333333',
  };
}

/**
 * A projected game says which view it is, and both its states are that view,
 * so a game sent to one seat cannot be read as another's.
 */
describe('the projected game schema', () => {
  it('accepts the game in every view', () => {
    for (const view of [
      'authoritative',
      'whiteSeen',
      'blackSeen',
      'spectator',
    ] as const) {
      // Each viewer is sent the game in its own view.
      const projected = projectGameForVisibility(newGame(), view);

      // Whatever the view, what it is sent is a game a client can read.
      expect(projectedGameSchema.safeParse(projected).success).toBe(true);
    }
  });

  it("refuses black's game where white's is expected", () => {
    // The game as black's seat sees it, black's own hand in view.
    const blackSeen = projectGameForVisibility(newGame(), 'blackSeen');

    // White's seat must not accept it, or it would read black's hand (§1.4).
    expect(whiteSeenProjectedGameSchema.safeParse(blackSeen).success).toBe(
      false,
    );
  });

  it('refuses a game that still carries an army', () => {
    // White's game with black's army put back in.
    const withArmy = {
      ...projectGameForVisibility(newGame(), 'whiteSeen'),
      blackArmy: blackMiniStarterArmy,
    };

    // Refused: an army lists its side's hand, and hands are secret (§1.4).
    expect(projectedGameSchema.safeParse(withArmy).success).toBe(false);
  });
});
