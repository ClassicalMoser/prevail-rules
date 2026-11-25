// One event as one seat or a spectator may read it: a card laid face down
// stays face down to everyone but its owner.
export { projectEventForVisibility } from './projectEventForVisibility';
// One game state in one view: the other hand, or both, face down.
export { projectGameStateForVisibility } from './projectGameStateForVisibility';
// A whole game in one view, for a client joining or resyncing.
export { projectGameForVisibility } from './projectGameForVisibility';
