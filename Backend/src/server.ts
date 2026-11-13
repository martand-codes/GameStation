import http from "node:http";
import app from "./app.js";
import { initSocketServer } from "./socket.js";
import { initSearchIndex } from "./Search/initSearch.js";
import { prisma } from "./prisma/db.js";
import "dotenv/config";

const requiredEnvs = ["JWT_ACCESS_KEY", "JWT_REFRESH_KEY", "DATABASE_URL"];
for (const env of requiredEnvs) {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: Environment variable ${env} is missing.`);
        process.exit(1);
    }
}

const port = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`); 
    initSearchIndex().catch(console.error);
});

// ── GRACEFUL SHUTDOWN HANDLER (CONTAINER & OS SIGNALS) ──────────────
const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Lifecycle] Received ${signal}. Initiating graceful shutdown...`);

    // Stop accepting new incoming HTTP & WebSocket connections
    httpServer.close(async (err) => {
        if (err) {
            console.error("[Lifecycle] Error closing HTTP server:", err);
        } else {
            console.log("[Lifecycle] HTTP and WebSocket listeners closed.");
        }

        try {
            // Drain Prisma database connection pool
            await prisma.$disconnect();
            console.log("[Lifecycle] Prisma database connection pool safely drained.");
            process.exit(0);
        } catch (dbErr) {
            console.error("[Lifecycle] Error disconnecting Prisma:", dbErr);
            process.exit(1);
        }
    });

    // 5-second fail-safe timeout to prevent hanging zombie processes
    setTimeout(() => {
        console.error("[Lifecycle] Forced termination: Connections did not close within 5 seconds.");
        process.exit(1);
    }, 5000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
