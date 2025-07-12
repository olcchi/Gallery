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
  // 构建配置
  build: {
    // 在构建失败时不要停止整个构建过程
    failOnError: false,
  },
  // 实验性配置，用于更好的错误处理
  experimental: {
    // 启用更好的错误处理
    // 注意：这个选项可能在不同版本的Astro中有所不同
  },
  // Vite 配置
  vite: {
    // 在构建时处理网络错误
    define: {
      // 可以在这里定义全局常量
    },
    build: {
      // 增加网络超时时间
      rollupOptions: {
        // 处理动态导入错误
        onwarn(warning, warn) {
          // 忽略某些警告
          if (warning.code === 'UNRESOLVED_IMPORT') return
          warn(warning)
        }
      }
    }
  }
})
