//server/src/server.ts
/** @format */
import "dotenv/config"; // <- MUST be first so process.env is populated for modules
import { initApp } from "./app";

console.log("🧩 ENV file loaded from:", process.cwd());
console.log(
  "🔑 GOOGLE_OAUTH_TOKEN =",
  process.env.GOOGLE_OAUTH_TOKEN?.slice(0, 40)
);

const PORT = process.env.PORT || 4000;

async function main() {
  const app = await initApp();

  app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
    console.log(`💓 Health check at http://localhost:${PORT}/api/health`);
  });
}

main().catch((err) => {
  console.error("❌ Startup failed:", err);
  process.exit(1);
});
