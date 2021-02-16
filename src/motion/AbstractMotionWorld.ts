import { Dot } from "../objects/Dot";
import { Patch } from "../objects/Patch";
import * as PIXI from "pixi.js";
import { euclideanDistance } from "../utils/EuclideanDistance";
import { QuadTree } from "../utils/QuadTree";
import { rando } from "@nastyox/rando.js";
import { WorldStates } from "../utils/Enums";
import { PATCH_OUTLINE_THICKNESS } from "../utils/Constants";

export abstract class AbstractMotionWorld extends PIXI.Container {
    protected currentState: WorldStates;

    public dotsLeftContainer: PIXI.Container = new PIXI.Container();
    public dotsRightContainer: PIXI.Container = new PIXI.Container();
    public dotsLeft: Array<Dot>;
    public dotsRight: Array<Dot>;

    public patchLeft: Patch;
    public patchRight: Patch;
    public patchLeftMask: PIXI.Graphics;
    public patchRightMask: PIXI.Graphics;
    public patchGap: number;

    protected leftMinX: number;
    protected leftMaxX: number;

    protected patchMinY: number;
    protected patchMaxY: number;

    protected rightMinX: number;
    protected rightMaxX: number;

    protected coherentPatchSide: string;

    protected coherencePercent: number;
    protected dotKillPercentage: number;

    protected numberOfDots: number;
    protected dotSpacing: number;
    protected dotRadius: number;
    protected dotMaxAliveTime: number;

    protected maxRunTime: number;
    protected runTime: number;

    protected quadTree: QuadTree;

    constructor() {
        super();
        this.currentState = WorldStates.RUNNING;

        this.runTime = 0;

        this.dotsLeft = new Array<Dot>();
        this.dotsRight = new Array<Dot>();

        this.coherencePercent = 75; // TODO: move to settings
        this.dotKillPercentage = 10; // TODO: move to settings

        this.numberOfDots = 300; // TODO: move to settings
        this.dotRadius = 1; // TODO: move to settings
        this.dotSpacing = 1; // TODO: move to settings
        this.maxRunTime = 5000; // TODO: move to settings
        this.dotMaxAliveTime = 85; // TODO: move to settings
    }

    abstract update(delta: number): void;

    abstract createPatches(): void;

    abstract createDots(): void;

    reset = (): void => {
        this.runTime = 0;
        this.dotsLeft.forEach(dot => dot.destroy());
        this.dotsRight.forEach(dot => dot.destroy());
        this.dotsLeft = new Array<Dot>();
        this.dotsRight = new Array<Dot>();
        this.createDots();
        this.currentState = WorldStates.RUNNING;
    }

    paused = (): void => {
        if (this.runTime >= this.maxRunTime) {
            this.runTime = 0;
            this.dotsLeft.forEach(dot => dot.destroy());
            this.dotsRight.forEach(dot => dot.destroy());
            this.dotsLeft = new Array<Dot>();
            this.dotsRight = new Array<Dot>();
        }
    }

