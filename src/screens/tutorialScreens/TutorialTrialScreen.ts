import * as PIXI from 'pixi.js';
import { GameApp } from '../../app';
import { MotionTutorialTrialWorld } from '../../motion/MotionTutorialTrialWorld';
import { TextButton } from '../../objects/buttons/TextButton';
import {
    BLUE_TEXT_COLOR,
    GREEN_TEXT_COLOR,
    KEY_LEFT,
    KEY_RIGHT,
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

    private trialCorrectText: PIXI.Text;
    private trialIncorrectText: PIXI.Text;
    private trialFinishedText: PIXI.Text;

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
            + " When you are ready, click \"NEXT\".";

        // add trial texts
        const TRIAL_TEXT_X: number = Settings.WINDOW_WIDTH_PX / 2;
        const TRIAL_TEXT_Y: number = this.motionTutorialTrialWorldContainer.y + this.motionTutorialTrialWorldContainer.height / 2;

        this.trialCorrectText = new PIXI.Text("WELL DONE!",
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE,
                fill: GREEN_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialCorrectText.roundPixels = true;
        this.trialCorrectText.anchor.set(0.5);
        this.trialCorrectText.x = TRIAL_TEXT_X;
        this.trialCorrectText.y = TRIAL_TEXT_Y;

        this.trialIncorrectText = new PIXI.Text("BETTER LUCK NEXT TIME!",
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE,
                fill: RED_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialIncorrectText.roundPixels = true;
        this.trialIncorrectText.anchor.set(0.5);
        this.trialIncorrectText.x = TRIAL_TEXT_X;
        this.trialIncorrectText.y = TRIAL_TEXT_Y;

        this.trialFinishedText = new PIXI.Text("CLICK NEXT TO PROCEED TO THE TEST",
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE,
                fill: BLUE_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialFinishedText.roundPixels = true;
        this.trialFinishedText.anchor.set(0.5);
        this.trialFinishedText.x = TRIAL_TEXT_X;
        this.trialFinishedText.y = TRIAL_TEXT_Y;

        this.trialCorrectText.visible = false;
        this.trialIncorrectText.visible = false;
        this.trialFinishedText.visible = false;

        this.trialTextBackgroundColor.anchor.set(0.5);
        this.trialTextBackgroundColor.tint = 0;
        this.trialTextBackgroundColor.filters = [new PIXI.filters.BlurFilter(6)]
        this.trialTextContainer.visible = false;
        this.trialTextContainer.addChild(this.trialTextBackgroundColor, this.trialCorrectText, this.trialIncorrectText, this.trialFinishedText);
        this.addChild(this.trialTextContainer)

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[2].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        if (this.motionTutorialTrialWorld.getState() == WorldState.TRIAL_CORRECT) {
            this.trialCorrectText.visible = true;

            this.trialTextBackgroundColor.x = this.trialCorrectText.x;
            this.trialTextBackgroundColor.y = this.trialCorrectText.y;
            this.trialTextBackgroundColor.width = this.trialCorrectText.width;
            this.trialTextBackgroundColor.height = this.trialCorrectText.height * 1.5;
            this.trialTextContainer.visible = true;
        } else if (this.motionTutorialTrialWorld.getState() == WorldState.TRIAL_INCORRECT) {
            this.trialIncorrectText.visible = true;

            this.trialTextBackgroundColor.x = this.trialIncorrectText.x;
            this.trialTextBackgroundColor.y = this.trialIncorrectText.y;
            this.trialTextBackgroundColor.width = this.trialIncorrectText.width;
            this.trialTextBackgroundColor.height = this.trialIncorrectText.height * 1.5;
            this.trialTextContainer.visible = true;
        } else if (this.motionTutorialTrialWorld.getState() == WorldState.FINISHED) {
            this.trialCorrectText.visible = false;
            this.trialIncorrectText.visible = false;
            this.trialFinishedText.visible = true;

            this.trialTextBackgroundColor.x = this.trialFinishedText.x;
            this.trialTextBackgroundColor.y = this.trialFinishedText.y;
            this.trialTextBackgroundColor.width = this.trialFinishedText.width;
            this.trialTextBackgroundColor.height = this.trialFinishedText.height * 1.5;
            this.trialTextContainer.visible = true;
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
                if (coherentPatchSide == "LEFT") {
                    this.motionTutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
                } else {
                    this.motionTutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
                }
                // create a new trial if max steps isn't exceeeded
                if (this.stepCounter != this.maxSteps - 1) {
                    this.motionTutorialTrialWorld.reset();
                }
                this.stepCounter++;
            } else if (event.code == KEY_RIGHT) {
                if (coherentPatchSide == "RIGHT") {
                    this.motionTutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
                } else {
                    this.motionTutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.motionTutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
                }
                // create a new trial if max steps isn't exceeeded
                if (this.stepCounter != this.maxSteps - 1) {
                    this.motionTutorialTrialWorld.reset();
                }
                this.stepCounter++;
            }
        }
    }

    mouseDownHandler = (patch: string): void => {
        const currentState: WorldState = this.motionTutorialTrialWorld.getState();
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
            let coherentPatchSide: string = this.motionTutorialTrialWorld.getCoherentPatchSide();

            if (patch == coherentPatchSide) {
                this.motionTutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                this.motionTutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
            } else {
                this.motionTutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                this.motionTutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
            }
            // create a new trial if max steps isn't exceeeded
            if (this.stepCounter != this.maxSteps - 1) {
                this.motionTutorialTrialWorld.reset();
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
        this.motionTutorialTrialWorld.dotsLeftContainer.visible = true;
        this.motionTutorialTrialWorld.dotsRightContainer.visible = true;
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
        this.motionTutorialTrialWorld.dotsLeftContainer.visible = true;
        this.motionTutorialTrialWorld.dotsRightContainer.visible = true;
        this.motionTutorialTrialWorld.setState(WorldState.RUNNING);
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("motionScreen");
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
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
    }
}