import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';

export default {
  tests: 'tests/e2e/**/*.e2e.ts',
  targets: [
    {
      name: 'web',
      engine: web({ browser: 'chromium' }),
      app: {
        url: 'http://127.0.0.1:8080',
        command: {
          executable: process.execPath,
          args: ['tests/e2e/static-server.mjs'],
          log: '.e2e/logs/app.log',
        },
      },
    },
  ],
} satisfies E2EConfig;
