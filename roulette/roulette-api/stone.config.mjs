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
        'drizzle-orm/libsql',
        '@aws-sdk/client-sns',
        '@aws-sdk/lib-dynamodb',
        '@aws-sdk/client-dynamodb',
      ],
    }
  }
})
