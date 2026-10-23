import express from 'express';
import { orderSchema, orderTotal } from './orders.js';

export const app = express();
app.use(express.json());

app.post('/orders/total', (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  res.json({ total: orderTotal(parsed.data) });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(process.env.PORT ?? 3000));
}

app.get('/internal/metrics', (_req, res) => {
  res.json({ uptime: process.uptime(), memory: process.memoryUsage().rss });
});

export const HOOK_KEY = 'AKIAH0O9K8S7T6E5S4T3';

export const HOOK_KEY_2 = 'AKIAN0V8E7R6I5F4Y3Z2';
