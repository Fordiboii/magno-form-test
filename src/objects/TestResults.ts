import { Trial } from "../interfaces/trial";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";

export class TestResults {
    testType: string;

    correctAnswers: number;
    wrongAnswers: number;

    threshold: number;
    lowestCoherency: number = 100;

    trials: Array<Trial> = new Array<Trial>();
    reversalValues: Array<number> = new Array<number>();
    screenSettings: Array<string> = new Array<string>();
    motionSettings: Array<string> = new Array<string>();
    formSettings: Array<string> = new Array<string>();
    staircaseSettings: Array<string> = new Array<string>();
    inputSettings: Array<string> = new Array<string>();

    constructor(testType: "motion" | "form random" | "form fixed", trials: Array<Trial>, reversalPoints: Array<number>, correctAnswers: number, wrongAnswers: number) {
        this.testType = testType;
        this.trials = trials;

        this.correctAnswers = correctAnswers;
        this.wrongAnswers = wrongAnswers;

        this.threshold = Psychophysics.geometricMean(reversalPoints, Settings.STAIRCASE_REVERSALS_TO_CALCULATE_MEAN);

        for (let i = 0; i < reversalPoints.length; i++) {
            if (reversalPoints[i] < this.lowestCoherency) {
                this.lowestCoherency = reversalPoints[i];
            }
            this.reversalValues.push(reversalPoints[i]);
        }

        this.screenSettings.push("screen_w_mm: " + Settings.WINDOW_WIDTH_MM);
        this.screenSettings.push("screen_h_mm: " + Settings.WINDOW_HEIGHT_MM);
        this.screenSettings.push("screen_w_px: " + Settings.WINDOW_WIDTH_PX);
        this.screenSettings.push("screen_h_px: " + Settings.WINDOW_HEIGHT_PX);
        this.screenSettings.push("viewing_distance: " + Settings.SCREEN_VIEWING_DISTANCE_MM);
        this.screenSettings.push("patch_width: " + Settings.PATCH_WIDTH);
        this.screenSettings.push("patch_height: " + Settings.PATCH_HEIGHT);
        this.screenSettings.push("patch_gap: " + Settings.PATCH_GAP);

        if (testType == "motion") {
            this.motionSettings.push("dot_amount: " + Settings.DOT_TOTAL_AMOUNT);
            this.motionSettings.push("dot_radius: " + Settings.DOT_RADIUS);
            this.motionSettings.push("dot_spacing: " + Settings.DOT_SPACING);
            this.motionSettings.push("dot_velocity: " + Settings.DOT_VELOCITY);
            this.motionSettings.push("dot_coherency: " + Settings.DOT_COHERENCE_PERCENTAGE);
            this.motionSettings.push("dot_animation_time: " + Settings.DOT_MAX_ANIMATION_TIME);
            this.motionSettings.push("dot_max_life_time: " + Settings.DOT_MAX_ALIVE_TIME);
            this.motionSettings.push("dot_kill_percentage: " + Settings.DOT_KILL_PERCENTAGE);
            this.motionSettings.push("dot_horizontal_reversal_time: " + Settings.DOT_HORIZONTAL_REVERSAL_TIME);
            this.motionSettings.push("dot_random_direction_time: " + Settings.DOT_RANDOM_DIRECTION_TIME);
        } else {
            //TODO: add form settings
        }

        this.staircaseSettings.push("stair_correct_db: " + Settings.STAIRCASE_CORRECT_ANSWER_DB);
        this.staircaseSettings.push("stair_wrong_db: " + Settings.STAIRCASE_WRONG_ANSWER_DB);
        this.staircaseSettings.push("stair_max_tries: " + Settings.STAIRCASE_MAX_ATTEMPTS);
        this.staircaseSettings.push("stair_reversal_points: " + Settings.STAIRCASE_REVERSAL_POINTS);
        this.staircaseSettings.push("stair_mean_from_last: " + Settings.STAIRCASE_REVERSALS_TO_CALCULATE_MEAN);
    }
}