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
export const TEXT_COLOR: number = 0x262626;
export const FONT_SIZE: number = window.innerWidth * 20 / 1280; //TODO: calculate once

// Button constants

export const BUTTON_DISABLED_COLOR: number = 0xCAC9C9;

export const SPRITE_BUTTON_DISABLE_TINT_COLOR: number = 0xFFFFFF;
export const SPRITE_BUTTON_CLICKED_TINT: number = 0xBBBBBB;
export const SPRITE_BUTTON_HOVER_COLOR: number = 0xCCCCCC;

export const TEXT_BUTTON_ROUNDING_RADIUS: number = 8;
export const TEXT_BUTTON_DROP_SHADOW_ANGLE: number = 90; // in degrees
export const TEXT_BUTTON_DROP_SHADOW_DISTANCE: number = 2;
export const TEXT_BUTTON_DROP_SHADOW_BLUR: number = 1;
export const TEXT_BUTTON_DROP_SHADOW_COLOR: number = 0x999999;

export const START_BUTTON_COLOR: number = 0x73C61A;
export const START_BUTTON_STROKE_COLOR: number = 0x51A40A;
export const START_BUTTON_HOVER_COLOR: number = 0x9BD855;

export const NEXT_BUTTON_COLOR: number = 0x93CEEF;
export const NEXT_BUTTON_STROKE_COLOR: number = 0x82BDDE;
export const NEXT_BUTTON_HOVER_COLOR: number = 0xBEE2F4;

// TUTORIAL CONSTANTS

export const BLUE_TEXT_COLOR: number = 0x93CEEF;
export const GREEN_TEXT_COLOR: number = 0x7AB642;
export const RED_TEXT_COLOR: number = 0xE24040;
export const BACKGROUND_COLOR: number = 0xEAF5FC;
export const MAX_FEEDBACK_TIME: number = 2000; // in milliseconds