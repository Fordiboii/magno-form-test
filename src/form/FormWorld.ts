import { Patch } from "../objects/Patch";
import { TestScreen } from "../screens/TestScreen";
import { GLOW_FILTER_ANIMATION_SPEED, GLOW_FILTER_MAX_STRENGTH, MAX_FEEDBACK_TIME, PATCH_OUTLINE_COLOR, PATCH_OUTLINE_THICKNESS } from "../utils/Constants";
import { WorldState } from "../utils/Enums";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import { AbstractFormWorld } from "./AbstractFormWorld";

export class FormWorld extends AbstractFormWorld {
    // reference to motion screen
    private motionScreen: TestScreen;

    private feedbackTimer: number = 0;
    private maxFeedbackTime: number = MAX_FEEDBACK_TIME;

    constructor(motionScreen: TestScreen, isFixed: boolean) {
        super(isFixed);
        this.motionScreen = motionScreen;
        this.createPatches();
        this.calculateMaxMin();
        this.createPatchContainerMasks();
        this.createLineSegments();
    }

    /**
     * Creates the left and right patches for placing line segments
     */
    createPatches = (): void => {
        this.patchGap = Psychophysics.getPatchGapInPixels();
        const patchWidth: number = Psychophysics.getPatchWidthInPixels();
        const patchHeight: number = Psychophysics.getPatchHeightInPixels();

        const screenXCenter: number = Settings.WINDOW_WIDTH_PX / 2;
        const screenYCenter: number = Settings.WINDOW_HEIGHT_PX / 2;

        const patchLeftX: number = screenXCenter - patchWidth - (this.patchGap / 2);
        const patchRightX: number = screenXCenter + (this.patchGap / 2);
        const patchY: number = screenYCenter - (patchHeight / 2);

        // create patches
        this.patchLeft = new Patch(patchLeftX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);
        this.patchRight = new Patch(patchRightX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);

        // add patches to container
        this.addChild(this.patchLeft, this.patchRight);
    }

    update = (delta: number): void => {
        if (this.currentState == WorldState.FINISHED) {
            return;
        } else if (this.currentState == WorldState.PAUSED) {
            this.paused();
        } else if (this.currentState == WorldState.PATCH_SELECTED) {
            this.feedback(delta);
        } else if (this.currentState == WorldState.RUNNING) {
            this.running(delta);
        }
    }

    /**
     * Creates a new trial and changes the state from PATCH_SELECTED to RUNNING if the max feedback time is reached.
     * If the number of max steps is reached, it changes the state to FINISHED.
     * @param delta time between each frame in ms
     */
    feedback = (delta: number): void => {
        this.feedbackTimer += delta;
        // animate glow filters
        this.motionScreen.glowFilter1.outerStrength += (this.motionScreen.glowFilter1.outerStrength <= GLOW_FILTER_MAX_STRENGTH) ? GLOW_FILTER_ANIMATION_SPEED : 0;
        this.motionScreen.glowFilter2.outerStrength += (this.motionScreen.glowFilter2.outerStrength <= GLOW_FILTER_MAX_STRENGTH) ? GLOW_FILTER_ANIMATION_SPEED : 0;
        // hide lines
        this.lineSegmentsLeftContainer.visible = false;
        this.lineSegmentsRightContainer.visible = false;
        if (this.feedbackTimer >= this.maxFeedbackTime / 2.5) {
            // reset glow filters
            this.motionScreen.glowFilter1.outerStrength = 0;
            this.motionScreen.glowFilter2.outerStrength = 0;
            // disable glow filters
            this.motionScreen.glowFilter1.enabled = false;
            this.motionScreen.glowFilter2.enabled = false;
            // check if test is finished
            if (this.motionScreen.stepCounter == this.motionScreen.maxSteps || this.motionScreen.reversalCounter == this.motionScreen.reversalPoints) {
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