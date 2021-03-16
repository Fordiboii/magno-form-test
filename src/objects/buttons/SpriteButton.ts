import * as PIXI from "pixi.js";

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

        const disableTintColor: number = 0xFFFFFF;

        this.on("touchstart", (): void => {
            if (!this.isMouseDown) {
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

        this.on("touchend", (): void => {
            this.tint = disableTintColor;
        })

        if (hoverColor) {
            this.on("mouseover", (): void => {
                this.tint = hoverColor;
            });
            this.on("mouseout", (): void => {
                this.tint = disableTintColor;
            });
            this.on("touchstart", (): void => {
                this.tint = hoverColor;
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    this.tint = disableTintColor;
                }
            });
        }
    }
}