import * as PIXI from 'pixi.js';
import { GlowFilter } from "pixi-filters";
import { MotionWorld } from "../motion/MotionWorld";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import {
    SPRITE_BUTTON_HOVER_COLOR,
    TEXT_COLOR,
    KEY_BACKSPACE,
    KEY_LEFT,
    KEY_RIGHT,
    START_BUTTON_COLOR,
    START_BUTTON_HOVER_COLOR,
    START_BUTTON_STROKE_COLOR,
    PATCH_LABEL_COLOR,
    GLOW_FILTER_DISTANCE,
    GLOW_FILTER_QUALITY,
} from "../utils/Constants";
import { WorldState } from "../utils/Enums";
import { TextButton } from "../objects/buttons/TextButton";
import { SpriteButton } from "../objects/buttons/SpriteButton";
import { GameApp } from '../app';
import { Trial } from '../interfaces/trial';
import { TestResults } from '../objects/TestResults';

export class MotionScreen extends PIXI.Container {
    private gameApp: GameApp;

    private motionWorld: MotionWorld;

    public reversalPoints: number;
    public maxSteps: number;

    private prevStep: boolean;

    public reversalCounter: number;
    public stepCounter: number;
    private correctAnswerCounter: number;
    private wrongAnswerCounter: number;

    private selectionTimer: number;
    private trials: Array<Trial> = new Array<Trial>();

    private reversalValues: Array<number>;

    private correctAnswerFactor: number;
    private wrongAnswerFactor: number;

    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;
    private startButton: TextButton;
    private backButton: SpriteButton;
    private pauseText: PIXI.Text;

    // any type because pixi-filters isn't working properly with typescript
    public glowFilter1: any;
    public glowFilter2: any;

    constructor(gameApp: GameApp) {
        super();
        // reference to game object
        this.gameApp = gameApp;

        this.reversalPoints = Settings.STAIRCASE_REVERSAL_POINTS;
        this.maxSteps = Settings.STAIRCASE_MAX_ATTEMPTS;

        this.selectionTimer = 0;

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
        this.motionWorld = new MotionWorld(this);
        this.addChild(this.motionWorld);

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
        this.motionWorld.patchLeft.filters = [this.glowFilter1];
        this.motionWorld.patchRight.filters = [this.glowFilter2];

        // create patch labels and add to container
        this.patchLeftLabel = new PIXI.Text("1", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.3,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.motionWorld.patchLeft.x + this.motionWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.motionWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text("2", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.3,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.motionWorld.patchRight.x + this.motionWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.motionWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add text shown when animation is paused
        this.pauseText = new PIXI.Text("Select a box", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE,
            fill: PATCH_LABEL_COLOR
        });
        this.pauseText.anchor.set(0.5, 0);
        this.pauseText.roundPixels = true;
        this.pauseText.x = Settings.WINDOW_WIDTH_PX / 2;
        this.pauseText.y = Settings.WINDOW_HEIGHT_PX / 2 + this.motionWorld.patchLeft.height / 1.5;
        this.pauseText.visible = false;
        this.addChild(this.pauseText);

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
            // hide pause text
            this.pauseText.visible = false;
            // create test results
            const testResults: TestResults = new TestResults("motion", this.trials, this.reversalValues, this.correctAnswerCounter, this.wrongAnswerCounter);
            this.gameApp.setTestResults(testResults);
            // change screen
            this.gameApp.changeScreen("resultsScreen");
        } else if (this.motionWorld.getState() == WorldState.PAUSED) {
            // show pause text if start button isn't visible, meaning the test has started and is paused.
            if (!this.startButton.visible) {
                this.pauseText.visible = true;
            }
            // update motion world
            this.motionWorld.update(delta);
        } else {
            // hide pause text
            this.pauseText.visible = false;
            // update motion world
            this.motionWorld.update(delta);
        }

        // update timer
        if (this.motionWorld.getState() == WorldState.RUNNING) {
            this.selectionTimer += delta;
        }
    }

