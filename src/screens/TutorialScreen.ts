import * as PIXI from 'pixi.js';
import { GameApp } from '../app';
import { SpriteButton } from '../objects/buttons/SpriteButton';
import { TextButton } from '../objects/buttons/TextButton';
import {
    SPRITE_BUTTON_HOVER_COLOR,
    TEXT_COLOR,
    NEXT_BUTTON_COLOR,
    NEXT_BUTTON_HOVER_COLOR,
    BACKGROUND_COLOR,
    FONT_SIZE,
    NEXT_BUTTON_STROKE_COLOR
} from '../utils/Constants';
import { Settings } from '../utils/Settings';

export abstract class TutorialScreen extends PIXI.Container {
    public gameApp: GameApp;
    protected backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    protected header: PIXI.Text;
    protected tutorialText: PIXI.Text;
    protected circleContainer: PIXI.Sprite = new PIXI.Sprite();
    protected circles: Array<PIXI.Sprite> = new Array<PIXI.Sprite>();
    protected backButton: TextButton;
    protected nextButton: TextButton;

    // variables for storing x and y positions of tutorial content (image or motion world) and tutorial text
    protected contentX: number;
    protected contentY: number;
    protected tutorialTextX: number;
    protected tutorialTextY: number;

    constructor(gameApp: GameApp) {
        super();
        // reference to game object
        this.gameApp = gameApp;

        // button positions
        const backButtonX: number = Settings.WINDOW_WIDTH_PX / 2 - Settings.NEXT_BACK_BUTTON_SPACING;
        const nextButtonX: number = Settings.WINDOW_WIDTH_PX / 2 + Settings.NEXT_BACK_BUTTON_SPACING;
        const backAndNextButtonY: number = Settings.WINDOW_HEIGHT_PX - 2 * Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING - Settings.TEXT_BUTTON_HEIGHT / 2;

        // add background color
        this.backgroundColorSprite.width = Settings.WINDOW_WIDTH_PX;
        this.backgroundColorSprite.height = Settings.WINDOW_HEIGHT_PX;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add header
        const HEADER_FONT_SIZE: number = FONT_SIZE * 1.2;
        this.header = new PIXI.Text("",
            {
                fontSize: HEADER_FONT_SIZE,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.header.anchor.set(0.5, 0);
        this.header.x = Settings.WINDOW_WIDTH_PX / 2;
        this.header.y = Settings.HEADER_Y_POSITION;
        this.header.roundPixels = true;
        this.addChild(this.header);

        // content and tutorial text positions
        this.contentX = Settings.WINDOW_WIDTH_PX / 2;
        this.contentY = Settings.HEADER_Y_POSITION + this.header.height + Settings.TUTORIAL_CONTENT_TOP_BOTTOM_PADDING;
        this.tutorialTextX = Settings.WINDOW_WIDTH_PX / 2;
        this.tutorialTextY = this.contentY + Settings.WINDOW_HEIGHT_PX / 2;

        // add tutorial text
        this.tutorialText = new PIXI.Text("",
            {
                fontSize: FONT_SIZE,
                fill: TEXT_COLOR,
                align: 'left',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.tutorialText.anchor.set(0.5, 0);
        this.tutorialText.x = this.tutorialTextX;
        this.tutorialText.y = this.tutorialTextY;
        this.addChild(this.tutorialText);

        // add back button
        this.backButton =
            new TextButton(
                backButtonX,
                backAndNextButtonY,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                NEXT_BUTTON_COLOR,
                NEXT_BUTTON_STROKE_COLOR,
                "BACK",
                TEXT_COLOR,
                NEXT_BUTTON_HOVER_COLOR
            );
        this.addChild(this.backButton);

        // add next button
        this.nextButton =
            new TextButton(
                nextButtonX,
                backAndNextButtonY,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                NEXT_BUTTON_COLOR,
                NEXT_BUTTON_STROKE_COLOR,
                "NEXT",
                TEXT_COLOR,
                NEXT_BUTTON_HOVER_COLOR
            );
        this.addChild(this.nextButton);

        // add circles
        const circleHollowTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleHollow'].texture;
        for (let i = 0; i < 3; i++) {
            const circle: SpriteButton =
                new SpriteButton(
                    i * Settings.CIRCLE_BUTTON_WIDTH * 2,
                    0,
                    Settings.CIRCLE_BUTTON_WIDTH,
                    Settings.CIRCLE_BUTTON_WIDTH,
                    circleHollowTexture,
                    [0, 0.5],
                    SPRITE_BUTTON_HOVER_COLOR
                );
            this.circles.push(circle);
            this.circleContainer.addChild(circle);
        }
        this.circleContainer.x = Settings.WINDOW_WIDTH_PX / 2 - this.circleContainer.getBounds().width / 2;
        this.circleContainer.y = Settings.WINDOW_HEIGHT_PX - Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING;
        this.addChild(this.circleContainer);

        // add circle event handlers
        this.circles[0].on("click", this.firstCircleClickHandler);
        this.circles[1].on("click", this.secondCircleClickHandler);
        this.circles[2].on("click", this.thirdCircleClickHandler);
    }

    firstCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.tutorialSitDownScreen) {
            this.gameApp.changeScreen("tutorialSitDownScreen");
        }
    }

    secondCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.tutorialTaskScreen) {
            this.gameApp.changeScreen("tutorialTaskScreen");
        }
    }

    thirdCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.tutorialTrialScreen) {
            this.gameApp.changeScreen("tutorialTrialScreen");
        }
    }

    abstract update(delta: number): void;

    abstract removeEventListeners(): void;
}