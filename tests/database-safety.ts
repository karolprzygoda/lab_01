type DatabaseEnvironment = Record<string, string | undefined>;

function host(url: URL) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ? "loopback"
    : url.hostname;
}

export function testDatabaseUrl(env: DatabaseEnvironment): string {
  if (!env.TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL is required (see .env.example)");
  let target: URL;
  let application: URL | undefined;
  try {
    target = new URL(env.TEST_DATABASE_URL);
    application = env.DATABASE_URL ? new URL(env.DATABASE_URL) : undefined;
  } catch {
    throw new Error("Database URLs must be valid connection URLs");
  }
  const name = decodeURIComponent(target.pathname.slice(1));
  const separateLocalInstance = name === "template1" && application
    && host(application) === "loopback" && host(target) === "loopback"
    && (application.port || "5432") !== (target.port || "5432");
  if (!["postgres:", "postgresql:"].includes(target.protocol)
    || (!/(?:^|_)test(?:_|$)/i.test(name) && !separateLocalInstance)) {
    throw new Error("Use a dedicated test database or a separate local Prisma Postgres instance on a different port");
  }
  if (application && host(application) === host(target)
    && (application.port || "5432") === (target.port || "5432")
    && decodeURIComponent(application.pathname) === decodeURIComponent(target.pathname)) {
    throw new Error("The test database must be different from the application database");
  }
  return env.TEST_DATABASE_URL;
}
