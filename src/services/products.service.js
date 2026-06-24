const pool = require("../config/db");
const { decodeCursor, encodeCursor } = require("../utils/cursor");
const HttpError = require("../utils/httpError");

function toIsoString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function listProducts({ limit, category, cursor }) {
  console.log("Incoming cursor:", cursor);
  let snapshotAt = null;
  let cursorCreatedAt = null;
  let cursorId = null;

  if (cursor) {
    try {
      const decoded = decodeCursor(cursor);
      console.log("Decoded cursor:", decoded);
      snapshotAt = decoded.snapshotAt;
      cursorCreatedAt = decoded.createdAt;
      cursorId = decoded.id;
      console.log({
        snapshotAt,
        cursorCreatedAt,
        cursorId,
      });
    } catch (error) {
      throw new HttpError(400, "Invalid cursor");
    }
  }

  const sql = `
    WITH params AS (
      SELECT
        $1::text AS category_filter,
        $2::int AS page_limit,
        COALESCE($3::timestamptz, CURRENT_TIMESTAMP) AS snapshot_at,
        $4::timestamptz AS cursor_created_at,
        $5::bigint AS cursor_id
    )
    SELECT
      p.id,
      p.name,
      p.category,
      p.price,
      p.created_at,
      p.updated_at,
      params.snapshot_at
    FROM products p
    CROSS JOIN params
    WHERE p.created_at <= params.snapshot_at
      AND (params.category_filter IS NULL OR p.category = params.category_filter)
      AND (
        params.cursor_created_at IS NULL
        OR p.created_at < params.cursor_created_at
        OR (p.created_at = params.cursor_created_at AND p.id < params.cursor_id)
      )
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT (SELECT page_limit + 1 FROM params);
  `;
  
  const values = [category, limit, snapshotAt, cursorCreatedAt, cursorId];
  console.log(values);
  const { rows } = await pool.query(sql, values);
  console.log(rows[0]);
  console.log(rows[rows.length - 1]);
  console.log(rows.length);
  const hasNextPage = rows.length > limit;
  const pageRows = hasNextPage ? rows.slice(0, limit) : rows;

  const items = pageRows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  let nextCursor = null;
  if (hasNextPage && pageRows.length > 0) {
    const lastRow = pageRows[pageRows.length - 1];
    nextCursor = encodeCursor({
      snapshotAt: toIsoString(rows[0].snapshot_at),
      createdAt: toIsoString(lastRow.created_at),
      id: Number(lastRow.id),
    });
  }
  console.log("========== RESPONSE ==========");
  console.log("First item:", items[0]?.id);
  console.log("Last item :", items[items.length - 1]?.id);
  console.log("Next cursor:", nextCursor);
  console.log(
    decodeCursor(nextCursor)
  );
  console.log("==============================");
  return {
    items,
    pageInfo: {
      nextCursor,
      hasNextPage,
      limit,
      category,
    },
  };
}


async function createProduct({ name, category, price }) {
  const sql = `
    INSERT INTO products (name, category, price, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, name, category, price, created_at, updated_at;
  `;

  const { rows } = await pool.query(sql, [name, category, price]);
  return rows[0];
}

async function replaceProduct(id, { name, category, price }) {
  const sql = `
    UPDATE products
    SET
      name = $1,
      category = $2,
      price = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, name, category, price, created_at, updated_at;
  `;

  const { rows } = await pool.query(sql, [name, category, price, id]);

  if (rows.length === 0) {
    throw new HttpError(404, "Product not found");
  }

  return rows[0];
}

async function patchProduct(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  }

  fields.push(`updated_at = NOW()`);

  values.push(id);

  const sql = `
    UPDATE products
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, name, category, price, created_at, updated_at;
  `;

  const { rows } = await pool.query(sql, values);

  if (rows.length === 0) {
    throw new HttpError(404, "Product not found");
  }

  return rows[0];
}

module.exports = { 
  listProducts ,
  createProduct,
  replaceProduct,
  patchProduct

};
