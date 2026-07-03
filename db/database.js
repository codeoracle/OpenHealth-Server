// Chooses the storage backend at startup:
//   - MongoDB when MONGODB_URI is set (recommended for production / Render)
//   - Postgres when DATABASE_URL is set
//   - SQLite otherwise (zero-config local development)
//
// All implementations expose the same async API, so routes stay identical.
const impl = process.env.MONGODB_URI
  ? require("./mongodb")
  : process.env.DATABASE_URL
    ? require("./postgres")
    : require("./sqlite");

module.exports = impl;
