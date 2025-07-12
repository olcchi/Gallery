export interface GalleryImage {
  url: string;
  alt?: string;
}

export interface WaterfallConfig {
  columnCount?: number;
  gap?: number;
  containerId: string;
}

export interface ModalConfig {
  images: GalleryImage[];
  modalImageWrapper: HTMLElement;
  modalImg: HTMLImageElement;
  returnTo: HTMLElement;
  prev: HTMLElement;
  next: HTMLElement;
  curImage: HTMLElement;
} 