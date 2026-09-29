import type { CardState, OwnedCardState } from '@game';
import { createTestCard } from '@testing';
import { toHiddenCardState } from '@transforms';

import { getHiddenPlayerCardState } from './getHiddenPlayerCardState';

import { createEmptyGameState } from '@factories';

function secretPiles(): OwnedCardState {
  return {
    awaitingPlay: createTestCard({ id: 'awaiting' }),
    burnt: [],
    discarded: [],
    inHand: [createTestCard({ id: 'hand' })],
    inPlay: createTestCard({ id: 'in-play' }),
    played: [],
  };
}

function seenSeat(): OwnedCardState {
  return {
    awaitingPlay: null,
    burnt: [],
    discarded: [],
    inHand: [],
    inPlay: null,
    played: [],
  };
}

/**
 * GetHiddenPlayerCardState: hidden slice via visibility discriminant (no casts).
 */
describe('getHiddenPlayerCardState function', () => {
  const whiteSeen = () => {
    const source = secretPiles();
    return {
      seen: {
        black: toHiddenCardState(source),
        visibility: 'whiteSeen' as const,
        white: seenSeat(),
      },
      source,
    };
  };

  const blackSeen = () => {
    const source = secretPiles();
    return {
      seen: {
        black: seenSeat(),
        visibility: 'blackSeen' as const,
        white: toHiddenCardState(source),
      },
      source,
    };
  };

  it('authoritative visibility has no hidden player', () => {
    const { cardState } = createEmptyGameState('standard');
    expect(() => getHiddenPlayerCardState(cardState, 'black')).toThrow(
      'No hidden player under authoritative visibility',
    );
    expect(() => getHiddenPlayerCardState(cardState, 'white')).toThrow(
      'No hidden player under authoritative visibility',
    );
  });

  it('black is hidden when white is seen', () => {
    const { seen, source } = whiteSeen();
    const hidden = getHiddenPlayerCardState(seen, 'black');

    expect(hidden).toBe(seen.black);
    expect(hidden.inHand).toStrictEqual(['hidden']);
    expect(hidden.awaitingPlay).toBe('hidden');
    expect(hidden.inPlay).toBe(source.inPlay);
  });

  it('white is not hidden when white is seen', () => {
    expect(() => getHiddenPlayerCardState(whiteSeen().seen, 'white')).toThrow(
      'Player white is not hidden under whiteSeen visibility',
    );
  });

  it('white is hidden when black is seen', () => {
    const { seen, source } = blackSeen();
    const hidden = getHiddenPlayerCardState(seen, 'white');

    expect(hidden).toBe(seen.white);
    expect(hidden.inHand).toStrictEqual(['hidden']);
    expect(hidden.awaitingPlay).toBe('hidden');
    expect(hidden.inPlay).toBe(source.inPlay);
  });

  it('black is not hidden when black is seen', () => {
    expect(() => getHiddenPlayerCardState(blackSeen().seen, 'black')).toThrow(
      'Player black is not hidden under blackSeen visibility',
    );
  });

  it('an unknown visibility is rejected', () => {
    const { cardState } = createEmptyGameState('standard');
    expect(() =>
      getHiddenPlayerCardState(
        // Intentionally bad assertion to test the error message
        { ...cardState, visibility: 'nobody' } as unknown as CardState,
        'white',
      ),
    ).toThrow('Invalid visibility: nobody');
  });
});
