import { DEFAULT_DPI, MM_PER_INCH } from "./Constants";

export abstract class Settings {
    // in millimeters.
    public static SCREEN_VIEWING_DISTANCE_MM: number = 300;

    // in pixels.
    public static WINDOW_WIDTH_PX: number = window.innerWidth;
    // in pixels.
    public static WINDOW_HEIGHT_PX: number = window.innerHeight;
    // in millimeters.
    public static WINDOW_WIDTH_MM: number = (window.innerWidth / (window.devicePixelRatio * DEFAULT_DPI)) * MM_PER_INCH;
    // in millimeters.
    public static WINDOW_HEIGHT_MM: number = (window.innerHeight / (window.devicePixelRatio * DEFAULT_DPI) * MM_PER_INCH);

    // in degrees.
    public static PATCH_GAP: number = 5;
    // in degrees.
    public static PATCH_WIDTH: number = 10;
    // in degrees.
    public static PATCH_HEIGHT: number = 14;
}