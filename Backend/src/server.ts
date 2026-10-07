import app from "./app.js";
import "dotenv/config";

 


const requiredEnvs = ["JWT_ACCESS_KEY", "JWT_REFRESH_KEY", "DATABASE_URL"];
for (const env of requiredEnvs) {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: Environment variable ${env} is missing.`);
        process.exit(1);
    }
}

const port = process.env.PORT || 5000;



app.listen(port, ()=> {
    console.log(`Server listening on http://localhost:${port}`); 
});