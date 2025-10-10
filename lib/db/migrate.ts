import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate as drizzleMigrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({
  path: ".env.local",
});

export async function migrate() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const start = Date.now();
  await drizzleMigrate(db, { migrationsFolder: "./lib/db/migrations" });
  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  
  await connection.end();
  return { duration: end - start };
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0); // Exit with success code
    })
    .catch((err) => {
      console.error("❌ Migration failed");
      console.error(err);
      process.exit(1); // Exit with error code
    });
}
