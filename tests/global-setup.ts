import { execSync, spawn, type ChildProcess } from "node:child_process";
import "dotenv/config";
import type { TestProject } from "vitest/node";
import { testDatabaseUrl } from "./database-safety";

const PORT = Number(process.env.TEST_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const STARTUP_TIMEOUT_MS = 150_000;

declare module "vitest" {
  export interface ProvidedContext {
    baseUrl: string;
  }
}

async function waitForServer(server: ChildProcess) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js server exited with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v1/products`);
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Next.js server did not start within ${STARTUP_TIMEOUT_MS} ms`);
}

export default async function setup(project: TestProject) {
  const env = { ...process.env, DATABASE_URL: testDatabaseUrl(process.env) };

  execSync("pnpm exec prisma migrate deploy", { env, stdio: "inherit" });

  const server = spawn("pnpm", ["exec", "next", "dev", "--port", String(PORT)], {
    env: { ...env, NEXT_DIST_DIR: ".next-test", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: process.env.DEBUG_SERVER ? "inherit" : "ignore",
    detached: true,
  });

  const stop = () => {
    if (server.pid && server.exitCode === null) {
      process.kill(-server.pid, "SIGTERM");
    }
  };

  try {
    await waitForServer(server);
  } catch (error) {
    stop();
    throw error;
  }

  project.provide("baseUrl", BASE_URL);
  return stop;
}
