import { config as loadEnv } from 'dotenv';

loadEnv();

function required(envVar: string): string {
  const value = process.env[envVar];
  if (!value) {
    throw new Error(`Environment variable ${envVar} is required but was not provided.`);
  }
  return value;
}

function optional(envVar: string): string | undefined {
  return process.env[envVar];
}

function parseNumber(value: string | undefined, fallback: number, envVar?: string): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    if (envVar) {
      throw new Error(`Environment variable ${envVar} must be numeric but received "${value}".`);
    }
    throw new Error(`Expected numeric environment variable but received "${value}".`);
  }
  return parsed;
}

function buildDatabaseUrl(): string {
  const explicitUrl = optional('DATABASE_URL');
  const hostOverride = optional('DB_HOST');
  const portOverride = optional('DB_PORT');
  const usernameOverride = optional('DB_USER');
  const passwordOverride = optional('DB_PASSWORD');
  const nameOverride = optional('DB_NAME');

  if (explicitUrl) {
    const url = new URL(explicitUrl);
    if (hostOverride) {
      url.hostname = hostOverride;
    }
    if (portOverride) {
      url.port = String(parseNumber(portOverride, Number(url.port) || 5432, 'DB_PORT'));
    }
    if (usernameOverride) {
      url.username = usernameOverride;
    }
    if (passwordOverride) {
      url.password = passwordOverride;
    }
    if (nameOverride) {
      url.pathname = `/${nameOverride}`;
    }
    return url.toString();
  }

  const username = usernameOverride ?? 'postgres';
  const password = passwordOverride ?? 'postgres';
  const host = hostOverride ?? 'localhost';
  const port = parseNumber(portOverride, 5432, 'DB_PORT');
  const dbName = nameOverride ?? 'numbertalk';

  return `postgres://${username}:${password}@${host}:${port}/${dbName}`;
}

export const appConfig = {
  port: parseNumber(process.env.PORT, 4000, 'PORT'),
  databaseUrl: buildDatabaseUrl(),
  jwtSecret: required('JWT_SECRET'),
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 10, 'BCRYPT_SALT_ROUNDS')
} as const;

