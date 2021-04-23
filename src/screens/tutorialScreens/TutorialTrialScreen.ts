import * as PIXI from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import { GameApp } from '../../app';
import { MotionTutorialTrialWorld } from '../../motion/MotionTutorialTrialWorld';
import { TextButton } from '../../objects/buttons/TextButton';
import {
    BLUE_TEXT_COLOR,
    GLOW_FILTER_DISTANCE,
    GLOW_FILTER_QUALITY,
    GREEN_TEXT_COLOR,
    KEY_LEFT,
    KEY_RIGHT,
    PATCH_LABEL_COLOR,
    RED_TEXT_COLOR,
    START_BUTTON_COLOR,
    START_BUTTON_HOVER_COLOR,
    START_BUTTON_STROKE_COLOR,
    TEXT_COLOR
} from '../../utils/Constants';
import { WorldState } from '../../utils/Enums';
import { Psychophysics } from '../../utils/Psychophysics';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialTrialScreen extends TutorialScreen {
    public maxSteps: number;
    public stepCounter: number;
    private correctAnswerFactor: number;
    private wrongAnswerFactor: number;

    private motionTutorialTrialWorld: MotionTutorialTrialWorld;
    private motionTutorialTrialWorldContainer: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

    private startButton: TextButton;

    private trialTextContainer: PIXI.Container = new PIXI.Container();
    private trialTextBackgroundColor: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;
    private trialCorrectText: PIXI.Text;
    private trialIncorrectText: PIXI.Text;
    private trialFinishedText: PIXI.Text;
    private pauseText: PIXI.Text;

    // any type because pixi-filters isn't working properly with typescript
    public glowFilter1: any;
    public glowFilter2: any;

    constructor(gameApp: GameApp) {
        super(gameApp);

        this.maxSteps = Settings.TRIAL_MAX_STEPS;
        this.stepCounter = 0;
        this.correctAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_CORRECT_ANSWER_DB);
        this.wrongAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_WRONG_ANSWER_DB);

        // set header text
        this.header.text = "MOTION TEST TUTORIAL";

        // add motion tutorial world background
        this.motionTutorialTrialWorldContainer.tint = 0;
        this.motionTutorialTrialWorldContainer.anchor.set(0.5, 0)
        this.motionTutorialTrialWorldContainer.x = this.contentX;
        this.motionTutorialTrialWorldContainer.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.motionTutorialTrialWorldContainer.width = Settings.WINDOW_WIDTH_PX;
        this.motionTutorialTrialWorldContainer.height = Settings.WINDOW_HEIGHT_PX / 2.2;
        this.addChild(this.motionTutorialTrialWorldContainer);

        // add motion tutorial world
        this.motionTutorialTrialWorld = new MotionTutorialTrialWorld(this);
        this.addChild(this.motionTutorialTrialWorld);

        // create glow filters for animating patch click
        this.glowFilter1 = new GlowFilter({
            distance: GLOW_FILTER_DISTANCE,
            outerStrength: 0,
            quality: GLOW_FILTER_QUALITY
        });
        this.glowFilter2 = new GlowFilter({
            distance: GLOW_FILTER_DISTANCE,
            outerStrength: 0,
            quality: GLOW_FILTER_QUALITY
        });
        this.glowFilter1.enabled = false;
        this.glowFilter2.enabled = false;
        this.motionTutorialTrialWorld.patchLeft.filters = [this.glowFilter1];
        this.motionTutorialTrialWorld.patchRight.filters = [this.glowFilter2];

        // add patch labels
        this.patchLeftLabel = new PIXI.Text("1", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.motionTutorialTrialWorld.patchLeft.x + this.motionTutorialTrialWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.motionTutorialTrialWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text("2", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.motionTutorialTrialWorld.patchRight.x + this.motionTutorialTrialWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.motionTutorialTrialWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add text shown when animation is paused
        this.pauseText = new PIXI.Text("Select a box", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 0.9,
            fill: PATCH_LABEL_COLOR
        });
        this.pauseText.anchor.set(0.5, 0);
        this.pauseText.roundPixels = true;
        this.pauseText.x = Settings.WINDOW_WIDTH_PX / 2;
        this.pauseText.y = Settings.TRIAL_SCREEN_Y + this.motionTutorialTrialWorld.patchLeft.height / 1.5;
        this.pauseText.visible = false;
        this.addChild(this.pauseText);

        // add start button
        this.startButton =
            new TextButton(
                Settings.WINDOW_WIDTH_PX / 2,
                Settings.TRIAL_SCREEN_Y,
                Settings.TEXT_BUTTON_WIDTH * 1.1,
                Settings.TEXT_BUTTON_HEIGHT,
                START_BUTTON_COLOR,
                START_BUTTON_STROKE_COLOR,
                "START TUTORIAL TRIAL",
                TEXT_COLOR,
                START_BUTTON_HOVER_COLOR,
                false,
                undefined,
                undefined,
                Settings.FONT_SIZE * 0.8
            );
        this.addChild(this.startButton);

        // add tutorial text
        this.tutorialText.text =
            "Try it out a few times! Keep in mind that you will not receive feedback on whether or not you have chosen the correct box during the actual test."
            + " When you are ready, click NEXT.";

        // add trial texts
        const TRIAL_TEXT_X: number = Settings.WINDOW_WIDTH_PX / 2;
        const TRIAL_TEXT_Y: number = Settings.TRIAL_SCREEN_Y + this.motionTutorialTrialWorld.patchLeft.height / 1.1;

        this.trialCorrectText = new PIXI.Text("Correct",
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: GREEN_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialCorrectText.roundPixels = true;
        this.trialCorrectText.anchor.set(0.5, 1);
        this.trialCorrectText.x = TRIAL_TEXT_X;
        this.trialCorrectText.y = TRIAL_TEXT_Y;

        this.trialIncorrectText = new PIXI.Text("Incorrect",
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: RED_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialIncorrectText.roundPixels = true;
        this.trialIncorrectText.anchor.set(0.5, 1);
        this.trialIncorrectText.x = TRIAL_TEXT_X;
        this.trialIncorrectText.y = TRIAL_TEXT_Y;
        // this.trialIncorrectText.height = 10;

        this.trialFinishedText = new PIXI.Text("Click NEXT to proceed",
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: BLUE_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialFinishedText.roundPixels = true;
        this.trialFinishedText.anchor.set(0.5, 1);
        this.trialFinishedText.x = TRIAL_TEXT_X;
        this.trialFinishedText.y = TRIAL_TEXT_Y;

        this.trialCorrectText.visible = false;
        this.trialIncorrectText.visible = false;
        this.trialFinishedText.visible = false;

        this.trialTextBackgroundColor.anchor.set(0.5);
        this.trialTextBackgroundColor.tint = 0;
        this.trialTextContainer.visible = false;
        this.trialTextContainer.addChild(this.trialTextBackgroundColor, this.trialCorrectText, this.trialIncorrectText, this.trialFinishedText);
        this.addChild(this.trialTextContainer)

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[3].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        if (this.motionTutorialTrialWorld.getState() == WorldState.TRIAL_CORRECT) {
            this.trialCorrectText.visible = true;

            this.trialTextBackgroundColor.x = this.trialCorrectText.x;
            this.trialTextBackgroundColor.y = this.trialCorrectText.y;
            this.trialTextBackgroundColor.width = this.trialCorrectText.width;
            this.trialTextBackgroundColor.height = this.trialCorrectText.height * 1.5;
            this.trialTextContainer.visible = true;

            this.pauseText.visible = false;
        } else if (this.motionTutorialTrialWorld.getState() == WorldState.TRIAL_INCORRECT) {
            this.trialIncorrectText.visible = true;

            this.trialTextBackgroundColor.x = this.trialIncorrectText.x;
            this.trialTextBackgroundColor.y = this.trialIncorrectText.y;
            this.trialTextBackgroundColor.width = this.trialIncorrectText.width;
            this.trialTextBackgroundColor.height = this.trialIncorrectText.height * 1.5;
            this.trialTextContainer.visible = true;

            this.pauseText.visible = false;
        } else if (this.motionTutorialTrialWorld.getState() == WorldState.FINISHED) {
            this.trialCorrectText.visible = false;
            this.trialIncorrectText.visible = false;
            this.trialFinishedText.visible = true;

            this.trialTextBackgroundColor.x = this.trialFinishedText.x;
            this.trialTextBackgroundColor.y = this.trialFinishedText.y;
            this.trialTextBackgroundColor.width = this.trialFinishedText.width;
            this.trialTextBackgroundColor.height = this.trialFinishedText.height * 1.5;
            this.trialTextContainer.visible = true;

            this.pauseText.visible = false;
        } else if (this.motionTutorialTrialWorld.getState() == WorldState.PAUSED && !this.startButton.visible) {
            this.pauseText.visible = true;
        } else {
            this.trialCorrectText.visible = false;
            this.trialIncorrectText.visible = false;
            this.trialFinishedText.visible = false;
            this.trialTextContainer.visible = false;
        }
        this.motionTutorialTrialWorld.update(delta);
    }

    keyDownHandler = (event: KeyboardEvent): void => {
        if (event.repeat) return

        const currentState: WorldState = this.motionTutorialTrialWorld.getState();
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {

            let coherentPatchSide: string = this.motionTutorialTrialWorld.getCoherentPatchSide();

            if (event.code == KEY_LEFT) {
                // enable glow filter on the selected patch
                this.glowFilter1.enabled = true;

                // update coherency
                if (coherentPatchSide == "LEFT") {
                    this.motionTutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
                } else {
                    this.motionTutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
                }

                this.stepCounter++;
            } else if (event.code == KEY_RIGHT) {
                // enable glow filter on the selected patch
                this.glowFilter2.enabled = true;

                // update coherency and state
                if (coherentPatchSide == "RIGHT") {
                    this.motionTutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
                } else {
                    this.motionTutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
                }

                this.stepCounter++;
            }
        }
    }

    mouseDownHandler = (patch: string): void => {
        const currentState: WorldState = this.motionTutorialTrialWorld.getState();
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
            let coherentPatchSide: string = this.motionTutorialTrialWorld.getCoherentPatchSide();

            // enable glow filter on the selected patch
            if (patch == "LEFT") {
                this.glowFilter1.enabled = true;
            } else {
                this.glowFilter2.enabled = true;
            }

            // update coherency and state
            if (patch == coherentPatchSide) {
                this.motionTutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                this.motionTutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
            } else {
                this.motionTutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                this.motionTutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
            }

            this.stepCounter++;
        }
    }

    startButtonClickHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyDownHandler);
        this.motionTutorialTrialWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.motionTutorialTrialWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.motionTutorialTrialWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.motionTutorialTrialWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        // hide start button, make patches interactive and set state to running
        this.startButton.visible = false;
        this.motionTutorialTrialWorld.patchLeft.interactive = true;
        this.motionTutorialTrialWorld.patchRight.interactive = true;
        this.motionTutorialTrialWorld.patchLeftObjectsContainer.visible = true;
        this.motionTutorialTrialWorld.patchRightObjectsContainer.visible = true;
        this.motionTutorialTrialWorld.setState(WorldState.RUNNING);
    }

    startButtonTouchendHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyDownHandler);
        this.motionTutorialTrialWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.motionTutorialTrialWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.motionTutorialTrialWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.motionTutorialTrialWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        // hide start button, make patches interactive and set state to running
        this.startButton.visible = false;
        this.motionTutorialTrialWorld.patchLeft.interactive = true;
        this.motionTutorialTrialWorld.patchRight.interactive = true;
        this.motionTutorialTrialWorld.patchLeftObjectsContainer.visible = true;
        this.motionTutorialTrialWorld.patchRightObjectsContainer.visible = true;
        this.motionTutorialTrialWorld.setState(WorldState.RUNNING);
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("testScreen");
    }

    hideDots = (): void => {
        this.motionTutorialTrialWorld.patchLeftObjectsContainer.visible = false;
        this.motionTutorialTrialWorld.patchRightObjectsContainer.visible = false;
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("testScreen");
            else
                this.gameApp.changeScreen("tutorialTaskScreen");
        }

        if (this.motionTutorialTrialWorld.getState() != WorldState.PAUSED) {
            this.motionTutorialTrialWorld.patchLeftObjectsContainer.visible = true;
            this.motionTutorialTrialWorld.patchRightObjectsContainer.visible = true;
        }
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.on("touchmove", this.hideDots);
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.startButton.on("click", this.startButtonClickHandler);
        this.startButton.on("touchend", this.startButtonTouchendHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonClickHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonClickHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.motionTutorialTrialWorld.patchLeft.off("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.motionTutorialTrialWorld.patchLeft.off("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.motionTutorialTrialWorld.patchRight.off("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.motionTutorialTrialWorld.patchRight.off("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        this.startButton.off("click", this.startButtonClickHandler);
        this.startButton.off("touchend", this.startButtonTouchendHandler);
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonClickHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);

        this.off("touchmove", this.hideDots);
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
    }
}