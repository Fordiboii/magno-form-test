import * as PIXI from "pixi.js";
import { BACKGROUND_COLOR, LOADING_SPINNER_COLOR, NEXT_BUTTON_COLOR } from "../utils/Constants";
import { Settings } from "../utils/Settings";

export class LoadingScreen extends PIXI.Container {
    backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    logo: PIXI.Sprite;
    loadingSpinner: PIXI.Graphics;

    constructor() {
        super();
        // add background color
        this.backgroundColorSprite.width = Settings.WINDOW_WIDTH_PX;
        this.backgroundColorSprite.height = Settings.WINDOW_HEIGHT_PX;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add logo
        this.logo = PIXI.Sprite.from("../assets/images/magnologo.png");
        this.logo.anchor.set(0.5);
        this.logo.scale.set(Settings.WINDOW_WIDTH_PX / 2800);
        this.logo.position.set(Settings.WINDOW_WIDTH_PX / 2, Settings.WINDOW_HEIGHT_PX / 2 - Settings.WINDOW_HEIGHT_PX / 12);
        this.addChild(this.logo);

        // add loading spinner
        this.loadingSpinner = new PIXI.Graphics();
        this.loadingSpinner.position.set(Settings.WINDOW_WIDTH_PX / 2, Settings.WINDOW_HEIGHT_PX / 2 + Settings.WINDOW_HEIGHT_PX / 8);
        this.loadingSpinner.lineStyle(Settings.WINDOW_WIDTH_PX / 130, NEXT_BUTTON_COLOR, 0.5);
        this.loadingSpinner.drawCircle(0, 0, Settings.WINDOW_WIDTH_PX / 50);
        this.loadingSpinner.lineStyle(Settings.WINDOW_WIDTH_PX / 130, LOADING_SPINNER_COLOR);
        this.loadingSpinner.arc(0, 0, Settings.WINDOW_WIDTH_PX / 50, 0, Math.PI / 4);
        this.loadingSpinner.cacheAsBitmap = true;
        this.addChild(this.loadingSpinner);
    }

    update = (delta: number): void => {
        // rotate spinner
        this.loadingSpinner.rotation = (this.loadingSpinner.rotation + Math.PI / 30) % (2 * Math.PI);
    }

    addEventListeners = (): void => {
        return;
    }

    removeEventListeners = (): void => {
        return;
    }
}