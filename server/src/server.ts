//server/src/server.ts
/** @format */
import { initApp } from "./app";

const PORT = process.env.PORT || 4000;

async function main() {
  const app = await initApp();

  app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
    console.log(`💓 Health check at http://localhost:${PORT}/api/health`); // ✅ helpful log
  });
}

main().catch((err) => {
  console.error("❌ Startup failed:", err);
  process.exit(1);
});