    keyLeftRightDownHandler = (event: KeyboardEvent): void => {
        // To prevent handler from triggering multiple times if a key is held
        if (event.repeat) return

        let currentStep: boolean = true;
        let reversalValue: number = this.motionWorld.getCoherencePercent();
        let coherentPatchSide: string = this.motionWorld.getCoherentPatchSide();

        if (event.code == KEY_LEFT) {
            // get current state
            const currentState: WorldState = this.motionWorld.getState();
            // only register input if state is RUNNING or PAUSED
            if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
                // set state to PATCH_SELECTED
                this.motionWorld.setState(WorldState.PATCH_SELECTED);
                // enable glow filter on the selected patch
                this.glowFilter1.enabled = true;

                // update coherency and counters
                if (coherentPatchSide == "LEFT") {
                    this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.correctAnswerCounter++;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyLeft",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                } else {
                    this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.wrongAnswerCounter++;
                    currentStep = false;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyLeft",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                }

                // check if the current answer differs from the previous step. Save the value at reversal and increment counter
                if (this.stepCounter > 1 && this.prevStep != currentStep) {
                    this.reversalValues.push(reversalValue);
                    this.reversalCounter++;
                }

                this.prevStep = currentStep;
                this.stepCounter++;
                this.selectionTimer = 0;
            }
        } else if (event.code == KEY_RIGHT) {
            // get current state
            const currentState: WorldState = this.motionWorld.getState();
            // only register input if state is RUNNING or PAUSED
            if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
                // set state to PATCH_SELECTED
                this.motionWorld.setState(WorldState.PATCH_SELECTED);
                // enable glow filter on the selected patch
                this.glowFilter2.enabled = true;

                // update coherency and counters
                if (coherentPatchSide == "RIGHT") {
                    this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.correctAnswerCounter++;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyRight",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                } else {
                    this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.wrongAnswerCounter++;
                    currentStep = false;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyRight",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                }

                // check if the current answer differs from the previous step. Save the value at reversal and increment counter
                if (this.stepCounter > 1 && this.prevStep != currentStep) {
                    this.reversalValues.push(reversalValue);
                    this.reversalCounter++;
                }

                this.prevStep = currentStep;
                this.stepCounter++;
                this.selectionTimer = 0;
            }
        }
    }

    keyBackspaceDownHandler = (event: KeyboardEvent): void => {
        if (event.repeat) return
        if (event.code == KEY_BACKSPACE) {
            this.gameApp.changeScreen("tutorialTrialScreen");
        }
    }

    mouseDownHandler = (patch: string, e: PIXI.InteractionEvent): void => {
        // get current state
        const currentState: WorldState = this.motionWorld.getState();
        // only register input if state is RUNNING or PAUSED
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
            let currentStep: boolean = true;
            let reversalValue: number = this.motionWorld.getCoherencePercent();
            let coherentPatchSide: string = this.motionWorld.getCoherentPatchSide();

            // set state to PATCH_SELECTED
            this.motionWorld.setState(WorldState.PATCH_SELECTED);
            // enable glow filter on the selected patch
            if (patch == "LEFT") {
                this.glowFilter1.enabled = true;
            } else {
                this.glowFilter2.enabled = true;
            }

            // update coherency and counters
            if (patch == coherentPatchSide) {
                this.motionWorld.updateCoherency(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;

                // add trial data to results
                if (patch == "LEFT") {
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                } else {
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                }
            } else {
                this.motionWorld.updateCoherency(this.wrongAnswerFactor, false);
                this.wrongAnswerCounter++;
                currentStep = false;

                // add trial data to results
                if (patch == "LEFT") {
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                } else {
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                }
            }

            // check if the current answer differs from the previous step. Save the value at reversal and increment counter
            if (this.stepCounter > 1 && this.prevStep != currentStep) {
                this.reversalValues.push(reversalValue);
                this.reversalCounter++;
            }

            this.prevStep = currentStep;
            this.stepCounter++;
            this.selectionTimer = 0;

            console.log(this.trials)
        }
    }

    resetMotionWorld = (): void => {
        this.motionWorld = new MotionWorld(this);
    }

    startButtonClickHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyLeftRightDownHandler, true);
        this.motionWorld.patchLeft.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.motionWorld.patchLeft.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.motionWorld.patchRight.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));
        this.motionWorld.patchRight.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));

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
        this.motionWorld.patchLeft.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.motionWorld.patchLeft.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.motionWorld.patchRight.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));
        this.motionWorld.patchRight.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));

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