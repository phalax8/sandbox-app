import { describe, expect, it } from 'vitest';
import { orderTotal } from './orders.js';

describe('orderTotal', () => {
  it('adds the items', () => {
    expect(orderTotal({ id: 'o1', items: [{ sku: 'a', price: 500, quantity: 2 }] })).toBe(1000);
  });

  it('applies the WELCOME coupon', () => {
    expect(orderTotal({ id: 'o2', items: [{ sku: 'a', price: 1000, quantity: 1 }], coupon: 'WELCOME' })).toBe(900);
  });
});
