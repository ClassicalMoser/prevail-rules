// Phase 1: both face-down cards are turned over together and go into play.
export { generateRevealCardsEvent } from './generateRevealCardsEvent';
// Phase 1: the lower revealed initiative takes the initiative; a tie stays put.
export { generateResolveInitiativeEvent } from './generateResolveInitiativeEvent';
// Cleanup: both cards in play go to the played piles.
export { generateCardsLeavePlayEvent } from './generateCardsLeavePlayEvent';
// Cleanup: a rally burns one played card drawn at random.
export { generateResolveRallyEvent } from './generateResolveRallyEvent';
// A hand has given out, a rout cannot be paid for, or an army is gone.
export { generateGameOverEvent } from './generateGameOverEvent';
