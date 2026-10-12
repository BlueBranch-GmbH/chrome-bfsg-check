import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        // Tests must never touch the network (iframes in fixtures point to real URLs).
        settings: { disableIframePageLoading: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
      },
    },
    include: ['tests/**/*.test.ts'],
  },
});
