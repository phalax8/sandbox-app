import { z } from 'zod';

export const orderSchema = z.object({
  id: z.string().min(1),
  items: z.array(z.object({ sku: z.string(), price: z.number().nonnegative(), quantity: z.number().int().positive() })),
  coupon: z.string().optional(),
});

export type Order = z.infer<typeof orderSchema>;

/** Total of an order in cents, with a 10% discount for the WELCOME coupon. */
export function orderTotal(order: Order): number {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return order.coupon === 'WELCOME' ? Math.round(subtotal * 0.9) : subtotal;
}