    updateDots = (delta: number): void => {
        this.runTime += delta;
        if (this.runTime >= this.maxRunTime) {
            this.currentState = WorldStates.PAUSED;
            return;
        }

        // clear quadtree
        this.quadTree.clear()

        // insert dots into quadtree and check random dots for wall collision. 
        for (let i = 0; i < this.dotsLeft.length; i++) {
            let dot: Dot = this.dotsLeft[i];
            this.quadTree.insert(dot);
            dot.update(delta);
            if (dot.isRandom) {
                this.checkWallCollisionLeftPatch(dot);
            }
        }

        for (let i = 0; i < this.dotsLeft.length; i++) {
            let dot: Dot = this.dotsLeft[i];
            let possibleCollisions: Array<Dot> = new Array<Dot>();
            possibleCollisions = this.quadTree.retrieve(possibleCollisions, dot);
            possibleCollisions.forEach(otherDot => {
                dot.collideWithDot(otherDot);
            });
        }

        this.dotsLeft.forEach(dot => {
            dot.updatePosition(delta);
            if (dot.aliveTimer <= 0) {
                dot.resetAliveTimer();
                let dotPosition: [number, number] =
                    this.getFreeSpotInPatch(
                        this.leftMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.leftMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius,
                        this.dotsLeft
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        });

        // clear quadtree
        this.quadTree.clear()

        // insert dots into quadtree and check random dots for wall collision. 
        for (let i = 0; i < this.dotsRight.length; i++) {
            let dot: Dot = this.dotsRight[i];
            this.quadTree.insert(dot);
            dot.update(delta);
            if (dot.isRandom) {
                this.checkWallCollisionRightPatch(dot);
            }
        }

        for (let i = 0; i < this.dotsRight.length; i++) {
            let dot: Dot = this.dotsRight[i];
            let possibleCollisions: Array<Dot> = new Array<Dot>();
            possibleCollisions = this.quadTree.retrieve(possibleCollisions, dot);
            possibleCollisions.forEach(otherDot => {
                dot.collideWithDot(otherDot);
            });
        }

        this.dotsRight.forEach(dot => {
            dot.updatePosition(delta);
            if (dot.aliveTimer <= 0) {
                dot.resetAliveTimer();
                let dotPosition: [number, number] =
                    this.getFreeSpotInPatch(
                        this.rightMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.rightMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius,
                        this.dotsLeft
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        })
    }

    calculateMaxMin = (): void => {
        this.leftMinX = this.patchLeft.x + PATCH_OUTLINE_THICKNESS;
        this.leftMaxX = (this.leftMinX + this.patchLeft.width) - (3 * PATCH_OUTLINE_THICKNESS);

        this.patchMinY = this.patchLeft.y + PATCH_OUTLINE_THICKNESS;
        this.patchMaxY = (this.patchLeft.y + this.patchLeft.height) - PATCH_OUTLINE_THICKNESS;

        this.rightMinX = this.patchRight.x + PATCH_OUTLINE_THICKNESS;
        this.rightMaxX = (this.patchRight.x + this.patchRight.width) - (3 * PATCH_OUTLINE_THICKNESS);
    }

    createDotContainerMasks = () => {
        this.patchLeftMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.leftMinX,
                this.patchMinY,
                this.leftMaxX - this.leftMinX,
                this.patchMaxY - this.patchMinY
            )
            .endFill();

        this.patchRightMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.rightMinX,
                this.patchMinY,
                this.rightMaxX - this.rightMinX,
                this.patchMaxY - this.patchMinY
            )
            .endFill()

        this.dotsLeftContainer.mask = this.patchLeftMask;
        this.dotsRightContainer.mask = this.patchRightMask;
        this.addChild(this.dotsLeftContainer, this.dotsRightContainer);
    }

    /**
     * Checks if there already is a dot at location
     * @param x new dot's x position
     * @param y new dot's y position
     * @param dots the array containing dots to compare with
     * @return true if spot is free
     */
    freeSpot = (x: number, y: number, dots: Array<Dot>): boolean => {
        for (let i = 0; i < dots.length; i++) {
            if (euclideanDistance(x, y, dots[i].x, dots[i].y) <= (this.dotSpacing + 2 * this.dotRadius)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Finds a vacant spot within a patch to place a new dot.
     * @param minX min x of patch
     * @param minY min y of patch
     * @param maxX max x of patch
     * @param maxY max y of patch
     * @param dots dots in patch
     */
    getFreeSpotInPatch = (minX: number, minY: number, maxX: number, maxY: number, dots: Array<Dot>): [number, number] => {
        let x, y: number;
        do {
            x = rando() * (maxX - minX) + minX;
            y = rando() * (maxY - minY) + minY;
        } while (!this.freeSpot(x, y, dots))
        return [x, y]
    }

    /**
     * Checks if a dot in the left patch is colliding with a wall
     * @param dot to test for wall collision
     */
    checkWallCollisionLeftPatch = (dot: Dot): void => {
        if (dot.x - dot.radius <= this.leftMinX) {
            dot.collideWithWall(this.leftMinX, dot.y);
        } else if (dot.x + dot.radius >= this.leftMaxX) {
            dot.collideWithWall(this.leftMaxX, dot.y);
        } else if (dot.y - dot.radius <= this.patchMinY) {
            dot.collideWithWall(dot.x, this.patchMinY);
        } else if (dot.y + dot.radius >= this.patchMaxY) {
            dot.collideWithWall(dot.x, this.patchMaxY);
        }
    }

    /**
     * Checks if a dot in the right patch is colliding with a wall
     * @param dot to test for wall collision
     */
    checkWallCollisionRightPatch = (dot: Dot): void => {
        if (dot.x - dot.radius <= this.rightMinX) {
            dot.collideWithWall(this.rightMinX, dot.y);
        } else if (dot.x + dot.radius >= this.rightMaxX) {
            dot.collideWithWall(this.rightMaxX, dot.y);
        } else if (dot.y - dot.radius <= this.patchMinY) {
            dot.collideWithWall(dot.x, this.patchMinY);
        } else if (dot.y + dot.radius >= this.patchMaxY) {
            dot.collideWithWall(dot.x, this.patchMaxY);
        }
    }
}
