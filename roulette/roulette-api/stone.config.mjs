import { defineConfig } from '@stone-js/cli'

/**
 * Stone build configuration.
 */
export default defineConfig({
  watcher: {
    ignored: ['**/local.db']
  },
  rollup: {
    bundle: {
      external: [
        '@libsql/client',
        '@aws-sdk/client-s3',
        'drizzle-orm/libsql',
        '@aws-sdk/lib-dynamodb',
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/s3-request-presigner',
      ],
    }
  }
})
