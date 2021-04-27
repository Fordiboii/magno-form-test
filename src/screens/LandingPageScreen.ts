import * as PIXI from 'pixi.js';
import { GameApp } from '../app';
import { TestType } from '../utils/Enums';
import { Settings } from '../utils/Settings';
import { TutorialScreen } from './tutorialScreens/TutorialScreen';

export class LandingPageScreen extends TutorialScreen {
    logo: PIXI.Sprite;

    constructor(gameApp: GameApp, testType: TestType) {
        super(gameApp);

        // add logo
        const logoTexture: PIXI.Texture = PIXI.Loader.shared.resources['magnoLogo'].texture;
        this.logo = new PIXI.Sprite(logoTexture);
        this.logo.anchor.set(0.5);
        this.logo.scale.set(Settings.WINDOW_WIDTH_PX / 3400);
        this.logo.position.set(Settings.WINDOW_WIDTH_PX / 2, this.header.y * 1.5);
        this.addChild(this.logo);

        // hide back button
        this.backButton.visible = false;

        // set header text based on test type
        if (testType == TestType.MOTION) {
            this.header.text = "MOTION TEST";
        } else if (testType == TestType.FORM_FIXED) {
            this.header.text = "FORM FIXED TEST";
        } else if (testType == TestType.FORM_RANDOM) {
            this.header.text = "FORM RANDOM TEST";
        }
        this.header.y = this.logo.y + this.logo.height / 2;

        // set tutorial text based on test type
        if (testType == TestType.MOTION) {
            this.tutorialText.text = "The Magno motion test measures your visual sensitivity to motion and is used in dyslexia research to further our understanding " +
                "of the disorder's underlying causes. Its secondary purpose is to aid in the early detection of those at risk of developing it to put preventive measures in place as soon as possible. " +
                "\n\nYou will first go through a tutorial preparing you for the test. After completing the test you will receive a score between 1 and 100, where 1 is the best possible score. " +
                "Click NEXT to continue.";
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text = "The Magno form fixed test measures your object detection ability and is used in dyslexia research to further our understanding " +
                "of the disorder's underlying causes. Its secondary purpose is to aid in the early detection of those at risk of developing it to put preventive measures in place as soon as possible. " +
                "\n\nYou will first go through a tutorial preparing you for the test. After completing the test you will receive a score between 1 and 100, where 1 is the best possible score. " +
                "Click NEXT to continue.";
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text = "The Magno form random test measures your object detection ability and is used in dyslexia research to further our understanding " +
                "of the disorder's underlying causes. Its secondary purpose is to aid in the early detection of those at risk of developing it to put preventive measures in place as soon as possible. " +
                "\n\nYou will first go through a tutorial preparing you for the test. After completing the test you will receive a score between 1 and 100, where 1 is the best possible score. " +
                "Click NEXT to continue.";
        }
        this.tutorialText.anchor.set(0.5);
        this.tutorialText.y = Settings.WINDOW_HEIGHT_PX / 2;
        this.tutorialText.style.wordWrapWidth = Settings.TUTORIAL_TEXT_WIDTH / 1.5;

        // move next button to center
        this.nextButton.x = Settings.WINDOW_WIDTH_PX / 2 - this.nextButton.width / 2;

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[0].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        return;
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    nextButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("tutorialSitDownScreen");
        }
    }

    addEventListeners = (): void => {
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonTouchendHandler);
    }

    removeEventListeners = (): void => {
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
    }
}