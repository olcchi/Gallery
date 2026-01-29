import type { GalleryImage } from '../types/gallery';

export class ModalController {
  private images: GalleryImage[];
  private flowImages: NodeListOf<HTMLImageElement>;
  private modalImageWrapper: HTMLElement;
  private modalImg: HTMLImageElement;
  private returnTo: HTMLElement;
  private prev: HTMLElement;
  private next: HTMLElement;
  private curImage: HTMLElement;
  private currentIndex: number = 0;

  constructor(images: GalleryImage[]) {
    this.images = images;
    this.modalImageWrapper = document.querySelector(".modalImageWrapper")!;
    this.modalImg = document.querySelector(".modalImg")!;
    this.returnTo = document.querySelector(".returnTo")!;
    this.prev = document.querySelector(".prev")!;
    this.next = document.querySelector(".next")!;
    this.curImage = document.querySelector(".curImage")!;
    this.flowImages = document.querySelectorAll(".flowImage");

    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    // 关闭模态框
    this.returnTo.addEventListener("click", () => {
      this.closeModal();
    });

    // 阻止滚动
    const preventDefault = (e: Event) => e.preventDefault();
    this.modalImageWrapper.addEventListener("wheel", preventDefault, { passive: false });
    this.modalImageWrapper.addEventListener("touchmove", preventDefault, { passive: false });

    // 图片点击事件
    this.flowImages.forEach((img, index) => {
      img.addEventListener("click", () => {
        this.openModal(index);
      });
    });

    // 导航按钮
    this.prev.addEventListener(
      "click",
      this.debounce(() => this.navigate("prev"), 100)
    );
    this.next.addEventListener(
      "click",
      this.debounce(() => this.navigate("next"), 100)
    );

    // 键盘导航
    document.addEventListener("keydown", (e) => {
      if (this.modalImageWrapper.classList.contains("opacity-100")) {
        switch (e.key) {
          case "ArrowLeft":
            this.navigate("prev");
            break;
          case "ArrowRight":
            this.navigate("next");
            break;
          case "Escape":
            this.closeModal();
            break;
        }
      }
    });
  }

  private openModal(index: number) {
    this.currentIndex = index;
    const img = this.flowImages[index];
    if (!img) return;
    
    // 优化：优先使用当前已加载的图片（缩略图/WebP），利用浏览器缓存实现瞬间显示
    const cachedSrc = img.currentSrc || img.src;
    this.modalImg.src = cachedSrc;
    
    this.modalImageWrapper.classList.remove("opacity-0", "pointer-events-none");
    this.modalImageWrapper.classList.add("opacity-100", "pointer-events-auto");
    document.body.style.overflow = "hidden";
    this.updatePrevNextState();
    this.curImage.innerHTML = `${this.currentIndex + 1} of ${this.images.length}`;

    // 渐进式加载
    this.loadHighResImage(index);
  }

  private closeModal() {
    this.modalImageWrapper.classList.remove("opacity-100", "pointer-events-auto");
    this.modalImageWrapper.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "auto";
    
    // 等待过渡动画完成后清除图片
    setTimeout(() => {
      if (this.modalImageWrapper.classList.contains("opacity-0")) {
        this.modalImg.src = "";
      }
    }, 300);
  }

  private navigate(direction: "prev" | "next") {
    if (direction === "prev" && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === "next" && this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else {
      // 循环到开头或结尾
      this.currentIndex = direction === "next" ? 0 : this.images.length - 1;
    }

    this.updateModalImage(this.currentIndex);
    this.updatePrevNextState();
  }

  private updateModalImage(index: number) {
    this.modalImg.style.opacity = "0";
    setTimeout(() => {
      const img = this.flowImages[index];
      if (!img) return;
      
      const cachedSrc = img.currentSrc || img.src;
      this.modalImg.src = cachedSrc;
      
      this.modalImg.onload = () => {
        this.modalImg.style.opacity = "1";
        this.loadHighResImage(index);
      };
    }, 100);
    this.curImage.innerHTML = `${index + 1} of ${this.images.length}`;
  }

  private loadHighResImage(index: number) {
    const img = this.flowImages[index];
    const originalSrc = img?.dataset.src;
    
    if (!originalSrc) return;

    const highResImg = new Image();
    highResImg.src = originalSrc;
    
    highResImg.onload = () => {
      if (this.currentIndex === index) {
        this.modalImg.src = originalSrc;
      }
    };
  }

  private updatePrevNextState() {
    this.prev.classList.toggle("disabled", this.currentIndex === 0);
    this.next.classList.toggle("disabled", this.currentIndex === this.images.length - 1);
  }

  private debounce(func: Function, delay: number) {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  public destroy() {
    // 实际清理逻辑...
  }
} 