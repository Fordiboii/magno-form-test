import { DEFAULT_DPI, MM_PER_INCH } from "./Constants";

export abstract class Settings {
    // Screen settings
    public static SCREEN_VIEWING_DISTANCE_MM: number = 300; // in millimeters.

    // Window settings
    public static WINDOW_WIDTH_PX: number = window.innerWidth; // in pixels.
    public static WINDOW_HEIGHT_PX: number = window.innerHeight; // in pixels.
    public static WINDOW_WIDTH_MM: number = (window.innerWidth / (window.devicePixelRatio * DEFAULT_DPI)) * MM_PER_INCH; // in millimeters.
    public static WINDOW_HEIGHT_MM: number = (window.innerHeight / (window.devicePixelRatio * DEFAULT_DPI) * MM_PER_INCH); // in millimeters.

    // Patch settings
    public static PATCH_GAP: number = 5; // in degrees.
    public static PATCH_WIDTH: number = 10; // in degrees.
    public static PATCH_HEIGHT: number = 14; // in degrees.

    // Dot settings
    public static DOT_HORIZONTAL_REVERSAL_TIME = 572; // in milliseconds.
    public static DOT_RANDOM_DIRECTION_TIME = 572; // in milliseconds.
    public static DOT_VELOCITY = 0.05; // in pixels per millisecond. 
    public static DOT_RADIUS = 1; // in pixels.
    public static DOT_SPACING = 1; // in pixels.
    public static DOT_COHERENCE_PERCENTAGE = 50; // in percentage.
    public static DOT_TOTAL_AMOUNT = 300; // number of dots to display.
    public static DOT_KILL_PERCENTAGE = 10; // in percentage.
    public static DOT_MAX_ANIMATION_TIME = 5000; // in milliseconds.
    public static DOT_MAX_ALIVE_TIME = 85; // in milliseconds.
}