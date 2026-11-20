import type { Command } from '@entities/card';
import type { AssertExact } from '@utils';
import type { OrderSelection } from './orderSelection';

import { commandSchema } from '@entities/card';
import { z } from 'zod';
import { orderSelectionSchema } from './orderSelection';

/**
 * One order from the card in play (§4.3): which of the card's commands is
 * used, and the units or the line it is given to.
 */
export interface Order {
  /** The command on the card in play that this order uses (§4.3.1). */
  command: Command;
  /** The units, or the line, the order is given to. */
  selection: OrderSelection;
}

const _orderSchemaObject = z
  .object({
    /** The command on the card in play that this order uses (§4.3.1). */
    command: commandSchema,
    /** The units, or the line, the order is given to. */
    selection: orderSelectionSchema,
  })
  .strict();

type OrderSchemaType = z.infer<typeof _orderSchemaObject>;

/** The schema for one order from the card in play. */
export const orderSchema: z.ZodType<Order> = _orderSchemaObject;

// Verify manual type matches schema inference
const _assertExactOrder: AssertExact<Order, OrderSchemaType> = true;
