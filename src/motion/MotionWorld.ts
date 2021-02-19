import * as PIXI from 'pixi.js';
import { Direction, WorldState } from '../utils/Enums';
import { AbstractMotionWorld } from './AbstractMotionWorld';
import { rando } from '@nastyox/rando.js';
import { Dot } from '../objects/Dot';
import { QuadTree } from '../utils/QuadTree';
import { Psychophysics } from '../utils/Psychophysics';
import { Settings } from '../utils/Settings';
import { Patch } from '../objects/Patch';
import { PATCH_OUTLINE_COLOR, PATCH_OUTLINE_THICKNESS } from '../utils/Constants';

export class MotionWorld extends AbstractMotionWorld {
    constructor() {
        super();
        this.createPatches();
        this.createQuadTree();
        this.calculateMaxMin();
        this.createDotContainerMasks();
        this.createDots();
    }
    /**
     * Updates dots.
     * @param delta time between each frame in ms
     */
    update = (delta: number): void => {
        if (this.currentState == WorldState.RUNNING) {
            this.updateDots(delta);
        } else if (this.currentState == WorldState.PAUSED) {
            this.paused();
        } else if (this.currentState == WorldState.FINISHED) {
            return;
        }
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
        this.patchGap = Psychophysics.getPatchGapInPixels();
        const patchWidth: number = Psychophysics.getPatchWidthInPixels();
        const patchHeight: number = Psychophysics.getPatchHeightInPixels();

        const screenXCenter: number = Settings.WINDOW_WIDTH_PX / 2;
        const screenYCenter: number = Settings.WINDOW_HEIGHT_PX / 2;

        const patchLeftX: number = screenXCenter - patchWidth - (this.patchGap / 2);
        const patchRightX: number = screenXCenter + (this.patchGap / 2);
        const patchY: number = screenYCenter - (patchHeight / 2);

        // create patches
        this.patchLeft = new Patch(patchLeftX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);
        this.patchRight = new Patch(patchRightX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);

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
            // Multiplier to give dots different respawn rate
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
                this.dotsLeftParticleContainer.addChild(dotSprite);
                numberOfCoherentDots++;
            } else {
                const dotSprite =
                    new Dot(dotPosition[0], dotPosition[1], this.dotRadius, Direction.RANDOM, this.dotMaxAliveTime * maxAliveTimeMultiplier, PIXI.Loader.shared.resources['dot'].texture);
                // add to model
                this.dotsLeft.push(dotSprite);
                // add to stage
                this.dotsLeftParticleContainer.addChild(dotSprite);
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
                this.dotsRightParticleContainer.addChild(dotSprite);
                numberOfCoherentDots++;
            } else {
                const dotSprite: Dot =
                    new Dot(dotPosition[0], dotPosition[1], this.dotRadius, Direction.RANDOM, this.dotMaxAliveTime * maxAliveTimeMultiplier, PIXI.Loader.shared.resources['dot'].texture);
                // add to model
                this.dotsRight.push(dotSprite);
                // add to stage
                this.dotsRightParticleContainer.addChild(dotSprite);
            }
        }
    }

    /**
     * Updates the coherency percentage by a decibel factor and the correct and wrong answer counters. 
     * Decreases coherency if answer is correct, increases otherwise.
     * @param factor decibel factor used to increase or decrease coherency level.
     * @param isCorrectAnswer if the user chose the patch with coherent dots.
     */
    updateCoherencyAndCounters = (factor: number, isCorrectAnswer: boolean): void => {
        let temp: number = this.coherencePercent * factor;

        if (isCorrectAnswer) {
            if (factor > 1) {
                temp -= this.coherencePercent;
                this.coherencePercent -= temp;
            } else {
                this.coherencePercent = temp;
            }
        } else {
            if (factor > 1) {
                this.coherencePercent = temp;
            } else {
                temp -= this.coherencePercent;
                this.coherencePercent -= temp;
            }
            if (this.coherencePercent > 100) {
                this.coherencePercent = 100;
            }
        }
    }
}
