I built the backend using Node.js, Express, and PostgreSQL on Neon.

What I chose and why:
- Cursor-based keyset pagination instead of offset pagination, because it is faster on large datasets and avoids duplicates/skipped rows when the data changes during browsing.
- A stable snapshot anchor so every page in one browsing session reads from the same view of the dataset.
- Composite indexes on `(created_at, id)` and `(category, created_at, id)` to keep the browse queries efficient.

What I would improve with more time:
- Add automated tests for pagination edge cases and cursor validation.
- Add an OpenAPI spec.
- Add CI checks and a Dockerfile.
- Add observability like request logging and metrics.

How I used AI:
- I used AI to speed up boilerplate and help structure the backend.
- I checked the query design carefully and kept the pagination logic understandable so I could explain it live.
