import * as PIXI from "pixi.js";
import { BUTTON_DISABLED_COLOR, TEXT_BUTTON_ROUNDING_RADIUS, TEXT_COLOR } from "../../utils/Constants";

export class TextButton extends PIXI.Graphics {
    buttonWidth: number;
    buttonHeight: number;
    isMouseDown: boolean = false;
    color: number;
    buttonText: string | undefined;
    buttonTextColor: number;
    hoverColor: number | undefined;
    disabled: boolean;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        buttonText?: string,
        buttonTextColor: number = TEXT_COLOR,
        hoverColor?: number,
        disabled: boolean = false,
    ) {
        super();
        this.buttonWidth = width;
        this.buttonHeight = height;
        this.color = color;
        this.buttonTextColor = buttonTextColor;
        this.disabled = disabled;
        if (buttonText) this.buttonText = buttonText;
        if (hoverColor) this.hoverColor = hoverColor;

        this.interactive = disabled ? false : true;
        this.buttonMode = disabled ? false : true;
        this.position.set(x - width / 2, y - height / 2)
        this.beginFill(color)
            .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
            .endFill();

        if (buttonText) {
            const onClickTextOffset: number = 3;
            const text: PIXI.Text = new PIXI.Text(
                buttonText,
                {
                    fontName: "Helvetica-Normal",
                    fontSize: 26,
                    fill: buttonTextColor
                }
            );
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

            this.on("mouseup", (): void => {
                if (this.isMouseDown) {
                    text.y -= onClickTextOffset;
                    this.isMouseDown = false;
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
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                    .endFill();
            });
            this.on("mouseout", (): void => {
                this.clear()
                    .beginFill(color)
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                    .endFill();
            });
            this.on("touchstart", (): void => {
                this.clear()
                    .beginFill(hoverColor)
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                    .endFill();
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    this.clear()
                        .beginFill(color)
                        .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                        .endFill();
                }
            });
        }
    }

    /**
     * Makes the button gray and non-clickable.
     */
    disable = (): void => {
        this.interactive = false;
        this.buttonMode = false;
        this.clear()
            .beginFill(BUTTON_DISABLED_COLOR)
            .drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, TEXT_BUTTON_ROUNDING_RADIUS)
            .endFill();
    }
}