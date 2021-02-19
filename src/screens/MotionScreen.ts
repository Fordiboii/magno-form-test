import { AbstractScreen } from "./AbstractScreen";
import { MotionWorld } from "../motion/MotionWorld";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import { KEY_BACKSPACE, KEY_LEFT, KEY_RIGHT } from "../utils/Constants";
import { WorldState } from "../utils/Enums";

export class MotionScreen extends AbstractScreen {
    constructor() {
        super();
        this.reversalPoints = Settings.STAIRCASE_REVERSAL_POINTS;
        this.maxSteps = Settings.STAIRCASE_MAX_ATTEMPTS;

        this.reversalCounter = 0;
        this.stepCounter = 0;
        this.correctAnswerCounter = 0;
        this.wrongAnswerCounter = 0;

        this.reversalValues = new Array<number>();

        this.correctAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_CORRECT_ANSWER_DB);
        this.wrongAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_WRONG_ANSWER_DB);

        this.setup();
    }

    setup = (): void => {
        // add event listeners
        window.addEventListener("keydown", this.keyDown);
        this.motionWorld.patchLeft.on("mousedown", (): void => this.mouseDown("LEFT"));
        this.motionWorld.patchRight.on("mousedown", (): void => this.mouseDown("RIGHT"));

        // add motion world to this container
        this.motionWorld = new MotionWorld();
        this.addChild(this.motionWorld);
    }

    update = (delta: number): void => {
        this.motionWorld.update(delta);
    }

    keyDown = (event: KeyboardEvent): void => {
        let currentStep: boolean = true;
        let reversalValue: number = this.motionWorld.getCoherencePercent();
        let coherentPatchSide: string = this.motionWorld.getCoherentPatchSide();

        if (event.code == KEY_LEFT) {
            if (coherentPatchSide == "LEFT") {
                this.motionWorld.updateCoherencyAndCounters(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;
            } else {
                this.motionWorld.updateCoherencyAndCounters(this.wrongAnswerFactor, false);
                this.wrongAnswerCounter++;
                currentStep = false;
            }
            this.motionWorld.reset();

            // increment step counter and check if the test is completed
            this.stepCounter++;
            if (this.stepCounter - 1 == this.maxSteps || this.reversalCounter == this.reversalPoints) {
                this.motionWorld.setState(WorldState.FINISHED);
            } else if (this.motionWorld.getState() == WorldState.PAUSED) {
                this.motionWorld.setState(WorldState.RUNNING);
            }
            // check if the current answer differs from the previous step. Save the value at reversal and increment counter
            if (this.stepCounter > 1 && this.prevStep != currentStep) {
                this.reversalValues.push(reversalValue);
                this.reversalCounter++;
            }
        } else if (event.code == KEY_RIGHT) {
            if (coherentPatchSide == "RIGHT") {
                this.motionWorld.updateCoherencyAndCounters(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;
            } else {
                this.motionWorld.updateCoherencyAndCounters(this.wrongAnswerFactor, false);
                this.wrongAnswerCounter++;
                currentStep = false;
            }
            this.motionWorld.reset();

            // increment step counter and check if the test is completed
            this.stepCounter++;
            if (this.stepCounter - 1 == this.maxSteps || this.reversalCounter == this.reversalPoints) {
                this.motionWorld.setState(WorldState.FINISHED);
            } else if (this.motionWorld.getState() == WorldState.PAUSED) {
                this.motionWorld.setState(WorldState.RUNNING);
            }
            // check if the current answer differs from the previous step. Save the value at reversal and increment counter
            if (this.stepCounter > 1 && this.prevStep != currentStep) {
                this.reversalValues.push(reversalValue);
                this.reversalCounter++;
            }
        } else if (event.code == KEY_BACKSPACE) {
            //TODO: Exit test if backspace is pressed
        }
    }

    mouseDown = (patch: string): void => {
        let currentStep: boolean = true;
        let reversalValue: number = this.motionWorld.getCoherencePercent();
        let coherentPatchSide: string = this.motionWorld.getCoherentPatchSide();

        if (patch == coherentPatchSide) {
            this.motionWorld.updateCoherencyAndCounters(this.correctAnswerFactor, true);
            this.correctAnswerCounter++;
        } else {
            this.motionWorld.updateCoherencyAndCounters(this.wrongAnswerFactor, false);
            this.wrongAnswerCounter++;
            currentStep = false;
        }
        this.motionWorld.reset();

        // increment step counter and check if the test is completed
        this.stepCounter++;
        if (this.stepCounter - 1 == this.maxSteps || this.reversalCounter == this.reversalPoints) {
            this.motionWorld.setState(WorldState.FINISHED);
        } else if (this.motionWorld.getState() == WorldState.PAUSED) {
            this.motionWorld.setState(WorldState.RUNNING);
        }
        // check if the current answer differs from the previous step. Save the value at reversal and increment counter
        if (this.stepCounter > 1 && this.prevStep != currentStep) {
            this.reversalValues.push(reversalValue);
            this.reversalCounter++;
        }
    }
}