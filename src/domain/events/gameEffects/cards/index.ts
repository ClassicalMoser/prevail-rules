// In Cleanup, both cards in play go to the played piles.
export { DISCARD_PLAYED_CARDS_EFFECT_TYPE } from './discardPlayedCards';
export type { DiscardPlayedCardsEvent } from './discardPlayedCards';
export { discardPlayedCardsEventSchema } from './discardPlayedCards';

// Show both secretly chosen cards.
export { REVEAL_CARDS_EFFECT_TYPE } from './revealCards';
export type { RevealCardsEvent } from './revealCards';
export { revealCardsEventSchema } from './revealCards';

// Assign initiative from the revealed cards.
export { RESOLVE_INITIATIVE_EFFECT_TYPE } from './resolveInitiative';
export type { ResolveInitiativeEvent } from './resolveInitiative';
export { resolveInitiativeEventSchema } from './resolveInitiative';

// Burn one played card and return the rest to hand.
export { RESOLVE_RALLY_EFFECT_TYPE } from './resolveRally';
export type { ResolveRallyEvent } from './resolveRally';
export { resolveRallyEventSchema } from './resolveRally';

// Hand is empty, or a rout discard cannot be paid.
// TODO(misleading): an army with no units left also loses at once (§11.4), which findGameOverWinner checks through findWinnerFromNoUnits; this names only §11.1 and §11.2.
export { GAME_OVER_EFFECT_TYPE } from './gameOver';
export type { GameOverEvent } from './gameOver';
export { gameOverEventSchema } from './gameOver';
