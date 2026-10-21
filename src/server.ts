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
