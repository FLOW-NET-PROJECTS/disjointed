import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, ordersTable, productsTable, pushSubscriptionsTable } from "@workspace/db";
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
import { getAuthenticatedUser } from "../lib/auth";
import { logger } from "../lib/logger";
import { sendPush } from "../lib/push";

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

  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(sql`${ordersTable.createdAt} desc`);

  let filtered = rows;
  if (params.data.status) {
    filtered = filtered.filter((order) => order.status === params.data.status);
  }

  const mapped = filtered.map((order) => ({
    ...order,
    total: parseFloat(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  res.json(ListOrdersResponse.parse(mapped));
});

router.post("/orders", async (req, res): Promise<void> => {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    res.status(401).json({ error: "Please register or log in before placing an order." });
    return;
  }

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items, customerName, customerNote, customerPushSubscription } = parsed.data;
  const resolvedCustomerName = customerName?.trim() || authUser.fullName;

  const productIds = items.map((item) => item.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(sql`${productsTable.id} = ANY(${productIds})`);

  const productMap = new Map(products.map((product) => [product.id, product]));

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

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      price: parseFloat(product.price),
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: resolvedCustomerName,
      customerNote: customerNote ?? null,
      status: "pending",
      total: String(total),
      items: orderItems,
      customerPushSubscription: customerPushSubscription ?? null,
    })
    .returning();

  for (const item of items) {
    const product = productMap.get(item.productId)!;
    const newStock = product.stock - item.quantity;

    await db
      .update(productsTable)
      .set({
        stock: newStock,
        available: newStock > 0 ? product.available : false,
      })
      .where(eq(productsTable.id, item.productId));
  }

  try {
    const adminSubs = await db.select().from(pushSubscriptionsTable);
    for (const sub of adminSubs) {
      await sendPush(
        { endpoint: sub.endpoint, keys: sub.keys },
        {
          title: "New Order",
          body: `Order #${order.id} from ${resolvedCustomerName} - R${total.toFixed(2)}`,
          tag: `order-${order.id}`,
          url: "/admin/orders",
        },
      );
    }
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), orderId: order.id },
      "Skipping admin order push delivery after storage lookup failure",
    );
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

  if (parsed.data.status === "ready" && updated.customerPushSubscription) {
    await sendPush(updated.customerPushSubscription, {
      title: "Your order is ready!",
      body: `Order #${updated.id} is ready for pickup. Head to the counter to collect and pay.`,
      tag: `ready-${updated.id}`,
      url: `/orders?id=${updated.id}`,
    });
  }

  res.json(UpdateOrderResponse.parse({
    ...updated,
    total: parseFloat(updated.total),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }));
});

export default router;
