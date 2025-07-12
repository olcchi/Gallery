import type { WaterfallConfig } from '../types/gallery';

// 函数式实现
export function createWaterfallLayout(config: WaterfallConfig) {
  // 私有变量（相当于类的私有属性）
  let container: HTMLElement;
  let items: HTMLElement[];
  let columnCount: number = 4;
  let gap: number = 8;
  let columnHeights: number[] = [];
  let resizeObserver: ResizeObserver;

  // 初始化函数（相当于constructor）
  function init() {
    container = document.getElementById(config.containerId)!;
    items = Array.from(
      container.querySelectorAll(".waterfall-item")
    );
    
    if (config.columnCount) columnCount = config.columnCount;
    if (config.gap) gap = config.gap;

    initializeLayout();
    setupResizeObserver();
    setupIntersectionObserver();

    // 监听窗口大小变化
    window.addEventListener(
      "resize",
      debounce(() => {
        updateColumnCount();
        layout();
      }, 250)
    );
  }

  function initializeLayout() {
    updateColumnCount();
    setupContainer();
    layout();
  }

  function updateColumnCount() {
    const containerWidth = container.clientWidth;
    console.log("Container width:", containerWidth); // 调试信息

    // 现在容器宽度是 min(90ch,95%)，约 720px-1000px+
    // 最小列数设为2
    if (containerWidth < 600) {
      columnCount = 2;
    } else if (containerWidth < 800) {
      columnCount = 3;
    } else {
      columnCount = 4;
    }

    console.log("Column count:", columnCount); // 调试信息
  }

  function setupContainer() {
    container.style.position = "relative";
    columnHeights = new Array(columnCount).fill(0);
  }

  async function layout() {
    const containerWidth = container.parentElement!.clientWidth;
    const columnWidth =
      (containerWidth - (columnCount - 1) * gap) / columnCount;

    // 计算瀑布流的实际宽度并设置容器宽度
    const actualWidth =
      columnCount * columnWidth + (columnCount - 1) * gap;
    container.style.width = `${actualWidth}px`;
    // 设置容器居中
    container.style.margin = "0 auto";

    // 重置列高度
    columnHeights = new Array(columnCount).fill(0);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const img = item.querySelector("img") as HTMLImageElement;

      // 等待图片加载完成
      await waitForImageLoad(img);

      // 找到最短的列
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      );

      // 计算位置
      const left = shortestColumnIndex * (columnWidth + gap);
      const top = columnHeights[shortestColumnIndex];

      // 设置item样式 - 先设置位置，再设置可见性
      item.style.position = "absolute";
      item.style.left = `${left}px`;
      item.style.top = `${top}px`;
      item.style.width = `${columnWidth}px`;
      item.style.transition = "opacity 0.6s ease";

      // 更新列高度
      columnHeights[shortestColumnIndex] += img.offsetHeight + gap;

      // 延迟显示，创建瀑布效果
      setTimeout(() => {
        item.style.opacity = "1";
      }, i * 50);
    }

    // 设置容器高度
    container.style.height = `${Math.max(...columnHeights)}px`;
  }

  function waitForImageLoad(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  }

  function setupResizeObserver() {
    resizeObserver = new ResizeObserver(() => {
      layout();
    });
    resizeObserver.observe(container);
  }

  function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target as HTMLElement;
            const img = item.querySelector("img") as HTMLImageElement;

            // 预加载图片
            if (img && !img.complete) {
              const tempImg = new Image();
              tempImg.onload = () => {
                img.src = tempImg.src;
              };
              tempImg.src = img.dataset.src || img.src;
            }
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    items.forEach((item) => {
      observer.observe(item);
    });
  }

  function debounce(func: Function, wait: number) {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function destroy() {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener("resize", layout);
  }

  // 立即初始化
  init();

  // 返回公共接口（相当于类的公共方法）
  return {
    layout,
    destroy
  };
}

 