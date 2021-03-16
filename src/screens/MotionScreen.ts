import * as PIXI from 'pixi.js';
import { AbstractScreen } from "./AbstractScreen";
import { MotionWorld } from "../motion/MotionWorld";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import { BACK_BUTTON_HOVER_COLOR, BACK_BUTTON_SCALING_FACTOR, BACK_BUTTON_X, BACK_BUTTON_Y, BUTTON_TEXT_COLOR, FONT_SIZE, KEY_BACKSPACE, KEY_LEFT, KEY_RIGHT, START_BUTTON_COLOR, START_BUTTON_HOVER_COLOR } from "../utils/Constants";
import { WorldState } from "../utils/Enums";
import { TextButton } from "../objects/buttons/TextButton";
import { SpriteButton } from "../objects/buttons/SpriteButton";

export class MotionScreen extends AbstractScreen {
    patchLeftLabel: PIXI.BitmapText;
    patchRightLabel: PIXI.BitmapText;
    startButton: TextButton;
    backButton: SpriteButton;

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

        // create start button and add to container
        this.startButton =
            new TextButton(
                Settings.WINDOW_WIDTH_PX / 2,
                Settings.WINDOW_HEIGHT_PX / 2,
                Settings.START_BUTTON_WIDTH,
                Settings.START_BUTTON_HEIGHT,
                START_BUTTON_COLOR,
                "START TEST",
                BUTTON_TEXT_COLOR,
                START_BUTTON_HOVER_COLOR
            );
        this.addChild(this.startButton);

        // create back button and add to container
        const backButtonTexture = PIXI.Loader.shared.resources['backArrow'].texture;
        this.backButton = new SpriteButton(BACK_BUTTON_X, BACK_BUTTON_Y, BACK_BUTTON_SCALING_FACTOR, backButtonTexture, BACK_BUTTON_HOVER_COLOR);
        this.addChild(this.backButton)

        // add event listeners
        window.addEventListener("keydown", this.keyDownHandler);

        this.motionWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.motionWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.motionWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.motionWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        this.startButton.on("click", (): void => this.startButtonClickHandler());
        this.startButton.on("touchend", (): void => this.startButtonTouchendHandler());

        this.backButton.on("click", (): void => this.backButtonClickHandler());
        this.backButton.on("touchend", (): void => this.backButtonTouchendHandler());
    }

    update = (delta: number): void => {
        this.motionWorld.update(delta);
    }

    keyDownHandler = (event: KeyboardEvent): void => {
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

            this.prevStep = currentStep;
        } else if (event.code == KEY_BACKSPACE) {
            //TODO: Exit test if backspace is pressed
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

    startButtonClickHandler = (): void => {
        this.startButton.visible = false;
        this.motionWorld.patchLeft.interactive = true;
        this.motionWorld.patchRight.interactive = true;
        this.motionWorld.dotsLeftContainer.visible = true;
        this.motionWorld.dotsRightContainer.visible = true;
        this.motionWorld.setState(WorldState.RUNNING);
    }

    startButtonTouchendHandler = (): void => {
        if (this.startButton.isMouseDown) {
            this.startButton.visible = false;
            this.motionWorld.patchLeft.interactive = true;
            this.motionWorld.patchRight.interactive = true;
            this.motionWorld.dotsLeftContainer.visible = true;
            this.motionWorld.dotsRightContainer.visible = true;
            this.motionWorld.setState(WorldState.RUNNING);
        }
        this.startButton.isMouseDown = false;
    }

    backButtonClickHandler = (): void => {
        console.log("yo, you just clicked it yo")
    }

    backButtonTouchendHandler = (): void => {
        if (this.backButton.isMouseDown) {
            console.log("yo, touchy touchy feely feely, this button just got touched yall")
        }
        this.backButton.isMouseDown = false;
    }
}