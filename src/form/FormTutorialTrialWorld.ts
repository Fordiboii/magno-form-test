import { Direction, WorldState } from '../utils/Enums';
import { Psychophysics } from '../utils/Psychophysics';
import { Settings } from '../utils/Settings';
import { Patch } from '../objects/Patch';
import {
    GLOW_FILTER_ANIMATION_SPEED,
    GLOW_FILTER_MAX_STRENGTH,
    MAX_FEEDBACK_TIME,
    PATCH_OUTLINE_COLOR,
    PATCH_OUTLINE_THICKNESS
} from '../utils/Constants';
import { TutorialTrialScreen } from '../screens/tutorialscreens/TutorialTrialScreen';
import { AbstractFormWorld } from './AbstractFormWorld';

export class FormTutorialTrialWorld extends AbstractFormWorld {
    private feedbackTimer: number = 0;
    private maxFeedbackTime: number = MAX_FEEDBACK_TIME;

    // reference to the screen object
    private tutorialTrialScreen: TutorialTrialScreen;

    constructor(tutorialTrialScreen: TutorialTrialScreen, isFixed: boolean) {
        super(isFixed);
        this.tutorialTrialScreen = tutorialTrialScreen;
        this.createPatches();
        this.calculateMaxMin();
        this.createPatchContainerMasks();
        this.createLineSegments();
    }

    /**
     * Updates dots.
     * @param delta time between each frame in ms
     */
    update = (delta: number): void => {
        if (this.currentState == WorldState.RUNNING) {
            this.running(delta);
        } else if (this.currentState == WorldState.PAUSED) {
            this.paused();
        } else if (this.currentState == WorldState.TRIAL_CORRECT) {
            this.feedback(delta);
        } else if (this.currentState == WorldState.TRIAL_INCORRECT) {
            this.feedback(delta);
        } else if (this.currentState == WorldState.FINISHED) {
            this.lineSegmentsLeftContainer.visible = false;
            this.lineSegmentsRightContainer.visible = false;
            this.patchLeft.interactive = false;
            this.patchRight.interactive = false;
            return;
        }
    }

    /**
     * Creates a new trial and changes the state from TRIAL_CORRECT or TRIAL_INCORRECT to RUNNING if the max feedback time is reached.
     * If the number of max steps is reached, it changes the state to FINISHED.
     * @param delta time between each frame in ms
     */
    feedback = (delta: number): void => {
        this.feedbackTimer += delta;
        // animate glow filters
        this.tutorialTrialScreen.glowFilter1.outerStrength += (this.tutorialTrialScreen.glowFilter1.outerStrength <= GLOW_FILTER_MAX_STRENGTH) ? GLOW_FILTER_ANIMATION_SPEED : 0;
        this.tutorialTrialScreen.glowFilter2.outerStrength += (this.tutorialTrialScreen.glowFilter2.outerStrength <= GLOW_FILTER_MAX_STRENGTH) ? GLOW_FILTER_ANIMATION_SPEED : 0;
        // hide dots
        this.lineSegmentsLeftContainer.visible = false;
        this.lineSegmentsRightContainer.visible = false;
        if (this.feedbackTimer >= this.maxFeedbackTime) {
            // reset glow filters
            this.tutorialTrialScreen.glowFilter1.outerStrength = 0;
            this.tutorialTrialScreen.glowFilter2.outerStrength = 0;
            // disable glow filters
            this.tutorialTrialScreen.glowFilter1.enabled = false;
            this.tutorialTrialScreen.glowFilter2.enabled = false;
            // check if test is finished
            if (this.tutorialTrialScreen.stepCounter == this.tutorialTrialScreen.maxSteps) {
                this.setState(WorldState.FINISHED);
                this.feedbackTimer = 0;
                return;
            }
            this.feedbackTimer = 0;
            this.reset();
            this.lineSegmentsLeftContainer.visible = true;
            this.lineSegmentsRightContainer.visible = true;
            this.setState(WorldState.RUNNING);
        }
    }

    reset = (): void => {
        this.runTime = 0;
        this.lineSegments = [];
        this.lineSegmentsLeftContainer.removeChildren();
        this.lineSegmentsRightContainer.removeChildren();
        this.createLineSegments();
    }

