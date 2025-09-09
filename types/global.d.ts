declare module 'qrcodejs2' {
  interface QRCodeOptions {
    text?: string;
    width?: number;
    height?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: number;
  }

  class QRCode {
    constructor(element: HTMLElement | string, options?: QRCodeOptions);
    makeCode(text: string): void;
    clear(): void;
  }

  export = QRCode;
}

declare module 'cropperjs' {
  interface CropperOptions {
    aspectRatio?: number;
    viewMode?: number;
    background?: boolean;
    autoCropArea?: number;
    responsive?: boolean;
    checkOrientation?: boolean;
  }

  interface CropperCanvas {
    width?: number;
    height?: number;
  }

  class Cropper {
    constructor(element: HTMLElement, options?: CropperOptions);
    destroy(): void;
    getCroppedCanvas(options?: CropperCanvas): HTMLCanvasElement;
    reset(): void;
    clear(): void;
  }

  export = Cropper;
}