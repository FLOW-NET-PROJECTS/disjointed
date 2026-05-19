import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
  GetProductStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function normalizeOptionalNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : value;
}

function normalizeOptionalBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}

function normalizeProductBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return body;
  }

  const source = body as Record<string, unknown>;

  return {
    ...source,
    name: normalizeOptionalString(source.name),
    description: normalizeOptionalString(source.description),
    price: normalizeOptionalNumber(source.price),
    thcLevel: normalizeOptionalNumber(source.thcLevel),
    cbdLevel: normalizeOptionalNumber(source.cbdLevel),
    strain: normalizeOptionalString(source.strain),
    weight: normalizeOptionalString(source.weight),
    imageUrl: normalizeOptionalString(source.imageUrl),
    available: normalizeOptionalBoolean(source.available),
    categoryId: normalizeOptionalNumber(source.categoryId),
    stock: normalizeOptionalNumber(source.stock),
  };
}

router.get("/products/stats", async (req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalProducts: sql<number>`count(*)::int`,
      availableProducts: sql<number>`count(*) filter (where ${productsTable.available} = true)::int`,
      lowStock: sql<number>`count(*) filter (where ${productsTable.stock} <= 5 and ${productsTable.available} = true)::int`,
    })
    .from(productsTable);

  const [catCount] = await db
    .select({ totalCategories: sql<number>`count(*)::int` })
    .from(categoriesTable);

  const stats = {
    totalProducts: totals?.totalProducts ?? 0,
    availableProducts: totals?.availableProducts ?? 0,
    totalCategories: catCount?.totalCategories ?? 0,
    lowStock: totals?.lowStock ?? 0,
  };

  res.json(GetProductStatsResponse.parse(stats));
});

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      thcLevel: productsTable.thcLevel,
      cbdLevel: productsTable.cbdLevel,
      strain: productsTable.strain,
      weight: productsTable.weight,
      imageUrl: productsTable.imageUrl,
      available: productsTable.available,
      categoryId: productsTable.categoryId,
      category: categoriesTable.name,
      stock: productsTable.stock,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .orderBy(productsTable.createdAt);

  let filtered = rows;
  if (params.data.category) {
    filtered = filtered.filter((p) => p.category === params.data.category);
  }
  if (params.data.available !== undefined) {
    filtered = filtered.filter((p) => p.available === params.data.available);
  }

  const mapped = filtered.map((p) => ({
    ...p,
    price: parseFloat(p.price),
    thcLevel: p.thcLevel != null ? parseFloat(p.thcLevel) : null,
    cbdLevel: p.cbdLevel != null ? parseFloat(p.cbdLevel) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  res.json(ListProductsResponse.parse(mapped));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(normalizeProductBody(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { price, thcLevel, cbdLevel, stock, available, categoryId, ...rest } = parsed.data;

  const [product] = await db
    .insert(productsTable)
    .values({
      ...rest,
      price: String(price),
      thcLevel: thcLevel != null ? String(thcLevel) : null,
      cbdLevel: cbdLevel != null ? String(cbdLevel) : null,
      stock: stock ?? 0,
      available: available ?? true,
      categoryId: categoryId ?? null,
    })
    .returning();

  const row = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      thcLevel: productsTable.thcLevel,
      cbdLevel: productsTable.cbdLevel,
      strain: productsTable.strain,
      weight: productsTable.weight,
      imageUrl: productsTable.imageUrl,
      available: productsTable.available,
      categoryId: productsTable.categoryId,
      category: categoriesTable.name,
      stock: productsTable.stock,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, product.id));

  const p = row[0];
  if (!p) {
    res.status(500).json({ error: "Failed to retrieve created product" });
    return;
  }

  res.status(201).json(GetProductResponse.parse({
    ...p,
    price: parseFloat(p.price),
    thcLevel: p.thcLevel != null ? parseFloat(p.thcLevel) : null,
    cbdLevel: p.cbdLevel != null ? parseFloat(p.cbdLevel) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      thcLevel: productsTable.thcLevel,
      cbdLevel: productsTable.cbdLevel,
      strain: productsTable.strain,
      weight: productsTable.weight,
      imageUrl: productsTable.imageUrl,
      available: productsTable.available,
      categoryId: productsTable.categoryId,
      category: categoriesTable.name,
      stock: productsTable.stock,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  const p = row[0];
  if (!p) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse({
    ...p,
    price: parseFloat(p.price),
    thcLevel: p.thcLevel != null ? parseFloat(p.thcLevel) : null,
    cbdLevel: p.cbdLevel != null ? parseFloat(p.cbdLevel) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(normalizeProductBody(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { price, thcLevel, cbdLevel, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (price !== undefined) updates.price = String(price);
  if (thcLevel !== undefined) updates.thcLevel = thcLevel != null ? String(thcLevel) : null;
  if (cbdLevel !== undefined) updates.cbdLevel = cbdLevel != null ? String(cbdLevel) : null;

  const [updated] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const row = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      thcLevel: productsTable.thcLevel,
      cbdLevel: productsTable.cbdLevel,
      strain: productsTable.strain,
      weight: productsTable.weight,
      imageUrl: productsTable.imageUrl,
      available: productsTable.available,
      categoryId: productsTable.categoryId,
      category: categoriesTable.name,
      stock: productsTable.stock,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  const p = row[0];
  if (!p) {
    res.status(500).json({ error: "Failed to retrieve updated product" });
    return;
  }

  res.json(UpdateProductResponse.parse({
    ...p,
    price: parseFloat(p.price),
    thcLevel: p.thcLevel != null ? parseFloat(p.thcLevel) : null,
    cbdLevel: p.cbdLevel != null ? parseFloat(p.cbdLevel) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
