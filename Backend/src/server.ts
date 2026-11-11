import http from "node:http";
import app from "./app.js";
import { initSocketServer } from "./socket.js";
import { initSearchIndex } from "./Search/initSearch.js";
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
