import * as PIXI from "pixi.js";
import { SPRITE_BUTTON_CLICKED_TINT, SPRITE_BUTTON_DISABLE_TINT_COLOR } from "../../utils/Constants";

export class SpriteButton extends PIXI.Sprite {
    isMouseDown: boolean = false;

    constructor(
        x: number,
        y: number,
        scale: number,
        texture: PIXI.Texture,
        hoverColor?: number,
        disabled: boolean = false,
    ) {
        super(texture);
        this.interactive = disabled ? false : true;
        this.buttonMode = disabled ? false : true;
        this.position.set(x, y)
        this.scale.set(scale)

        this.on("mousedown", (): void => {
            if (!this.isMouseDown) {
                this.tint = SPRITE_BUTTON_CLICKED_TINT;
                this.isMouseDown = true;
            }
        })

        this.on("mouseupoutside", (): void => {
            this.isMouseDown = false;
        })

        this.on("touchend", (): void => {
            this.tint = SPRITE_BUTTON_DISABLE_TINT_COLOR;
        })

        if (hoverColor) {
            this.on("mouseup", (): void => {
                if (this.isMouseDown) {
                    this.tint = hoverColor;
                    this.isMouseDown = false;
                }
            })
            this.on("mouseover", (): void => {
                if (this.isMouseDown) {
                    this.tint = SPRITE_BUTTON_CLICKED_TINT;
                } else {
                    this.tint = hoverColor;
                }
            });
            this.on("mouseout", (): void => {
                this.tint = SPRITE_BUTTON_DISABLE_TINT_COLOR;
            });
            this.on("touchstart", (): void => {
                this.tint = SPRITE_BUTTON_CLICKED_TINT;
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    this.tint = SPRITE_BUTTON_DISABLE_TINT_COLOR;
                }
            });
        } else {
            this.on("mouseup", (): void => {
                if (this.isMouseDown) {
                    this.tint = SPRITE_BUTTON_DISABLE_TINT_COLOR;
                    this.isMouseDown = false;
                }
            })
            this.on("mouseover", (): void => {
                if (this.isMouseDown) {
                    this.tint = SPRITE_BUTTON_CLICKED_TINT;
                }
            })
            this.on("mouseout", (): void => {
                if (this.isMouseDown) {
                    this.tint = SPRITE_BUTTON_DISABLE_TINT_COLOR;
                }
            })
            this.on("touchstart", (): void => {
                if (!this.isMouseDown) {
                    this.tint = SPRITE_BUTTON_CLICKED_TINT;
                    this.isMouseDown = true;
                }
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    if (this.isMouseDown) {
                        this.isMouseDown = false;
                    }
                }
            });
        }
    }
}