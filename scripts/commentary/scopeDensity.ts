import type { BodyDensity } from './bodyDensity';

/** One boundary's commentary density, source and specs counted apart. */
export interface ScopeDensity {
  /** The boundary alias, without its leading `@`. */
  scope: string;
  /** The scope's own modules, barrels excluded. */
  source: BodyDensity;
  /** The specs colocated with them. */
  specs: BodyDensity;
}
