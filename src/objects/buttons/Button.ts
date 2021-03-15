import * as PIXI from "pixi.js";
import { BUTTON_TEXT_COLOR } from "../../utils/Constants";

export class Button extends PIXI.Graphics {
    isMouseDown: boolean = false;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        buttonText?: string,
        buttonTextColor: number = BUTTON_TEXT_COLOR,
        hoverColor?: number,
        disabled: boolean = false,
        texture?: PIXI.Texture,
    ) {
        super();
        this.position.set(x - width / 2, y - height / 2)
        this.beginFill(color)
            .drawRect(0, 0, width, height)
            .endFill();
        this.interactive = disabled ? false : true;
        this.buttonMode = disabled ? false : true;

        if (buttonText) {
            const onClickTextOffset: number = 3;
            const text: PIXI.Text = new PIXI.Text(buttonText, { fill: buttonTextColor });
            text.roundPixels = true;
            text.anchor.set(0.5);
            text.x = width / 2;
            text.y = height / 2;
            this.addChild(text);

            this.on("mousedown", (): void => {
                if (!this.isMouseDown) {
                    text.y += onClickTextOffset;
                    this.isMouseDown = true;
                }
            })

            this.on("mouseout", (): void => {
                if (this.isMouseDown) {
                    text.y -= onClickTextOffset;
                }
            })

            this.on("mouseover", (): void => {
                if (this.isMouseDown) {
                    text.y += onClickTextOffset;
                }
            })

            this.on("mouseupoutside", (): void => {
                this.isMouseDown = false;
            })

            this.on("touchstart", (): void => {
                if (!this.isMouseDown) {
                    text.y += onClickTextOffset;
                    this.isMouseDown = true;
                }
            })

            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    if (this.isMouseDown) {
                        text.y -= onClickTextOffset;
                        this.isMouseDown = false;
                    }
                }
            })
        }

        if (hoverColor) {
            this.on("mouseover", (): void => {
                this.clear()
                    .beginFill(hoverColor)
                    .drawRect(0, 0, width, height)
                    .endFill();
            });
            this.on("mouseout", (): void => {
                this.clear()
                    .beginFill(color)
                    .drawRect(0, 0, width, height)
                    .endFill();
            });
            this.on("touchstart", (): void => {
                this.clear()
                    .beginFill(hoverColor)
                    .drawRect(0, 0, width, height)
                    .endFill();
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    this.clear()
                        .beginFill(color)
                        .drawRect(0, 0, width, height)
                        .endFill();
                }
            });
        }
    }
}