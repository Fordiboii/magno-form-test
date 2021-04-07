import * as PIXI from 'pixi.js';
import { MotionWorld } from "../motion/MotionWorld";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import {
    SPRITE_BUTTON_HOVER_COLOR,
    TEXT_COLOR,
    FONT_SIZE,
    KEY_BACKSPACE,
    KEY_LEFT,
    KEY_RIGHT,
    START_BUTTON_COLOR,
    START_BUTTON_HOVER_COLOR,
    START_BUTTON_STROKE_COLOR,
    PATCH_LABEL_COLOR
} from "../utils/Constants";
import { WorldState } from "../utils/Enums";
import { TextButton } from "../objects/buttons/TextButton";
import { SpriteButton } from "../objects/buttons/SpriteButton";
import { GameApp } from '../app';

export class MotionScreen extends PIXI.Container {
    private gameApp: GameApp;

    private motionWorld: MotionWorld;

    private reversalPoints: number;
    private maxSteps: number;

    private prevStep: boolean;

    private reversalCounter: number;
    private stepCounter: number;
    private correctAnswerCounter: number;
    private wrongAnswerCounter: number;

    private reversalValues: Array<number>;

    private correctAnswerFactor: number;
    private wrongAnswerFactor: number;

    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;
    private startButton: TextButton;
    private backButton: SpriteButton;

    constructor(gameApp: GameApp) {
        super();

        // reference to game object
        this.gameApp = gameApp;

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
        this.patchLeftLabel = new PIXI.Text("1", { fontName: "Helvetica-Normal", fontSize: FONT_SIZE * 1.3, fill: PATCH_LABEL_COLOR });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.motionWorld.patchLeft.x + this.motionWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.motionWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text("2", { fontName: "Helvetica-Normal", fontSize: FONT_SIZE * 1.3, fill: PATCH_LABEL_COLOR });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.motionWorld.patchRight.x + this.motionWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.motionWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // create start button and add to container
        this.startButton =
            new TextButton(
                Settings.WINDOW_WIDTH_PX / 2,
                Settings.WINDOW_HEIGHT_PX / 2,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                START_BUTTON_COLOR,
                START_BUTTON_STROKE_COLOR,
                "START TEST",
                TEXT_COLOR,
                START_BUTTON_HOVER_COLOR
            );
        this.addChild(this.startButton);

        // create back button and add to container
        const backButtonTexture = PIXI.Loader.shared.resources['backArrow'].texture;
        this.backButton =
            new SpriteButton(
                Settings.WINDOW_WIDTH_PX / 32,
                Settings.WINDOW_HEIGHT_PX / 32,
                Settings.WINDOW_WIDTH_PX / 40,
                Settings.WINDOW_WIDTH_PX / 40,
                backButtonTexture,
                [0.5, 0],
                SPRITE_BUTTON_HOVER_COLOR
            );
        this.addChild(this.backButton);
    }

    update = (delta: number): void => {
        if (this.motionWorld.getState() == WorldState.FINISHED) {
            // calculate threshold score
            const threshold: number = Psychophysics.geometricMean(this.reversalValues, Settings.STAIRCASE_REVERSALS_TO_CALCULATE_MEAN);
            this.gameApp.setThreshold(threshold);
            // change screen
            this.gameApp.changeScreen("resultsScreen");
        } else {
            this.motionWorld.update(delta);
        }
    }

    keyLeftRightDownHandler = (event: KeyboardEvent): void => {
        if (event.repeat) return

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

            // increment step counter and check if the test is completed
            this.stepCounter++;

            if (this.stepCounter - 1 == this.maxSteps || this.reversalCounter == this.reversalPoints) {
                this.motionWorld.setState(WorldState.FINISHED);
            } else if (this.motionWorld.getState() == WorldState.PAUSED) {
                this.motionWorld.setState(WorldState.RUNNING);
                this.motionWorld.reset();
            } else {
                this.motionWorld.reset();
            }
            // check if the current answer differs from the previous step. Save the value at reversal and increment counter
            if (this.stepCounter > 1 && this.prevStep != currentStep) {
                this.reversalValues.push(reversalValue);
                this.reversalCounter++;
            }

            this.prevStep = currentStep;
        } else if (event.code == KEY_RIGHT) {
            if (coherentPatchSide == "RIGHT") {
                this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;
            } else {
                this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
                this.wrongAnswerCounter++;
                currentStep = false;
            }

            // increment step counter and check if the test is completed
            this.stepCounter++;

            if (this.stepCounter - 1 == this.maxSteps || this.reversalCounter == this.reversalPoints) {
                this.motionWorld.setState(WorldState.FINISHED);
            } else if (this.motionWorld.getState() == WorldState.PAUSED) {
                this.motionWorld.setState(WorldState.RUNNING);
                this.motionWorld.reset();
            } else {
                this.motionWorld.reset();
            }
            // check if the current answer differs from the previous step. Save the value at reversal and increment counter
            if (this.stepCounter > 1 && this.prevStep != currentStep) {
                this.reversalValues.push(reversalValue);
                this.reversalCounter++;
            }

            this.prevStep = currentStep;
        }
    }

    keyBackspaceDownHandler = (event: KeyboardEvent): void => {
        if (event.repeat) return
        if (event.code == KEY_BACKSPACE) {
            this.gameApp.changeScreen("tutorialTrialScreen");
        }
    }

    mouseDownHandler = (patch: string): void => {
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

        this.prevStep = currentStep;
    }

    resetMotionWorld = (): void => {
        this.motionWorld = new MotionWorld();
    }

    startButtonClickHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyLeftRightDownHandler, true);
        this.motionWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.motionWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.motionWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.motionWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        // hide start button, make patches interactive and set state to running
        this.startButton.visible = false;
        this.motionWorld.patchLeft.interactive = true;
        this.motionWorld.patchRight.interactive = true;
        this.motionWorld.dotsLeftContainer.visible = true;
        this.motionWorld.dotsRightContainer.visible = true;
        this.motionWorld.setState(WorldState.RUNNING);
    }

    startButtonTouchendHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyLeftRightDownHandler, true);
        this.motionWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.motionWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.motionWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.motionWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        // hide start button, make patches interactive and set state to running
        this.startButton.visible = false;
        this.motionWorld.patchLeft.interactive = true;
        this.motionWorld.patchRight.interactive = true;
        this.motionWorld.dotsLeftContainer.visible = true;
        this.motionWorld.dotsRightContainer.visible = true;
        this.motionWorld.setState(WorldState.RUNNING);

    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    backButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    /**
     * Adds all custom event listeners.
     */
    addEventListeners = (): void => {
        window.addEventListener("keydown", this.keyBackspaceDownHandler, true);
        this.startButton.on("click", this.startButtonClickHandler);
        this.startButton.on("touchend", this.startButtonTouchendHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonTouchendHandler);
    }

    /**
     * Removes all custom event listeners.
     */
    removeEventListeners = (): void => {
        window.removeEventListener("keydown", this.keyBackspaceDownHandler, true);
        window.removeEventListener("keydown", this.keyLeftRightDownHandler, true);
        this.backButton.removeAllListeners();
        this.startButton.removeAllListeners();
        this.motionWorld.patchLeft.removeAllListeners();
        this.motionWorld.patchRight.removeAllListeners();
    }
}