import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'

export default defineConfig({
  // site: 'https://olcchi.me',
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: false,
    },
  },
  integrations: [
    unocss(
      { injectReset: true },
    ),
  ],
  server: {
    port: 8000,
    host: true,
  },
})
