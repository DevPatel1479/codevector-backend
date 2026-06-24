require("dotenv").config();
const { faker } = require("@faker-js/faker");
const pool = require("../src/config/db");
const categories = require("../src/constants/categories");

const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;

function randomPrice() {
  return Number(faker.commerce.price({ min: 5, max: 5000, dec: 2 }));
}

function randomPastDate() {
  return faker.date.between({
    from: "2021-01-01T00:00:00.000Z",
    to: new Date(),
  });
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");

    const batches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);

    for (let batch = 0; batch < batches; batch += 1) {
      const size = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - batch * BATCH_SIZE);
      const names = [];
      const cats = [];
      const prices = [];
      const createdAts = [];
      const updatedAts = [];

      for (let i = 0; i < size; i += 1) {
        const createdAt = randomPastDate();
        const updatedAt = faker.date.between({
          from: createdAt,
          to: new Date(),
        });

        names.push(faker.commerce.productName());
        cats.push(faker.helpers.arrayElement(categories));
        prices.push(randomPrice());
        createdAts.push(createdAt.toISOString());
        updatedAts.push(updatedAt.toISOString());
      }

      await client.query(
        `
        INSERT INTO products (name, category, price, created_at, updated_at)
        SELECT * FROM UNNEST(
          $1::text[],
          $2::text[],
          $3::numeric[],
          $4::timestamptz[],
          $5::timestamptz[]
        );
      `,
        [names, cats, prices, createdAts, updatedAts]
      );

      console.log(`Inserted ${Math.min((batch + 1) * BATCH_SIZE, TOTAL_PRODUCTS)} / ${TOTAL_PRODUCTS}`);
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
