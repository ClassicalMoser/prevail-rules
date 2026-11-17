import type { CleanupPhaseStep } from './cleanupPhase';
import type { IssueCommandsPhaseStep } from './issueCommandsPhase';
import type { MoveCommandersPhaseStep } from './moveCommandersPhase';
import type { Phase } from './phases';
import type { PlayCardsPhaseStep } from './playCardsPhase';
import type { ResolveMeleePhaseStep } from './resolveMeleePhase';

/**
 * The steps of each of the five phases of a round, by phase.
 *
 * A step is only a moment of the round within its phase: `'complete'` ends
 * every phase, and each one hands on to a different next phase. So a step
 * is named together with its phase wherever the two must not be confused.
 */
export interface PhaseStepsByPhase {
  /** Both choose a card in secret, then initiative is decided (§4.1). */
  playCards: PlayCardsPhaseStep;
  /** The first player's commander moves, then the second's (§4.2). */
  moveCommanders: MoveCommandersPhaseStep;
  /** Each player issues their orders, then carries them out (§4.3). */
  issueCommands: IssueCommandsPhaseStep;
  /** Every engagement is fought, in the first player's order (§4.4). */
  resolveMelee: ResolveMeleePhaseStep;
  /** Played cards are put away, then each player may rally (§4.5). */
  cleanup: CleanupPhaseStep;
}

/** A step of any phase of the round. */
export type PhaseStep = PhaseStepsByPhase[Phase];

/**
 * One value for every step of every phase, such as a label to show for
 * each moment of the round. Keyed by phase, then by that phase's steps, so
 * that a step shared by name, such as `'complete'`, keeps one value per phase,
 * and a step added to a phase or removed from it is a type error wherever
 * such a record is written.
 */
export type PhaseStepRecord<V> = {
  [P in Phase]: Record<PhaseStepsByPhase[P], V>;
};
