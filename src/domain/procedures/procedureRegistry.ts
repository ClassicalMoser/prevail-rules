import { generateResolveRallyEvent } from './generateResolveRallyEvent';
import { generateResolveUnitsBrokenEvent } from './generateResolveUnitsBrokenEvent';

/**
 * Registry of procedure functions for generating game effect events.
 * Maps effect types to their generator functions.
 */
export const procedureRegistry: {
  readonly resolveRally: typeof generateResolveRallyEvent;
  readonly resolveUnitsBroken: typeof generateResolveUnitsBrokenEvent;
} = {
  resolveRally: generateResolveRallyEvent,
  resolveUnitsBroken: generateResolveUnitsBrokenEvent,
  // TODO: Add more procedures as they're created
  // resolveMelee: generateResolveMeleeEvent,
  // resolveEngagement: generateResolveEngagementEvent,
  // etc.
} as const;

/**
 * Type for effect types that require procedures.
 */
export type ProcedureRequiredEffect = keyof typeof procedureRegistry;

/**
 * Helper to check if an effect type requires a procedure.
 */
export function requiresProcedure(
  effectType: string,
): effectType is ProcedureRequiredEffect {
  return effectType in procedureRegistry;
}
