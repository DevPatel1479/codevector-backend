const HttpError = require("../utils/httpError");
const categories = require("../constants/categories");

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function parseIdParam(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, "Invalid product id");
  }
  return parsed;
}


function validateProductCreateBody(body) {
  const { name, category, price } = body || {};

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 255) {
    throw new HttpError(400, "name must be a string between 2 and 255 characters");
  }

  if (!categories.includes(category)) {
    throw new HttpError(400, `category must be one of: ${categories.join(", ")}`);
  }

  if (!isValidNumber(price) || price < 0) {
    throw new HttpError(400, "price must be a valid non-negative number");
  }

  return {
    name: name.trim(),
    category,
    price,
  };
}

function validateProductPutBody(body) {
  const { name, category, price } = body || {};

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 255) {
    throw new HttpError(400, "name must be a string between 2 and 255 characters");
  }

  if (!categories.includes(category)) {
    throw new HttpError(400, `category must be one of: ${categories.join(", ")}`);
  }

  if (!isValidNumber(price) || price < 0) {
    throw new HttpError(400, "price must be a valid non-negative number");
  }

  return {
    name: name.trim(),
    category,
    price,
  };
}

function validateProductPatchBody(body) {
  const { name, category, price } = body || {};
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 255) {
      throw new HttpError(400, "name must be a string between 2 and 255 characters");
    }
    updates.name = name.trim();
  }

  if (category !== undefined) {
    if (!categories.includes(category)) {
      throw new HttpError(400, `category must be one of: ${categories.join(", ")}`);
    }
    updates.category = category;
  }

  if (price !== undefined) {
    if (!isValidNumber(price) || price < 0) {
      throw new HttpError(400, "price must be a valid non-negative number");
    }
    updates.price = price;
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "At least one field must be provided for patch");
  }

  return updates;
}

function validateProductsQuery(query) {
  const errors = [];

  const limitRaw = query.limit;
  let limit = 20;
  if (limitRaw !== undefined) {
    limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.push("limit must be an integer between 1 and 100");
    }
  }

  const category = query.category !== undefined ? String(query.category).trim() : null;
  if (category && !categories.includes(category)) {
    errors.push(`category must be one of: ${categories.join(", ")}`);
  }

  const cursor = query.cursor !== undefined ? String(query.cursor).trim() : null;
  if (cursor === "") {
    errors.push("cursor cannot be empty");
  }

  if (errors.length > 0) {
    throw new HttpError(400, "Invalid query parameters", errors);
  }

  return {
    limit,
    category: category || null,
    cursor,
  };
}

module.exports = { 
  validateProductsQuery , 
  parseIdParam,
  validateProductCreateBody,
  validateProductPutBody,
  validateProductPatchBody
};
