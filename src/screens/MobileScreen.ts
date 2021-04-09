import * as PIXI from "pixi.js";
import { BACKGROUND_COLOR, TEXT_COLOR } from "../utils/Constants";
import { Settings } from "../utils/Settings";

export class MobileScreen extends PIXI.Container {
    backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    mobileSprite: PIXI.Sprite;
    tabletSprite: PIXI.Sprite;
    desktopSprite: PIXI.Sprite;
    text: PIXI.Text;

    constructor() {
        super();
        const width: number = window.innerWidth;
        const height: number = window.innerHeight;

        // create abort and checkmark sprites
        const abortSprite: PIXI.Sprite = PIXI.Sprite.from("../assets/sprites/abort.png");
        abortSprite.anchor.set(0.5);
        abortSprite.width = abortSprite.height = Settings.WINDOW_WIDTH_PX * 0.55;
        const checkMarkSprite1: PIXI.Sprite = PIXI.Sprite.from("../assets/sprites/green-checkmark-line.png");
        checkMarkSprite1.anchor.set(0.5, 1);
        checkMarkSprite1.width = checkMarkSprite1.height = Settings.WINDOW_WIDTH_PX * 0.5;
        const checkMarkSprite2: PIXI.Sprite = PIXI.Sprite.from("../assets/sprites/green-checkmark-line.png");
        checkMarkSprite2.anchor.set(0.5, 1);
        checkMarkSprite2.width = checkMarkSprite2.height = Settings.WINDOW_WIDTH_PX * 0.6;

        // add background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add mobile device sprite
        this.mobileSprite = PIXI.Sprite.from("../assets/sprites/mobile-phone.png");
        this.mobileSprite.anchor.set(0.5, 1);
        this.mobileSprite.x = Settings.WINDOW_WIDTH_PX / 2;
        this.mobileSprite.y = Settings.WINDOW_HEIGHT_PX / 3;
        this.mobileSprite.scale.set(0.2);
        abortSprite.y = - this.mobileSprite.height * 1300;
        this.mobileSprite.addChild(abortSprite);
        this.addChild(this.mobileSprite)

        // add text
        this.text = new PIXI.Text(
            "Woops, it looks like you are using a mobile device.\n\n" +
            "This site is only supported for desktop PCs and tablet devices.",
            {
                fontSize: Settings.FONT_SIZE * 3,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.TUTORIAL_TEXT_WIDTH,
                lineHeight: 0
            }
        );
        this.text.anchor.set(0.5, 0.5);
        this.text.x = this.mobileSprite.x;
        this.text.y = Settings.WINDOW_HEIGHT_PX / 2;
        this.text.roundPixels = true;
        this.addChild(this.text);

        // add desktop and tablet sprites
        const desktopTabletSpacing: number = Settings.WINDOW_WIDTH_PX / 6;

        this.desktopSprite = PIXI.Sprite.from("./assets/sprites/computer-laptop.png");
        this.desktopSprite.anchor.set(0.5, 1);
        this.desktopSprite.x = this.mobileSprite.x - desktopTabletSpacing;
        this.desktopSprite.y = Settings.WINDOW_HEIGHT_PX * 4 / 5;
        this.desktopSprite.scale.set(0.3);
        checkMarkSprite1.y = -this.desktopSprite.height * 200;
        this.desktopSprite.addChild(checkMarkSprite1);
        this.addChild(this.desktopSprite);

        this.tabletSprite = PIXI.Sprite.from("./assets/sprites/device-tablet.png");
        this.tabletSprite.anchor.set(0.5, 1);
        this.tabletSprite.x = this.mobileSprite.x + desktopTabletSpacing;
        this.tabletSprite.y = this.desktopSprite.y;
        this.tabletSprite.scale.set(0.2);
        checkMarkSprite2.y = -this.tabletSprite.height * 800;
        this.tabletSprite.addChild(checkMarkSprite2);
        this.addChild(this.tabletSprite);
    }

    update = (delta: number): void => {
        return;
    }

    addEventListeners = (): void => {
        return;
    }

    removeEventListeners = (): void => {
        return;
    }
}