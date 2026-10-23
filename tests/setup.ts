import "dotenv/config";
import { testDatabaseUrl } from "./database-safety";

const databaseUrl = testDatabaseUrl(process.env);
process.env.LAB01_APPLICATION_DATABASE_URL = process.env.DATABASE_URL;
process.env.DATABASE_URL = databaseUrl;
