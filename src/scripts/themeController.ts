export const initTheme = () => {
  const colorSchema = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersDark = colorSchema.matches;
  
  const preferTheme = () => {
    !localStorage.getItem("globalTheme") &&
      localStorage.setItem("globalTheme", prefersDark ? "dark" : "light");
    const setting = localStorage.getItem("globalTheme");
    if (setting === "dark" || (prefersDark && setting !== "light"))
      document.documentElement.classList.toggle("dark", true);
    colorSchema.addEventListener("change", () => {
      document.documentElement.classList.toggle("dark", colorSchema.matches);
      localStorage.setItem(
        "globalTheme",
        colorSchema.matches ? "dark" : "light"
      );
    });
  };
  
  preferTheme();
};

// 立即执行函数，用于内联脚本
export const themeScript = `
const colorSchema = window.matchMedia("(prefers-color-scheme: dark)");
const prefersDark = colorSchema.matches;
const preferTheme = () => {
  !localStorage.getItem("globalTheme") &&
    localStorage.setItem("globalTheme", prefersDark ? "dark" : "light");
  const setting = localStorage.getItem("globalTheme");
  if (setting === "dark" || (prefersDark && setting !== "light"))
    document.documentElement.classList.toggle("dark", true);
  colorSchema.addEventListener("change", () => {
    document.documentElement.classList.toggle("dark", colorSchema.matches);
    localStorage.setItem(
      "globalTheme",
      colorSchema.matches ? "dark" : "light"
    );
  });
};
preferTheme();
`; 