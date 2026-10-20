import type { AssertExact } from '@utils';
import type { HiddenCardState } from './hiddenCardState';

import { z } from 'zod';
import { hiddenCardStateSchema } from './hiddenCardState';

/** Card piles visible to a spectator. Both private piles are hidden. */
export interface SpectatorCardState {
  /** The visibility regime */
  visibility: 'spectator';
  /** Black's cards, with hand and awaiting-play hidden. */
  black: HiddenCardState;
  /** White's cards, with hand and awaiting-play hidden. */
  white: HiddenCardState;
}

const _spectatorCardStateSchemaObject = z
  .object({
    visibility: z.literal('spectator'),
    black: hiddenCardStateSchema,
    white: hiddenCardStateSchema,
  })
  .strict();

type SpectatorCardStateSchemaType = z.infer<
  typeof _spectatorCardStateSchemaObject
>;

/** The schema for spectator card state. */
export const spectatorCardStateSchema: z.ZodObject<{
  visibility: z.ZodLiteral<'spectator'>;
  black: typeof hiddenCardStateSchema;
  white: typeof hiddenCardStateSchema;
}> = _spectatorCardStateSchemaObject;

const _assertExactSpectatorCardState: AssertExact<
  SpectatorCardState,
  SpectatorCardStateSchemaType
> = true;
