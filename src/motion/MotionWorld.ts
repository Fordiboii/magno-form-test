import * as PIXI from 'pixi.js';
import { Direction } from '../utils/Enums';
import { AbstractMotionWorld } from './AbstractMotionWorld';
import { rando } from '@nastyox/rando.js';
import { Dot } from '../objects/Dot';
import { QuadTree } from '../utils/QuadTree';

export class MotionWorld extends AbstractMotionWorld {
    constructor() {
        super();
        this.createPatches();
        this.createQuadTree();
        this.calculateMaxMin();
        this.createMasks();
        this.createDots();
    }
    /**
     * Updates dots.
     * @param delta time between each frame in ms
     */
    update = (delta: number): void => {
        this.updateDots(delta);
    }

    createQuadTree = (): void => {
        this.quadTree =
            new QuadTree(
                0, new PIXI.Rectangle(this.patchLeft.x, this.patchLeft.y, this.patchLeft.width * 2 + this.patchGap, this.patchLeft.height)
            );
    }

    /**
     * Creates the left and right patches for placing dots
     */
    createPatches = (): void => {
        this.patchGap = 100; // TODO: calculate in utils/Psychophysics.ts
        const patchWidth: number = 200; // TODO: calculate in utils/Psychophysics.ts
        const patchHeight: number = 500; // TODO: calculate in utils/Psychophysics.ts

        const screenXCenter: number = window.innerWidth / 2; // TODO: get from utils/Settings.ts
        const screenYCenter: number = window.innerHeight / 2; // TODO: get from utils/Settings.ts

        const patchLeftX: number = screenXCenter - patchWidth - (this.patchGap / 2);
        const patchRightX: number = screenXCenter + (this.patchGap / 2);
        const patchY: number = screenYCenter - (patchHeight / 2);

        // draw left patch
        this.patchLeft = new PIXI.Graphics();
        this.patchLeft.position.set(patchLeftX, patchY)
        this.patchLeft
            .lineStyle(this.patchLineThickness, 0xFFFFFF)
            .beginFill()
            .drawRect(0, 0, patchWidth, patchHeight)
            .endFill();

        // draw right patch
        this.patchRight = new PIXI.Graphics();
        this.patchRight.position.set(patchRightX, patchY);
        this.patchRight
            .lineStyle(this.patchLineThickness, 0xFFFFFF)
            .beginFill()
            .drawRect(0, 0, patchWidth, patchHeight)
            .endFill();

        // add patches to container
        this.addChild(this.patchLeft, this.patchRight);
    }

    /**
     * Fills the left and right patches with dots at random locations.
     * One of the patches will be set to have coherently moving dots moving left and right.
     */
    createDots = (): void => {
        const dotsToKill: number = (this.dotKillPercentage * this.numberOfDots) / 100;
        let maxAliveTimeMultiplier: number = 1;
        let numberOfCoherentDots: number = 0;
        let currentCoherencePercent: number;
        let dotPosition: [number, number];

        // randomly choose patch to contain coherent dots
        this.coherentPatchSide = rando(1) ? Direction[0] : Direction[1];
        // randomly choose direction of coherent moving dots
        const coherentDirection: Direction = rando(1) ? Direction.RIGHT : Direction.LEFT;
        for (let i = 0; i < this.numberOfDots; i++) {
            // 
            if (i == dotsToKill * maxAliveTimeMultiplier) {
                maxAliveTimeMultiplier++;
            }
            // get current coherent dots percentage
            currentCoherencePercent = (numberOfCoherentDots / this.numberOfDots) * 100;
            // find a vacant spot to place the dot
            dotPosition =
                this.getFreeSpotInPatch(
                    this.leftMinX + this.dotRadius,
                    this.patchMinY + this.dotRadius,
                    this.leftMaxX - this.dotRadius,
                    this.patchMaxY - this.dotRadius,
                    this.dotsLeft
                )
            // add dot to left patch
            if (this.coherentPatchSide == "LEFT" && currentCoherencePercent < this.coherencePercent) {
                const dotSprite =
                    new Dot(dotPosition[0], dotPosition[1], this.dotRadius, coherentDirection, this.dotMaxAliveTime * maxAliveTimeMultiplier, PIXI.Loader.shared.resources['dot'].texture);
                // add to model
                this.dotsLeft.push(dotSprite);
                // add to stage
                this.dotsLeftContainer.addChild(dotSprite);
                numberOfCoherentDots++;
            } else {
                const dotSprite =
                    new Dot(dotPosition[0], dotPosition[1], this.dotRadius, Direction.RANDOM, this.dotMaxAliveTime * maxAliveTimeMultiplier, PIXI.Loader.shared.resources['dot'].texture);
                // add to model
                this.dotsLeft.push(dotSprite);
                // add to stage
                this.dotsLeftContainer.addChild(dotSprite);
            }
            // find a vacant spot to place the dot
            dotPosition =
                this.getFreeSpotInPatch(
                    this.rightMinX + this.dotRadius,
                    this.patchMinY + this.dotRadius,
                    this.rightMaxX - this.dotRadius,
                    this.patchMaxY - this.dotRadius,
                    this.dotsLeft
                )
            // add dot to right patch
            if (this.coherentPatchSide == "RIGHT" && currentCoherencePercent < this.coherencePercent) {
                const dotSprite =
                    new Dot(dotPosition[0], dotPosition[1], this.dotRadius, coherentDirection, this.dotMaxAliveTime * maxAliveTimeMultiplier, PIXI.Loader.shared.resources['dot'].texture);
                // add to model
                this.dotsRight.push(dotSprite);
                // add to stage
                this.dotsRightContainer.addChild(dotSprite);
                numberOfCoherentDots++;
            } else {
                const dotSprite: Dot =
                    new Dot(dotPosition[0], dotPosition[1], this.dotRadius, Direction.RANDOM, this.dotMaxAliveTime * maxAliveTimeMultiplier, PIXI.Loader.shared.resources['dot'].texture);
                // add to model
                this.dotsRight.push(dotSprite);
                // add to stage
                this.dotsRightContainer.addChild(dotSprite);
            }
        }
    }
}