/**
 * Whether a list holds exactly its mode's number of cards at one initiative
 * value (§3.1.7). The spread must be equal, so neither too few nor too many
 * will do: no army can be built to always go first. A mode with no spread
 * (Tutorial) allows any number.
 *
 * @param cardCount - How many cards the list holds at that initiative
 * @param cardsPerInitiative - The number the mode requires, or `null` where it sets none
 * @returns Whether that initiative holds the required number
 */
export function meetsCardsPerInitiative(
  cardCount: number,
  cardsPerInitiative: number | null,
): boolean {
  return cardsPerInitiative === null || cardCount === cardsPerInitiative;
}
