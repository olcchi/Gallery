// 立即执行函数，用于内联脚本
export const themeScript = `
(function() {
  const applyTheme = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  };
  
  applyTheme();
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  
  document.addEventListener('astro:after-swap', applyTheme);
})();
`;

// 为了兼容性保留一个空的 initTheme，或者如果不需要了可以删除
export const initTheme = () => {
  // 逻辑已经包含在 themeScript 中，通过 is:inline 注入
};
 