import * as PIXI from 'pixi.js';
import { Settings } from '../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialSitDownScreen extends TutorialScreen {
    protected tutorialImage: PIXI.Sprite;

    constructor() {
        super();
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

        // disable/enable buttons
        this.backButton.disable();

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[0].texture = circleFilledTexture;
    }

    update = (): void => {
        return;
    }
}