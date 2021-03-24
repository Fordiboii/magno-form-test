import * as PIXI from 'pixi.js';
import { MotionTutorialTrialWorld } from '../motion/MotionTutorialTrialWorld';
import { TextButton } from '../objects/buttons/TextButton';
import {
    BLUE_TEXT_COLOR,
    FONT_SIZE,
    GREEN_TEXT_COLOR,
    KEY_LEFT,
    KEY_RIGHT,
    RED_TEXT_COLOR,
    START_BUTTON_COLOR,
    START_BUTTON_HOVER_COLOR,
    START_BUTTON_STROKE_COLOR,
    TEXT_COLOR
} from '../utils/Constants';
import { WorldState } from '../utils/Enums';
import { Psychophysics } from '../utils/Psychophysics';
import { Settings } from '../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialTrialScreen extends TutorialScreen {
    public maxSteps: number;
    public stepCounter: number;
    protected correctAnswerFactor: number;
    protected wrongAnswerFactor: number;

    protected motionTutorialTrialWorld: MotionTutorialTrialWorld;
    protected motionTutorialTrialWorldBackground: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

    protected startButton: TextButton;

    protected trialTextContainer: PIXI.Container = new PIXI.Container();
    protected trialTextBackgroundColor: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

    protected trialCorrectText: PIXI.Text;
    protected trialIncorrectText: PIXI.Text;
    protected trialFinishedText: PIXI.Text;

    constructor() {
        super();
        this.maxSteps = Settings.TRIAL_MAX_STEPS;
        this.stepCounter = 0;
        this.correctAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_CORRECT_ANSWER_DB);
        this.wrongAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_WRONG_ANSWER_DB);

        // set header text
        this.header.text = "MOTION TEST TUTORIAL";

        // add motion tutorial world background
        this.motionTutorialTrialWorldBackground.tint = 0;
        this.motionTutorialTrialWorldBackground.anchor.set(0.5, 0)
        this.motionTutorialTrialWorldBackground.x = this.contentX;
        this.motionTutorialTrialWorldBackground.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.motionTutorialTrialWorldBackground.width = Settings.WINDOW_WIDTH_PX;
        this.motionTutorialTrialWorldBackground.height = Settings.WINDOW_HEIGHT_PX / 2.3;
        this.addChild(this.motionTutorialTrialWorldBackground);

        // add motion tutorial world
        this.motionTutorialTrialWorld = new MotionTutorialTrialWorld(this);
        this.addChild(this.motionTutorialTrialWorld);

        // add start button
        this.startButton =
            new TextButton(
                Settings.WINDOW_WIDTH_PX / 2,
                this.motionTutorialTrialWorldBackground.y + this.motionTutorialTrialWorldBackground.height / 1.8,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                START_BUTTON_COLOR,
                START_BUTTON_STROKE_COLOR,
                "START TRIAL",
                TEXT_COLOR,
                START_BUTTON_HOVER_COLOR
            );
        this.addChild(this.startButton);

        // add tutorial text
        this.tutorialText.text =
            "Try it out a few times! Keep in mind that you will not receive feedback on whether or not you have chosen the correct box during the actual test.";

        // add trial texts
        const TRIAL_TEXT_X: number = Settings.WINDOW_WIDTH_PX / 2;
        const TRIAL_TEXT_Y: number = this.motionTutorialTrialWorldBackground.y + this.motionTutorialTrialWorldBackground.height / 2;

        this.trialCorrectText = new PIXI.Text("WELL DONE!",
            {
                fontName: 'Helvetica-Normal',
                fontSize: FONT_SIZE,
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
                fontSize: FONT_SIZE,
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

        this.trialFinishedText = new PIXI.Text("YOU ARE READY FOR THE TEST!",
            {
                fontName: 'Helvetica-Normal',
                fontSize: FONT_SIZE,
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

        // add event listeners
        this.startButton.on("click", (): void => this.startButtonClickHandler());
        this.startButton.on("touchend", (): void => this.startButtonTouchendHandler());
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
        if (this.startButton.isMouseDown) {
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
        this.startButton.isMouseDown = false;
    }
}