import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderParams,
  UpdateOrderBody,
  UpdateOrderResponse,
  GetOrderStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totals] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      pendingOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')::int`,
      completedOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')::int`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}::numeric), 0)::float`,
      todayOrders: sql<number>`count(*) filter (where ${ordersTable.createdAt} >= ${today.toISOString()})::int`,
      todayRevenue: sql<number>`coalesce(sum(${ordersTable.total}::numeric) filter (where ${ordersTable.createdAt} >= ${today.toISOString()}), 0)::float`,
    })
    .from(ordersTable);

  res.json(GetOrderStatsResponse.parse({
    totalOrders: totals?.totalOrders ?? 0,
    pendingOrders: totals?.pendingOrders ?? 0,
    completedOrders: totals?.completedOrders ?? 0,
    totalRevenue: totals?.totalRevenue ?? 0,
    todayOrders: totals?.todayOrders ?? 0,
    todayRevenue: totals?.todayRevenue ?? 0,
  }));
});

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} desc`);
  const rows = await query;

  let filtered = rows;
  if (params.data.status) {
    filtered = filtered.filter((o) => o.status === params.data.status);
  }

  const mapped = filtered.map((o) => ({
    ...o,
    total: parseFloat(o.total),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  res.json(ListOrdersResponse.parse(mapped));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items, customerName, customerNote } = parsed.data;

  // Validate stock and fetch product info
  const productIds = items.map((i) => i.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(sql`${productsTable.id} = ANY(${productIds})`);

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Check availability and stock
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    if (!product.available) {
      res.status(400).json({ error: `Product "${product.name}" is not available` });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({
        error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
      });
      return;
    }
  }

  // Build order items with current prices
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      price: parseFloat(product.price),
    };
  });

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Insert order
  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: customerName ?? null,
      customerNote: customerNote ?? null,
      status: "pending",
      total: String(total),
      items: orderItems,
    })
    .returning();

  // Decrement stock for each item — real stock control
  for (const item of items) {
    const product = productMap.get(item.productId)!;
    const newStock = product.stock - item.quantity;
    await db
      .update(productsTable)
      .set({
        stock: newStock,
        // Auto-mark unavailable when stock hits zero
        available: newStock > 0 ? product.available : false,
      })
      .where(eq(productsTable.id, item.productId));
  }

  res.status(201).json(GetOrderResponse.parse({
    ...order,
    total: parseFloat(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse({
    ...order,
    total: parseFloat(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set(parsed.data)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(UpdateOrderResponse.parse({
    ...updated,
    total: parseFloat(updated.total),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }));
});

export default router;
