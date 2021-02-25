import * as PIXI from 'pixi.js';
import { AbstractScreen } from "./AbstractScreen";
import { MotionWorld } from "../motion/MotionWorld";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import { FONT_SIZE, KEY_BACKSPACE, KEY_LEFT, KEY_RIGHT, PATCH_LABEL_COLOR } from "../utils/Constants";
import { WorldState } from "../utils/Enums";

export class MotionScreen extends AbstractScreen {
    patchLeftLabel: PIXI.BitmapText;
    patchRightLabel: PIXI.BitmapText;

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
        // create motion world and add to container
        this.motionWorld = new MotionWorld();
        this.addChild(this.motionWorld);

        // create patch labels and add to container
        this.patchLeftLabel = new PIXI.BitmapText("1", { fontName: "Helvetica-Normal", fontSize: FONT_SIZE * 1.3 })
        this.patchLeftLabel.anchor = 0.5;
        this.patchLeftLabel.x = this.motionWorld.patchLeft.x + this.motionWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.motionWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.BitmapText("2", { fontName: "Helvetica-Normal", fontSize: FONT_SIZE * 1.3 })
        this.patchRightLabel.anchor = 0.5;
        this.patchRightLabel.x = this.motionWorld.patchRight.x + this.motionWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.motionWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add event listeners
        window.addEventListener("keydown", this.keyDown);
        this.motionWorld.patchLeft.on("mousedown", (): void => this.mouseDown("LEFT"));
        this.motionWorld.patchRight.on("mousedown", (): void => this.mouseDown("RIGHT"));
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
                this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;
            } else {
                this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
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
                this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;
            } else {
                this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
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
            this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
            this.correctAnswerCounter++;
        } else {
            this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
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