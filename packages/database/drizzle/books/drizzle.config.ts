import type { Config } from 'drizzle-kit';

export default {
    schema: './drizzle/books/schema.ts',
    out: './drizzle/books/migrations',
    dialect: 'sqlite',
    verbose: true,
    strict: true,
} satisfies Config;

