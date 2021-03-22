import { DEFAULT_DPI, MM_PER_INCH } from "./Constants";

export abstract class Settings {
    // Screen settings
    public static SCREEN_VIEWING_DISTANCE_MM: number; // in millimeters.

    // Window settings
    public static WINDOW_WIDTH_PX: number; // in pixels.
    public static WINDOW_HEIGHT_PX: number; // in pixels.
    public static WINDOW_WIDTH_MM: number; // in millimeters.
    public static WINDOW_HEIGHT_MM: number; // in millimeters.

    // Patch settings
    public static PATCH_GAP: number; // in degrees.
    public static PATCH_WIDTH: number; // in degrees.
    public static PATCH_HEIGHT: number; // in degrees.

    // Dot settings
    public static DOT_HORIZONTAL_REVERSAL_TIME: number; // in milliseconds.
    public static DOT_RANDOM_DIRECTION_TIME: number; // in milliseconds.
    public static DOT_VELOCITY: number; // in pixels per millisecond. 
    public static DOT_RADIUS: number; // in pixels.
    public static DOT_SPACING: number; // in pixels.
    public static DOT_COHERENCE_PERCENTAGE: number; // in percentage.
    public static DOT_TOTAL_AMOUNT: number; // total number of dots to display.
    public static DOT_KILL_PERCENTAGE: number; // in percentage.
    public static DOT_MAX_ANIMATION_TIME: number; // in milliseconds.
    public static DOT_MAX_ALIVE_TIME: number; // in milliseconds.

    // Staircase settings
    public static STAIRCASE_CORRECT_ANSWER_DB: number; // in decibel.
    public static STAIRCASE_WRONG_ANSWER_DB: number; // in decibel.
    public static STAIRCASE_MAX_ATTEMPTS: number; // max number of attempts.
    public static STAIRCASE_REVERSAL_POINTS: number; // total number of reversal points.
    public static STAIRCASE_REVERSALS_TO_CALCULATE_MEAN: number; // number of reversal points to use when calculating the test score in geometric mean.

    // Game constants not to be included in results.

    // Button settings
    public static TEXT_BUTTON_WIDTH: number;
    public static TEXT_BUTTON_HEIGHT: number;

    public static CIRCLE_BUTTON_WIDTH: number;
    public static CIRCLE_BUTTON_TOP_BOTTOM_PADDING: number;

    public static NEXT_BACK_BUTTON_SPACING: number;

    // Header settings
    public static HEADER_WIDTH: number;
    public static HEADER_HEIGHT: number;
    public static HEADER_Y_POSITION: number;

    // Tutorial settings
    public static TUTORIAL_CONTENT_TOP_BOTTOM_PADDING: number;

    public static TRIAL_SCREEN_X: number;
    public static TRIAL_SCREEN_Y: number;

    public static load = (): void => {
        // Screen settings
        Settings.SCREEN_VIEWING_DISTANCE_MM = 300;

        // Window settings
        Settings.WINDOW_WIDTH_PX = window.innerWidth;
        Settings.WINDOW_HEIGHT_PX = window.innerHeight;
        Settings.WINDOW_WIDTH_MM = (window.innerWidth / (window.devicePixelRatio * DEFAULT_DPI)) * MM_PER_INCH;
        Settings.WINDOW_HEIGHT_MM = (window.innerHeight / (window.devicePixelRatio * DEFAULT_DPI)) * MM_PER_INCH;

        // Patch settings
        Settings.PATCH_GAP = 5;
        Settings.PATCH_WIDTH = 10;
        Settings.PATCH_HEIGHT = 14;

        // Dot settings
        Settings.DOT_HORIZONTAL_REVERSAL_TIME = 572;
        Settings.DOT_RANDOM_DIRECTION_TIME = 572;
        Settings.DOT_VELOCITY = 0.05;
        Settings.DOT_RADIUS = 1;
        Settings.DOT_SPACING = 1;
        Settings.DOT_COHERENCE_PERCENTAGE = 50;
        Settings.DOT_TOTAL_AMOUNT = 300;
        Settings.DOT_KILL_PERCENTAGE = 10;
        Settings.DOT_MAX_ANIMATION_TIME = 5000;
        Settings.DOT_MAX_ALIVE_TIME = 85;

        // Staircase settings
        Settings.STAIRCASE_CORRECT_ANSWER_DB = 1;
        Settings.STAIRCASE_WRONG_ANSWER_DB = 3;
        Settings.STAIRCASE_MAX_ATTEMPTS = 100;
        Settings.STAIRCASE_REVERSAL_POINTS = 10;
        Settings.STAIRCASE_REVERSALS_TO_CALCULATE_MEAN = 8;

        // Button settings
        Settings.TEXT_BUTTON_WIDTH = Settings.WINDOW_WIDTH_PX / 5;
        Settings.TEXT_BUTTON_HEIGHT = Settings.WINDOW_HEIGHT_PX / 15;

        Settings.CIRCLE_BUTTON_WIDTH = Settings.WINDOW_WIDTH_PX / 50;
        Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING = Settings.WINDOW_HEIGHT_PX / 16;

        Settings.NEXT_BACK_BUTTON_SPACING = Settings.WINDOW_WIDTH_PX / 9;

        // Header settings
        Settings.HEADER_WIDTH = Settings.WINDOW_WIDTH_PX / 1.5;
        Settings.HEADER_HEIGHT = Settings.WINDOW_HEIGHT_PX / 10;
        Settings.HEADER_Y_POSITION = Settings.WINDOW_HEIGHT_PX / 16;

        // Tutorial settings
        Settings.TUTORIAL_CONTENT_TOP_BOTTOM_PADDING = Settings.WINDOW_HEIGHT_PX / 30;

        Settings.TRIAL_SCREEN_X = Settings.WINDOW_WIDTH_PX / 2;
        Settings.TRIAL_SCREEN_Y = Settings.WINDOW_HEIGHT_PX / 2 - Settings.WINDOW_HEIGHT_PX / 10;
    }
}