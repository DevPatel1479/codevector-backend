# CodeVector Backend Assignment

A scalable **Node.js + Express** backend built for the **CodeVector Internship Take-Home Assignment**.

This project provides a REST API to browse approximately **200,000 products** using **cursor-based pagination**, category filtering, and stable pagination even when data changes during browsing.

---



**GitHub:** https://github.com/DevPatel1479

# Live URL

**Live Backend Render URL:** https://codevector-backend-3aun.onrender.com

**Live Backend Products URL:** https://codevector-backend-3aun.onrender.com/products

**Live Frontend (Bonus):** https://codevector-frontend-zeta.vercel.app



## 🚀 Features

- Cursor-based pagination
- Category filtering
- Stable pagination using snapshot timestamps
- Create, Replace, and Partial Update APIs
- PostgreSQL database
- Centralized error handling
- Request validation
- Health check endpoint
- Production-ready folder structure

---

## 🛠 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Neon Database
- Render
- JavaScript (ES6)

---

## 📂 Project Structure

```text
src/
├── config/
│   └── db.js
├── constants/
│   └── categories.js
├── controllers/
├── middlewares/
├── routes/
├── services/
├── utils/
├── validators/
├── app.js
└── server.js
```

The project follows a layered architecture:

- **Routes** → API endpoints
- **Controllers** → Request handling
- **Validators** → Input validation
- **Services** → Business logic & database queries
- **Utils** → Cursor encoding/decoding
- **Middlewares** → Error handling & 404 handling

---

# 📌 API Endpoints

## Health Check

```http
GET /health
```

Returns the server status.

---

## Get Products

```http
GET /products
```

### Query Parameters

| Parameter | Description |
|------------|-------------|
| limit | Number of products per page (1–100) |
| category | Filter products by category |
| cursor | Cursor returned from previous request |

### Examples

```http
GET /products?limit=20
```

```http
GET /products?limit=20&category=electronics
```

```http
GET /products?limit=20&category=electronics&cursor=<cursor>
```

---

## Create Product

```http
POST /products
```

Example Request

```json
{
  "name": "Wireless Mouse",
  "category": "electronics",
  "price": 29.99
}
```

---

## Replace Product

```http
PUT /products/:id
```

Replaces the entire product.

---

## Update Product

```http
PATCH /products/:id
```

Updates one or more product fields.

---

# 📖 Pagination Strategy

Instead of traditional **OFFSET pagination**, this project uses **cursor-based pagination**.

Products are ordered by:

```sql
ORDER BY created_at DESC, id DESC
```

Each cursor stores:

- snapshotAt
- createdAt
- id

Example cursor payload:

```json
{
  "snapshotAt": "2026-06-24T05:56:09.185Z",
  "createdAt": "2026-06-17T19:17:01.478Z",
  "id": 193854
}
```

The payload is Base64 URL encoded before being returned to the client.

---

# 📌 Why Snapshot Pagination?

One requirement of the assignment was:

> If new products are added or existing products are updated while a user is browsing, they should never see duplicate or missing products.

To satisfy this requirement, the first request captures a **snapshot timestamp**.

Every subsequent request only reads products created before that snapshot.

This guarantees:

- No duplicate products
- No skipped products
- Stable pagination
- Consistent ordering across requests

---

# ✅ Validation

The API validates:

- Product ID
- Category
- Page limit
- Cursor
- Request body

Invalid requests return descriptive **HTTP 400** responses.

---

# ⚠ Error Handling

The project includes centralized error handling for:

- Validation errors
- Invalid cursor
- Product not found
- Unknown routes
- Unexpected server errors

---

# 🔧 Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000

DATABASE_URL=your_postgres_connection_string

CLIENT_URL=http://localhost:5173
```

---

# 💻 Installation

Clone the repository

```bash
git clone <repository-url>
cd codevector-backend
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

or

```bash
npm start
```

---

# 📦 Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": 200001,
      "name": "Wireless Mouse",
      "category": "electronics",
      "price": 29.99,
      "created_at": "2026-06-24T10:30:00.000Z",
      "updated_at": "2026-06-24T10:30:00.000Z"
    }
  ],
  "pageInfo": {
    "nextCursor": "...",
    "hasNextPage": true,
    "limit": 20,
    "category": "electronics"
  }
}
```

---

# ⚡ Performance

This backend is designed to efficiently handle datasets of approximately **200,000 products**.

Instead of OFFSET pagination, it uses indexed cursor-based pagination:

```sql
ORDER BY created_at DESC, id DESC
```

Cursor filtering:

```sql
created_at < cursor_created_at

OR

(created_at = cursor_created_at AND id < cursor_id)
```

This approach avoids scanning increasingly larger offsets and provides consistent performance.

---

# 🚀 Future Improvements

Given more time, I would:

- Add automated unit and integration tests
- Add Swagger/OpenAPI documentation
- Implement request logging
- Add rate limiting
- Add authentication & authorization
- Dockerize the application
- Add CI/CD using GitHub Actions
- Optimize indexes for larger datasets

---

# 🤖 AI Usage

AI (ChatGPT) was used as a development assistant for:

- Discussing pagination strategies
- Reviewing SQL queries
- Debugging cursor edge cases
- Improving project structure
- Refining documentation

All generated code and suggestions were manually reviewed, tested, and modified before inclusion in the final solution.

---

# 🎯 Assignment Focus

This implementation focuses on:

- Efficient cursor-based pagination
- Stable browsing while data changes
- Clean project architecture
- Maintainable code
- Proper validation and error handling

---

# 👨‍💻 Author

**Name:** Dev Patel

