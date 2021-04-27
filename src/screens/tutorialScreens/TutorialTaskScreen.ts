import * as PIXI from 'pixi.js';
import { GameApp } from '../../app';
import { MotionTutorialTaskWorld } from '../../motion/MotionTutorialTaskWorld';
import { FormTutorialTaskWorld } from '../../form/FormTutorialTaskWorld';
import { GREEN_TEXT_COLOR, PATCH_LABEL_COLOR, RED_TEXT_COLOR } from '../../utils/Constants';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';
import { TestType } from '../../utils/Enums';

export class TutorialTaskScreen extends TutorialScreen {
    private tutorialWorld: MotionTutorialTaskWorld | FormTutorialTaskWorld;
    private tutorialWorldContainer: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    private greenCheckmark: PIXI.Sprite;
    private redCross: PIXI.Sprite;
    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;

    constructor(gameApp: GameApp, testType: TestType) {
        super(gameApp);

        // set header text and tutorial world based on test type
        if (testType == TestType.MOTION) {
            this.header.text = "MOTION TEST TUTORIAL";
            this.tutorialWorld = new MotionTutorialTaskWorld();
        } else if (testType == TestType.FORM_FIXED) {
            this.header.text = "FORM FIXED TEST TUTORIAL";
            this.tutorialWorld = new FormTutorialTaskWorld(true);
        } else if (testType == TestType.FORM_RANDOM) {
            this.header.text = "FORM RANDOM TEST TUTORIAL";
            this.tutorialWorld = new FormTutorialTaskWorld(false);
        }

        // add motion tutorial world container
        this.tutorialWorldContainer.tint = 0;
        this.tutorialWorldContainer.anchor.set(0.5, 0)
        this.tutorialWorldContainer.x = this.contentX;
        this.tutorialWorldContainer.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.tutorialWorldContainer.width = Settings.WINDOW_WIDTH_PX;
        this.tutorialWorldContainer.height = Settings.WINDOW_HEIGHT_PX / 2.2;
        this.addChild(this.tutorialWorldContainer);

        // add motion tutorial world
        this.addChild(this.tutorialWorld);

        // add patch labels
        this.patchLeftLabel = new PIXI.Text("1", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.tutorialWorld.patchLeft.x + this.tutorialWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.tutorialWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text("2", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.tutorialWorld.patchRight.x + this.tutorialWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.tutorialWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add checkmark
        const greenCheckmarkTexture: PIXI.Texture = PIXI.Loader.shared.resources['checkmark'].texture;
        this.greenCheckmark = new PIXI.Sprite(greenCheckmarkTexture);
        this.greenCheckmark.anchor.set(0.5, 1);
        this.greenCheckmark.width = this.greenCheckmark.height = Settings.WINDOW_WIDTH_PX > Settings.WINDOW_HEIGHT_PX ? Settings.WINDOW_WIDTH_PX / 34 : Settings.WINDOW_HEIGHT_PX / 26;
        this.greenCheckmark.roundPixels = true;
        this.greenCheckmark.x = this.tutorialWorld.patchRight.x + this.tutorialWorld.patchRight.width / 2;
        this.greenCheckmark.y = Settings.TRIAL_SCREEN_Y + this.tutorialWorld.patchLeft.height / 1.1;
        this.greenCheckmark.tint = GREEN_TEXT_COLOR;
        this.addChild(this.greenCheckmark);

        // add cross
        const redCrossTexture: PIXI.Texture = PIXI.Loader.shared.resources['cross'].texture;
        this.redCross = new PIXI.Sprite(redCrossTexture);
        this.redCross.anchor.set(0.5, 1);
        this.redCross.width = this.redCross.height = Settings.WINDOW_WIDTH_PX > Settings.WINDOW_HEIGHT_PX ? Settings.WINDOW_WIDTH_PX / 34 : Settings.WINDOW_HEIGHT_PX / 26;
        this.redCross.roundPixels = true;
        this.redCross.x = this.tutorialWorld.patchLeft.x + this.tutorialWorld.patchLeft.width / 2;
        this.redCross.y = Settings.TRIAL_SCREEN_Y + this.tutorialWorld.patchLeft.height / 1.1;
        this.redCross.tint = RED_TEXT_COLOR;
        this.addChild(this.redCross);

        // set tutorial text based on test type
        if (testType == TestType.MOTION) {
            this.tutorialText.text =
                "In the test you are shown two boxes with moving dots." +
                ` The dots are displayed for ${Settings.DOT_MAX_ANIMATION_TIME / 1000} seconds before disappearing. ` +
                " Your task is to identify and select the box with dots moving systematically back and forth, here shown in box 2." +
                " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
                " This exercise is repeated several times. The difficulty increases or decreases if your answer is correct or wrong, respectively." +
                " When the test is over you will receive a test score." +
                " The test takes approximately 8 minutes.";
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text =
                "In the test you are shown two boxes with line segments rotated at different angles." +
                ` The line segments are displayed for ${Settings.FORM_FIXED_DETECTION_TIME / 1000} seconds before disappearing.` +
                " Your task is to identify and select the box where a number of line segments form concentric circles, here shown in box 2." +
                " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
                " This exercise is repeated several times. The difficulty increases or decreases if your answer is correct or wrong, respectively." +
                " When the test is over you will receive a test score." +
                " The test takes approximately 8 minutes.";
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text =
                "In the test you are shown two boxes with line segments rotated at different angles." +
                " Your task is to identify and select the box where a number of line segments form concentric circles, here shown in box 2." +
                " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
                " This exercise is repeated several times. The difficulty increases or decreases if your answer is correct or wrong, respectively." +
                " When the test is over you will receive a test score." +
                " The test takes approximately 8 minutes.";
        }

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[2].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        this.tutorialWorld.update(delta);
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    hideDots = (): void => {
        this.tutorialWorld.patchLeftObjectsContainer.visible = false;
        this.tutorialWorld.patchRightObjectsContainer.visible = false;
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("tutorialTrialScreen");
            else
                this.gameApp.changeScreen("tutorialSitDownScreen");
        }

        this.tutorialWorld.patchLeftObjectsContainer.visible = true;
        this.tutorialWorld.patchRightObjectsContainer.visible = true;
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.on("touchmove", this.hideDots);
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonClickHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonClickHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.off("touchmove", this.hideDots);
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonClickHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
    }
}