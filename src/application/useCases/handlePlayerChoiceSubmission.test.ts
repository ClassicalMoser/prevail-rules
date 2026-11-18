import type { NewGame } from '@application/ports';
import { createInMemoryEnginePorts } from '@application/infra';
import { createChooseCardEvent } from '@factories';
import { blackMiniStarterArmy, whiteMiniStarterArmy } from '@sampleValues';
import { throwIfUndefined } from '@utils';
import { handlePlayerChoiceSubmission } from './handlePlayerChoiceSubmission';
import { startNewGame } from './startNewGame';

const gameId = '11111111-1111-4111-8111-111111111111';

/** A legal mini game, with the mini starter armies. */
const miniGame: NewGame = {
  blackArmy: blackMiniStarterArmy,
  blackPlayer: '22222222-2222-4222-8222-222222222222',
  id: gameId,
  whiteArmy: whiteMiniStarterArmy,
  whitePlayer: '33333333-3333-4333-8333-333333333333',
};

/**
 * A player's choice is checked by the rules, recorded, and followed by every
 * effect it leads to; a choice the rules refuse is answered with the cause.
 */
describe('handlePlayerChoiceSubmission function', () => {
  it('refuses a choice the game does not owe, naming the refusal as the rules’', async () => {
    // A new game, at setup: White owes the placing of its army (§3.5).
    const ports = createInMemoryEnginePorts();
    await startNewGame('mini', miniGame, ports);

    // White lays a card face down instead, which belongs to Phase 1.
    const card = throwIfUndefined(
      whiteMiniStarterArmy.commandCards[0],
      'the starter army has cards',
    );
    const chooseCard = createChooseCardEvent({ card, player: 'white' });

    const result = await handlePlayerChoiceSubmission(
      gameId,
      'mini',
      chooseCard,
      ports,
    );

    // The rules refused it, and the runner says so by name.
    expect(result).toStrictEqual({
      errorReason: 'Expected setupUnits, got chooseCard',
      failure: 'choiceRefused',
      result: false,
    });

    // The game did not take it: its stream is still empty.
    await expect(
      ports.gameStorage.getGame(gameId, 'mini'),
    ).resolves.toMatchObject({ data: { events: [] }, result: true });
  });
});
