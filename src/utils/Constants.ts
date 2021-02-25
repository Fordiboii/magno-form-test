// Screen constants

export const DEVICE_PIXEL_RATIO: number = window.devicePixelRatio; // The ratio of one CSS-pixel to one physical pixel. Value of 1 means DPI = DEFAULT_DPI.
export const DEFAULT_DPI: number = 96; // Default DPI for screens.
export const MM_PER_INCH: number = 25.4;

// Patch constants

export const PATCH_OUTLINE_THICKNESS: number = 1;
export const PATCH_OUTLINE_COLOR: number = 0xFFFFFF;

// Keyboard constants

export const KEY_LEFT: string = "ArrowLeft";
export const KEY_RIGHT: string = "ArrowRight";
export const KEY_BACKSPACE: string = "Backspace";

// Font/text constants

export const PATCH_LABEL_COLOR: number = 0xFFFFFF;
export const FONT_SIZE: number = window.innerWidth * 20 / 1280; //TODO: calculate once