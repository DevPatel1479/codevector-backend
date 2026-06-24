require("dotenv").config();
const pool = require("../src/config/db");

async function createTable() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
    `);

    await client.query(`
      CREATE TRIGGER trg_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_created_id
      ON products (created_at DESC, id DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_created_id
      ON products (category, created_at DESC, id DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category
      ON products (category);
    `);

    await client.query("COMMIT");
    console.log("Products table and indexes created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to create table:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

createTable();
