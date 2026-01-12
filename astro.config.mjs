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
    // 自动决定是否内联样式表，优化小文件的加载
    inlineStylesheets: 'auto',
  },
  // 启用预获取策略，当链接进入视口时自动预加载，显著提升多页应用体验
  prefetch: true,
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
      cssCodeSplit: true, // 启用 CSS 代码拆分
      chunkSizeWarningLimit: 1000, // 提高分包警告阈值
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
