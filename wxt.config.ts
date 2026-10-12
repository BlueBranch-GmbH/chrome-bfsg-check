import { defineConfig } from 'wxt';
import { axeLocalePlugin } from './build/axe-locale-plugin';

// Set BFSG_E2E=1 to build a variant with permanent host access. Only used for
// automated end-to-end tests, where nobody can click the toolbar icon.
const e2e = Boolean(process.env.BFSG_E2E);

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  imports: false,
  vite: () => ({
    plugins: [axeLocalePlugin()],
  }),
  manifest: {
    name: '__MSG_extName__',
    short_name: 'BFSG Check',
    author: { email: 'lb@bluebranch.de' },
    homepage_url: 'https://www.bluebranch.de/',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: ['activeTab', 'scripting', 'sidePanel', 'storage'],
    optional_host_permissions: ['<all_urls>'],
    ...(e2e ? { host_permissions: ['<all_urls>'] } : {}),
    action: {
      default_title: '__MSG_actionTitle__',
    },
    commands: {
      _execute_action: {
        suggested_key: { default: 'Alt+Shift+B' },
      },
    },
  },
});
