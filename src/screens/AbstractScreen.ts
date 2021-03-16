import * as PIXI from "pixi.js";
import { MotionWorld } from "../motion/MotionWorld";

export abstract class AbstractScreen extends PIXI.Container {
    protected motionWorld: MotionWorld; //TODO: MotionWorld | MotionTrialWorld

    protected reversalPoints: number;
    protected maxSteps: number;

    protected prevStep: boolean;

    protected reversalCounter: number;
    protected stepCounter: number;
    protected correctAnswerCounter: number;
    protected wrongAnswerCounter: number;

    protected reversalValues: Array<number>;

    protected correctAnswerFactor: number;
    protected wrongAnswerFactor: number;

    protected abstract update(delta: number): void;

    protected keyDownHandler(event: KeyboardEvent): void { };

    protected keyUp(event: KeyboardEvent): void { };

    protected mouseDownHandler(patch: string): void { };

    protected touchStart(patch: string): void { };
}