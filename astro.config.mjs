import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'
import image from '@astrojs/image'

export default defineConfig({
  site: 'https://ekar.site',
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
    image(),
  ],
  server: {
    port: 8000,
    host: true,
  },
})
