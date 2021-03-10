import * as PIXI from 'pixi.js';
import { Direction, WorldState } from '../utils/Enums';
import { AbstractMotionWorld } from './AbstractMotionWorld';
import { rando, randoSequence } from '@nastyox/rando.js';
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

        this.quadTree = this.createQuadTree(this.patchLeft.x, this.patchLeft.y, this.patchLeft.width * 2 + this.patchGap, this.patchLeft.height);

        this.calculateMaxMin();
        this.createDotContainerMasks();

        this.leftGridPoints =
            this.createGridPoints(
                this.leftMinX + this.dotRadius,
                this.leftMaxX - this.dotRadius,
                this.patchMinY + this.dotRadius,
                this.patchMaxY - this.dotRadius,
                2 * this.dotRadius + this.dotSpacing
            );
        this.rightGridPoints =
            this.createGridPoints(
                this.rightMinX + this.dotRadius,
                this.rightMaxX - this.dotRadius,
                this.patchMinY + this.dotRadius,
                this.patchMaxY - this.dotRadius,
                2 * this.dotRadius + this.dotSpacing
            );

        this.createDots();

        this.currentState = WorldState.RUNNING;
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

    /**
     * Creates a new quadtree from the given rectangle bounds.
     * @param x rectangle left bound
     * @param y rectangle top bound
     * @param width rectangle right bound
     * @param height rectangle bottom bound
     * @returns a new instance of QuadTree
     */
    createQuadTree = (x: number, y: number, width: number, height: number): QuadTree => {
        return new QuadTree(0, new PIXI.Rectangle(x, y, width, height));
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

        // shuffle grid points. Used to get initial dot positions.
        let shuffledLeftGridPoints = randoSequence(this.leftGridPoints);
        let shuffledRightGridPoints = randoSequence(this.rightGridPoints);

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

            // get initial position
            dotPosition = shuffledLeftGridPoints[i].value;

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

            // get initial position
            dotPosition = shuffledRightGridPoints[i].value;

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
     * Updates the coherency percentage by a decibel factor.
     * Decreases coherency if answer is correct, increases otherwise.
     * @param factor decibel factor used to increase or decrease coherency level.
     * @param isCorrectAnswer if the user chose the patch with coherent dots.
     */
    updateCoherency = (factor: number, isCorrectAnswer: boolean): void => {
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

    /**
     * Creates a grid within a rectangle area with grid lines that are equally spaced.
     * Creates the points found on intersecting grid lines.
     * @param xMin left bound of area. Float.
     * @param xMax right bound of area. Float.
     * @param yMin top bound of area. Float.
     * @param yMax bottom bound of area. Float.
     * @param spacing distance between each grid line. Integer.
     * @returns an array of points where grid lines intersect
     */
    createGridPoints = (xMin: number, xMax: number, yMin: number, yMax: number, spacing: number): Array<[number, number]> => {
        let gridPoints: Array<[number, number]> = [];

        const width: number = Math.floor(xMax - xMin);
        const height: number = Math.floor(yMax - yMin);

        const xLines: number = width / spacing;
        const yLines: number = height / spacing;

        if (xLines * yLines < this.numberOfDots) {
            throw new Error("Cannot spawn dots with the current settings.\nEither there are too many dots, too much dot spacing or too small patches.");
        }

        const xOffset: number = width % spacing;
        const yOffset: number = height % spacing;

        const startX: number = Math.ceil(xMin + (xOffset / 2));
        const startY: number = Math.ceil(yMin + (yOffset / 2));

        for (let i = 0; i < xLines; i++) {
            for (let j = 0; j < yLines; j++) {
                gridPoints.push([startX + i * spacing, startY + j * spacing])
            }
        }

        return gridPoints
    }

    /**
     * Function that draws grid lines. For debugging purposes. 
     */
    debugGridPoints = (startX: number, startY: number, xLines: number, yLines: number, xOffset: number, yOffset: number, spacing: number): void => {
        const lineThickness: number = 1;
        const debugColor: number = 0xFF00FF;

        const line: PIXI.Graphics = new PIXI.Graphics();
        line.lineStyle(lineThickness, debugColor);

        line.position.set(startX, startY)
        for (let i = 0; i < xLines; i++) {
            line.moveTo(i * spacing, 0)
                .lineTo(i * spacing, yLines * spacing - yOffset)
        }

        line.position.set(startX, startY)
        for (let i = 0; i < yLines; i++) {
            line.moveTo(0, i * spacing)
                .lineTo(xLines * spacing - xOffset, i * spacing)
        }

        this.addChild(line);
    }
}
