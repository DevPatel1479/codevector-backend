function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor) {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json);

    if (
      !parsed ||
      typeof parsed.snapshotAt !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.id !== "number"
    ) {
      throw new Error("Invalid cursor shape");
    }

    return parsed;
  } catch {
    throw new Error("Invalid cursor");
  }
}

module.exports = { encodeCursor, decodeCursor };
