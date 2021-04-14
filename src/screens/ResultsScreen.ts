import * as PIXI from "pixi.js";
import { TextButton } from "../objects/buttons/TextButton";
import { ResultsBar } from "../objects/ResultsBar";
import { BACKGROUND_COLOR, NEXT_BUTTON_COLOR, NEXT_BUTTON_HOVER_COLOR, NEXT_BUTTON_STROKE_COLOR, TEXT_COLOR } from "../utils/Constants";
import { Settings } from "../utils/Settings";

export class ResultsScreen extends PIXI.Container {
    private backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    private header: PIXI.Text;
    private score: PIXI.Text;
    private description: PIXI.Text;
    private descriptionText: string;
    private resultsBar: ResultsBar;
    private threshold: number;
    private exitButton: TextButton;

    constructor(threshold: number) {
        super();
        // round threshold score to 2 decimals
        this.threshold = Number(threshold.toFixed(2));

        // add background color
        this.backgroundColorSprite.width = Settings.WINDOW_WIDTH_PX;
        this.backgroundColorSprite.height = Settings.WINDOW_HEIGHT_PX;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add header
        const HEADER_FONT_SIZE: number = Settings.FONT_SIZE * 1.2;
        this.header = new PIXI.Text("TEST RESULTS",
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

        // add score
        const SCORE_FONT_SIZE: number = Settings.FONT_SIZE * 1.5;
        this.score = new PIXI.Text(`YOUR SCORE: ${this.threshold}`,
            {
                fontSize: SCORE_FONT_SIZE,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.score.anchor.set(0.5, 0);
        this.score.x = Settings.WINDOW_WIDTH_PX / 2;
        this.score.y = Settings.HEADER_Y_POSITION + Settings.WINDOW_HEIGHT_PX / 6;
        this.score.roundPixels = true;
        this.addChild(this.score);

        this.descriptionText = "Thank you for participating.\n\n "
        if (threshold < 20) {
            this.descriptionText += "Your score is within the normal score range.";
        } else if (threshold >= 20 && threshold < 50) {
            this.descriptionText += "Your score is slightly above the normal score range.";
        } else {
            this.descriptionText += "Your score is significantly above the normal score range.";
        }

        // add description
        this.description = new PIXI.Text(this.descriptionText,
            {
                fontSize: Settings.FONT_SIZE,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.description.anchor.set(0.5, 0);
        this.description.x = Settings.WINDOW_WIDTH_PX / 2;
        this.description.y = Settings.HEADER_Y_POSITION + Settings.WINDOW_HEIGHT_PX / 3;
        this.description.roundPixels = true;
        this.addChild(this.description);

        // add resultsbar
        this.resultsBar = new ResultsBar(Settings.WINDOW_WIDTH_PX / 2, Settings.WINDOW_HEIGHT_PX / 1.5, Settings.WINDOW_WIDTH_PX * 3 / 5, Settings.TEXT_BUTTON_HEIGHT);
        this.resultsBar.setMarker(threshold);
        this.addChild(this.resultsBar);

        // add exit button
        this.exitButton = new TextButton(
            Settings.WINDOW_WIDTH_PX / 2,
            Settings.WINDOW_HEIGHT_PX / 1.1,
            Settings.TEXT_BUTTON_WIDTH,
            Settings.TEXT_BUTTON_HEIGHT,
            NEXT_BUTTON_COLOR,
            NEXT_BUTTON_STROKE_COLOR,
            "EXIT",
            TEXT_COLOR,
            NEXT_BUTTON_HOVER_COLOR
        );
        this.addChild(this.exitButton);
    }

    update = (delta: number): void => {
        return;
    }

    exitButtonClickHandler = (): void => {
        window.close();
    }

    /**
     * Adds all custom event listeners.
     */
    addEventListeners = (): void => {
        this.exitButton.on("click", this.exitButtonClickHandler);
    }

    /**
     * Removes all custom event listeners.
     */
    removeEventListeners = (): void => {
        this.exitButton.off("click", this.exitButtonClickHandler);
    }
}