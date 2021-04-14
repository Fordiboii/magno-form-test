import * as PIXI from 'pixi.js';
import { GameApp } from '../../app';
import { MotionTutorialWorld } from '../../motion/MotionTutorialWorld';
import { GREEN_TEXT_COLOR, PATCH_LABEL_COLOR, RED_TEXT_COLOR } from '../../utils/Constants';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialTaskScreen extends TutorialScreen {
    private motionTutorialWorld: MotionTutorialWorld;
    private motionTutorialWorldContainer: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    private greenCheckmark: PIXI.Sprite;
    private redCross: PIXI.Sprite;
    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;

    constructor(gameApp: GameApp) {
        super(gameApp);

        // set header text
        this.header.text = "MOTION TEST TUTORIAL";

        // add motion tutorial world container
        this.motionTutorialWorldContainer.tint = 0;
        this.motionTutorialWorldContainer.anchor.set(0.5, 0)
        this.motionTutorialWorldContainer.x = this.contentX;
        this.motionTutorialWorldContainer.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.motionTutorialWorldContainer.width = Settings.WINDOW_WIDTH_PX;
        this.motionTutorialWorldContainer.height = Settings.WINDOW_HEIGHT_PX / 2.2;
        this.addChild(this.motionTutorialWorldContainer);

        // add motion tutorial world
        this.motionTutorialWorld = new MotionTutorialWorld();
        this.addChild(this.motionTutorialWorld);

        // add patch labels
        this.patchLeftLabel = new PIXI.Text("1", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.motionTutorialWorld.patchLeft.x + this.motionTutorialWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.motionTutorialWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text("2", {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.motionTutorialWorld.patchRight.x + this.motionTutorialWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.motionTutorialWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add checkmark
        const greenCheckmarkTexture: PIXI.Texture = PIXI.Loader.shared.resources['checkmark'].texture;
        this.greenCheckmark = new PIXI.Sprite(greenCheckmarkTexture);
        this.greenCheckmark.anchor.set(0.5, 1);
        this.greenCheckmark.width = this.greenCheckmark.height = Settings.WINDOW_WIDTH_PX > Settings.WINDOW_HEIGHT_PX ? Settings.WINDOW_WIDTH_PX / 34 : Settings.WINDOW_HEIGHT_PX / 26;
        this.greenCheckmark.roundPixels = true;
        this.greenCheckmark.x = this.motionTutorialWorld.patchRight.x + this.motionTutorialWorld.patchRight.width / 2;
        this.greenCheckmark.y = Settings.TRIAL_SCREEN_Y + this.motionTutorialWorld.patchLeft.height / 1.1;
        this.greenCheckmark.tint = GREEN_TEXT_COLOR;
        this.addChild(this.greenCheckmark);

        // add cross
        const redCrossTexture: PIXI.Texture = PIXI.Loader.shared.resources['cross'].texture;
        this.redCross = new PIXI.Sprite(redCrossTexture);
        this.redCross.anchor.set(0.5, 1);
        this.redCross.width = this.redCross.height = Settings.WINDOW_WIDTH_PX > Settings.WINDOW_HEIGHT_PX ? Settings.WINDOW_WIDTH_PX / 34 : Settings.WINDOW_HEIGHT_PX / 26;
        this.redCross.roundPixels = true;
        this.redCross.x = this.motionTutorialWorld.patchLeft.x + this.motionTutorialWorld.patchLeft.width / 2;
        this.redCross.y = Settings.TRIAL_SCREEN_Y + this.motionTutorialWorld.patchLeft.height / 1.1;
        this.redCross.tint = RED_TEXT_COLOR;
        this.addChild(this.redCross);

        // add tutorial text
        this.tutorialText.text =
            "During the test, you will see two boxes containing moving dots." +
            " Your task is to identify and select the box with dots moving systematically back and forth, here shown in box 2." +
            " The dots are displayed for 5 seconds. " +
            " You select a box by clicking it or using the left and right arrow keys on your keyboard." +
            " This exercise is repeated several times until completion, at which point you will receive your test score." +
            " The test takes approximately 8 minutes.";

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[1].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        this.motionTutorialWorld.update(delta);
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonClickHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonClickHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonClickHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
    }
}