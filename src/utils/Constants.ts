// Game constants
export const SIMULATION_TIMESTEP: number = 1000 / 60; // Simulate test at 60 FPS. Means that each update will happen every 1000/60 milliseconds.

// Screen constants

export const DEVICE_PIXEL_RATIO: number = window.devicePixelRatio; // The ratio of one CSS-pixel to one physical pixel. Value of 1 means DPI = DEFAULT_DPI.
export const DEFAULT_DPI: number = 96; // Default DPI for screens.
export const MM_PER_INCH: number = 25.4;

// Patch constants

export const PATCH_OUTLINE_THICKNESS: number = 1;
export const PATCH_OUTLINE_COLOR: number = 0xFFFFFF;
export const DOT_SPAWN_SEPARATION_DISTANCE_MULTIPLIER: number = 1.5; // multiplier to increase initial dot spacing in order to reduce grid points.

// Keyboard constants

export const KEY_LEFT: string = "ArrowLeft";
export const KEY_RIGHT: string = "ArrowRight";
export const KEY_BACKSPACE: string = "Backspace";

// Font/text constants

export const PATCH_LABEL_COLOR: number = 0xFFFFFF;
export const FONT_SIZE: number = window.innerWidth * 20 / 1280; //TODO: calculate once

// Button constants

export const BUTTON_TEXT_COLOR: number = 0x262626;
export const SPRITE_BUTTON_DISABLE_TINT_COLOR: number = 0xFFFFFF;
export const SPRITE_BUTTON_CLICKED_TINT: number = 0x262626;

export const START_BUTTON_COLOR: number = 0x73C61A;
export const START_BUTTON_HOVER_COLOR: number = 0x9BD855;

export const BACK_BUTTON_X: number = 50;
export const BACK_BUTTON_Y: number = 50;
export const BACK_BUTTON_SCALING_FACTOR: number = 1 / 15;
export const BACK_BUTTON_HOVER_COLOR: number = 0xCCCCCC;