    /**
     * Creates the left and right patches for placing dots
     */
    createPatches = (): void => {
        this.patchGap = Psychophysics.getPatchGapInPixels() / 1.4;
        const patchWidth: number = Psychophysics.getPatchWidthInPixels() / 1.4;
        const patchHeight: number = Psychophysics.getPatchHeightInPixels() / 1.4;

        const screenXCenter: number = Settings.TRIAL_SCREEN_X;
        const screenYCenter: number = Settings.TRIAL_SCREEN_Y;

        const patchLeftX: number = screenXCenter - patchWidth - (this.patchGap / 2);
        const patchRightX: number = screenXCenter + (this.patchGap / 2);
        const patchY: number = screenYCenter - (patchHeight / 2);

        // create patches
        this.patchLeft = new Patch(patchLeftX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);
        this.patchRight = new Patch(patchRightX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);

        // add patches to container
        this.addChild(this.patchLeft, this.patchRight);
    }

    /**
     * Calculates and fetches parameters for creating line segments
     */
    createLineSegments(): void {
        let x: number;
        let y: number;

        const d: number = Psychophysics.visualAngleToPixels(
            Settings.FORM_DIAMETER_WB,
            Settings.SCREEN_VIEWING_DISTANCE_MM,
            Settings.WINDOW_WIDTH_PX,
            Settings.WINDOW_WIDTH_MM
        );

        this.patchMaxY = (this.patchLeft.y + this.patchLeft.height) - (d / 2);
        this.patchMinY = (this.patchLeft.y) + (d / 2);

        // randomly choose patch to contain concentric circles
        // get a random circle center if not fixed, otherwise it's the center of the patch
        this.coherentPatchSide = Math.round(Math.random()) ? Direction[0] : Direction[1];
        if (this.coherentPatchSide == "LEFT") {
            if (this.isFixed) {
                x = this.patchLeft.x + (this.patchLeft.width / 2);
                y = this.patchLeft.y + (this.patchLeft.height / 2);
            } else {
                this.leftMaxX = (this.patchLeft.x + this.patchLeft.width) - (d / 2);
                this.leftMinX = (this.patchLeft.x) + (d / 2);
                x = Math.random() * (this.leftMaxX - this.leftMinX) + this.leftMinX;
                y = Math.random() * (this.patchMaxY - this.patchMinY) + this.patchMinY;
            }

        } else {
            if (this.isFixed) {
                x = this.patchRight.x + (this.patchRight.width / 2);
                y = this.patchRight.y + (this.patchRight.height / 2);
            } else {
                this.rightMaxX = (this.patchRight.x + this.patchRight.width) - (d / 2);
                this.rightMinX = (this.patchRight.x) + (d / 2);
                x = Math.random() * (this.rightMaxX - this.rightMinX) + this.rightMinX;
                y = Math.random() * (this.patchMaxY - this.patchMinY) + this.patchMinY;
            }
        }

        const r: number = d / 2;

        if (!Settings.FORM_AUTO_MODE) {
            const circleGap: number = Psychophysics.visualAngleToPixels(
                Settings.FORM_CIRCLES_GAP,
                Settings.SCREEN_VIEWING_DISTANCE_MM,
                Settings.WINDOW_WIDTH_PX,
                Settings.WINDOW_WIDTH_MM
            );
            const lineGapOffset: number = Psychophysics.visualAngleToPixels(
                Settings.FORM_LINE_GAP,
                Settings.SCREEN_VIEWING_DISTANCE_MM,
                Settings.WINDOW_WIDTH_PX,
                Settings.WINDOW_WIDTH_MM
            );
            const lineLength: number = Psychophysics.visualAngleToPixels(
                Settings.FORM_LINE_LENGTH,
                Settings.SCREEN_VIEWING_DISTANCE_MM,
                Settings.WINDOW_WIDTH_PX,
                Settings.WINDOW_WIDTH_MM
            );
            this.manualMode(x, y, r, lineLength, lineGapOffset, circleGap);
        } else {
            this.autoMode(x, y, r);
        }
    }

    /**
     * Updates the coherency percentage by a decibel factor.
     * Decreases coherency if answer is correct, increases otherwise.
     * @param factor decibel factor used to increase or decrease coherency level.
     * @param isCorrectAnswer if the user chose the patch with coherent dots.
     */
    updateCoherency = (factor: number, isCorrectAnswer: boolean): void => {
        let temp: number = this.coherencePercent * factor;

        if (isCorrectAnswer) {
            if (factor > 1) {
                temp -= this.coherencePercent;
                this.coherencePercent -= temp;
            } else {
                this.coherencePercent = temp;
            }
        } else {
            if (temp > 100) {
                this.coherencePercent = 100;
            } else {
                this.coherencePercent = temp;
            }
        }
    }
}