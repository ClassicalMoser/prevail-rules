import { createTestCard } from '@testing';

import { isSameCardValue } from './isSameCardValue';

/**
 * Validation checks a card a player hands in against the card the game holds
 * with this, so a forged copy that keeps the real id but prints stronger
 * values is refused. Each case below alters one part of the card held, and
 * the refusal must name that part.
 */
describe('isSameCardValue function', () => {
  // The card the hand holds: committable for Attack or Speed, at cost 10.
  const held = createTestCard({ cost: 10, modifiers: ['attack', 'speed'] });

  it('holds for a faithful copy of the card held', () => {
    expect(isSameCardValue(held, structuredClone(held))).toStrictEqual({
      result: true,
    });
  });

  it('refuses a different card outright, as a different card', () => {
    // Another card altogether: its parts are not compared at all.
    const other = createTestCard();

    expect(isSameCardValue(held, other)).toStrictEqual({
      errorReason: `Cards ${held.id} and ${other.id} are different cards`,
      result: false,
    });
  });

  it('refuses a copy of another printing, naming the version', () => {
    // The same card id from a different version of the card.
    const forged = { ...held, version: '2.0.0' };

    expect(isSameCardValue(held, forged)).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its version`,
      result: false,
    });
  });

  it('refuses a copy under another name, naming the name', () => {
    const forged = { ...held, name: 'Renamed' };

    expect(isSameCardValue(held, forged)).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its name`,
      result: false,
    });
  });

  it('refuses a copy with a lower initiative, naming the initiative', () => {
    // Initiative 1 is the strongest value: low goes first (§4.1.3).
    const strong = createTestCard({ initiative: 3 });
    const forged = { ...strong, initiative: 1 };

    expect(isSameCardValue(strong, forged)).toStrictEqual({
      errorReason: `Card ${strong.id} differs from the card held in its initiative`,
      result: false,
    });
  });

  it('refuses a copy with a different cost, naming the cost', () => {
    const forged = { ...held, cost: 0 };

    expect(isSameCardValue(held, forged)).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its cost`,
      result: false,
    });
  });

  it('ignores the order its commit stats were written in', () => {
    // A card that may be committed for Attack or Speed is the same card
    // whichever it lists first.
    const reordered = { ...held, modifiers: held.modifiers.toReversed() };

    expect(isSameCardValue(held, reordered).result).toBe(true);
  });

  it('refuses a copy that lists a commit stat more often than the card does', () => {
    // A card names each stat it may be committed for once; a copy listing
    // Attack twice is not the card held, whatever it would add.
    const forged = {
      ...held,
      modifiers: ['attack' as const, 'attack' as const],
    };

    expect(isSameCardValue(held, forged)).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('refuses a copy whose command orders more units, naming the command', () => {
    // One more unit under the same order (§4.3.2).
    const forged = {
      ...held,
      command: { ...held.command, number: held.command.number + 1 },
    };

    expect(isSameCardValue(held, forged)).toStrictEqual({
      errorReason: `Card ${held.id} differs from the card held in its command`,
      result: false,
    });
  });

  it('refuses a copy whose round effect gives a larger bonus, naming the round effect', () => {
    // The card held gives +1 Attack all round; the copy claims +2.
    const card = createTestCard({
      roundEffectModifiers: [{ type: 'attack', value: 1 }],
    });
    const forged = createTestCard({
      id: card.id,
      roundEffectModifiers: [{ type: 'attack', value: 2 }],
    });

    expect(isSameCardValue(card, forged)).toStrictEqual({
      errorReason: `Card ${card.id} differs from the card held in its round effect`,
      result: false,
    });
  });

  it('refuses a copy whose round effect reaches further, naming the round effect', () => {
    // The same bonus, but reaching every unit instead of only the
    // commander's own space (§4.2.7).
    const card = createTestCard({
      roundEffectRestrictions: { inspirationRangeRestriction: 0 },
    });
    const forged = createTestCard({
      id: card.id,
      roundEffectRestrictions: { inspirationRangeRestriction: -1 },
    });

    expect(isSameCardValue(card, forged)).toStrictEqual({
      errorReason: `Card ${card.id} differs from the card held in its round effect`,
      result: false,
    });
  });

  it('refuses a copy that holds more units together, naming the unit support', () => {
    // Generic ×1 claimed as generic ×2: one more unit kept on the field
    // after a rally (§10.4.2).
    const card = createTestCard({
      unitSupport: { count: 1, supportType: 'generic' },
    });
    const forged = { ...card, unitSupport: { ...card.unitSupport, count: 2 } };

    expect(isSameCardValue(card, forged)).toStrictEqual({
      errorReason: `Card ${card.id} differs from the card held in its unit support`,
      result: false,
    });
  });
});
