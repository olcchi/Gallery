import type { GalleryImage } from '../types/gallery';

export class ModalController {
  private images: GalleryImage[];
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

    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    // 关闭模态框
    this.returnTo.addEventListener("click", () => {
      this.closeModal();
    });

    // 阻止滚动
    this.modalImageWrapper.addEventListener(
      "wheel touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    // 图片点击事件
    const flowImages = document.querySelectorAll(".flowImage");
    flowImages.forEach((img, index) => {
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
      if (!this.modalImageWrapper.classList.contains("hidden")) {
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
    const img = document.querySelectorAll(".flowImage")[index] as HTMLImageElement;
    this.modalImg.src = img.dataset.src!;
    this.modalImageWrapper.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    this.updatePrevNextState();
    this.curImage.innerHTML = `${this.currentIndex + 1} of ${this.images.length}`;
  }

  private closeModal() {
    this.modalImageWrapper.classList.add("hidden");
    document.body.style.overflow = "auto";
    this.modalImg.src = "";
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
      const img = document.querySelectorAll(".flowImage")[index] as HTMLImageElement;
      this.modalImg.src = img.dataset.src!;
      this.modalImg.onload = () => {
        this.modalImg.style.opacity = "1";
      };
    }, 100);
    this.curImage.innerHTML = `${index + 1} of ${this.images.length}`;
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
    // 清理事件监听器
    // 注意：实际的清理需要保存原始的事件监听器引用
    // 这里只是示例，实际使用时需要保存引用
  }
} 