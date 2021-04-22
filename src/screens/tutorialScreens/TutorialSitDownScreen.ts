import * as PIXI from 'pixi.js';
import { MotionApp } from '../../MotionApp';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialSitDownScreen extends TutorialScreen {
    private tutorialImage: PIXI.Sprite;

    constructor(gameApp: MotionApp) {
        super(gameApp);

        // set header text
        this.header.text = "MOTION TEST TUTORIAL";

        // add tutorial image
        const tutorialImageTexture: PIXI.Texture = PIXI.Loader.shared.resources['sitDownImage'].texture;
        this.tutorialImage = new PIXI.Sprite(tutorialImageTexture)
        this.tutorialImage.anchor.set(0.5, 0)
        this.tutorialImage.x = this.contentX;
        this.tutorialImage.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.tutorialImage.width = Settings.WINDOW_WIDTH_PX / 3;
        this.tutorialImage.height = Settings.WINDOW_HEIGHT_PX / 2.3;
        this.addChild(this.tutorialImage);

        // add tutorial text
        this.tutorialText.text =
            "Take a seat with your stomach touching the edge of the table. Place your device " +
            Settings.SCREEN_VIEWING_DISTANCE_MM / 10 +
            " cm from the edge of the table.";

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[1].texture = circleFilledTexture;
    }

    update = (): void => {
        return;
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    nextButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("landingPageScreen");
    }

    backButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("landingPageScreen");
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("tutorialTaskScreen");
            else
                this.gameApp.changeScreen("landingPageScreen");
        }
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonTouchendHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonTouchendHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonTouchendHandler);
    }
}