import "dotenv/config";
import { vi } from "vitest";
import { testDatabaseUrl } from "./database-safety";

vi.mock("server-only", () => ({}));

const databaseUrl = testDatabaseUrl(process.env);
process.env.LAB01_APPLICATION_DATABASE_URL = process.env.DATABASE_URL;
process.env.DATABASE_URL = databaseUrl;
