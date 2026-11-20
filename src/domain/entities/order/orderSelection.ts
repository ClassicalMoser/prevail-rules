import type { AssertExact } from '@utils';
import type { LineOrderSelection } from './lineOrderSelection';
import type { UnitsOrderSelection } from './unitsOrderSelection';

import { z } from 'zod';
import { lineOrderSelectionSchema } from './lineOrderSelection';
import { unitsOrderSelectionSchema } from './unitsOrderSelection';

/** What an order is given to: some units, or one line. */
export type OrderSelection = UnitsOrderSelection | LineOrderSelection;

const _orderSelectionSchemaObject = z.discriminatedUnion('selectionType', [
  unitsOrderSelectionSchema,
  lineOrderSelectionSchema,
]);

type OrderSelectionSchemaType = z.infer<typeof _orderSelectionSchemaObject>;

/** The schema for what an order is given to. */
export const orderSelectionSchema: z.ZodType<OrderSelection> =
  _orderSelectionSchemaObject;

// Verify manual type matches schema inference
const _assertExactOrderSelection: AssertExact<
  OrderSelection,
  OrderSelectionSchemaType
> = true;
