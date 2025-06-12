export default {
  uri: process.env.MONGODB_URI,
  secret: process.env.MIGRATE_SECRET_KEY,
  collection: "migrations",
  migrationsPath: "./src/server/migrations",
  autosync: true,
  moduleSystem: 'esm',
  dbName: "projeto"
}; 