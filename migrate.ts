export default {
  uri: process.env.MONGODB_URI || "mongodb+srv://strongunderfed490:HYV8Gsu3MyxcLQYJ@cluster0.72eltg2.mongodb.net/projeto?retryWrites=true&w=majority&appName=Cluster0",
  collection: "migrations",
  migrationsPath: "./src/server/migrations",
  autosync: true,
  moduleSystem: 'esm',
  dbName: "projeto"
}; 