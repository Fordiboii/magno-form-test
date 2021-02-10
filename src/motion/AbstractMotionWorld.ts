import { Dot } from "../objects/Dot";
import * as PIXI from "pixi.js";
import { euclideanDistance } from "../utils/EuclideanDistance";
import { QuadTree } from "../utils/QuadTree";

export abstract class AbstractMotionWorld extends PIXI.Container {
    public dotsLeftContainer: PIXI.Container = new PIXI.Container();
    public dotsRightContainer: PIXI.Container = new PIXI.Container();
    public dotsLeft: Array<Dot>;
    public dotsRight: Array<Dot>;

    public patchLeft: PIXI.Graphics;
    public patchRight: PIXI.Graphics;
    public patchLeftMask: PIXI.Graphics;
    public patchRightMask: PIXI.Graphics;
    public patchGap: number;
    public patchLineThickness: number;

    protected leftMinWidth: number;
    protected leftMaxWidth: number;

    protected patchMinHeight: number;
    protected patchMaxHeight: number;

    protected rightMinWidth: number;
    protected rightMaxWidth: number;

    protected coherentPatchSide: string;

    protected coherencePercent: number;

    protected numberOfDots: number;
    protected dotSpacing: number;
    protected dotRadius: number;
    protected dotMaxAliveTime: number;

    protected maxRunningTime: number;
    protected runningTime: number;

    protected quadTree: QuadTree;

    constructor() {
        super();
        this.patchLineThickness = 1; //TODO: move to settings
        this.runningTime = 0;

        this.dotsLeft = new Array<Dot>();
        this.dotsRight = new Array<Dot>();

        this.coherencePercent = 75; // TODO: move to settings

        this.numberOfDots = 300; // TODO: move to settings
        this.dotRadius = 1; // TODO: move to settings
        this.dotSpacing = 1; // TODO: move to settings
        this.maxRunningTime = 5; // TODO: move to settings
        this.dotMaxAliveTime = 0.085 // TODO: move to settings
    }

    abstract update(delta: number): void;

    abstract createPatches(): void;

    abstract createDots(): void;

    updateDots = (delta: number): void => {
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
        })
    }

    calculateMaxMin = (): void => {
        this.leftMinWidth = this.patchLeft.x + this.patchLineThickness;
        this.leftMaxWidth = (this.leftMinWidth + this.patchLeft.width) - (3 * this.patchLineThickness);

        this.patchMinHeight = this.patchLeft.y + this.patchLineThickness;
        this.patchMaxHeight = (this.patchLeft.y + this.patchLeft.height) - this.patchLineThickness;

        this.rightMinWidth = this.patchRight.x + this.patchLineThickness;
        this.rightMaxWidth = (this.patchRight.x + this.patchRight.width) - (3 * this.patchLineThickness);
    }

    createMasks = () => {
        this.patchLeftMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.leftMinWidth,
                this.patchMinHeight,
                this.leftMaxWidth - this.leftMinWidth,
                this.patchMaxHeight - this.patchMinHeight
            )
            .endFill();

        this.patchRightMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.rightMinWidth,
                this.patchMinHeight,
                this.rightMaxWidth - this.rightMinWidth,
                this.patchMaxHeight - this.patchMinHeight
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
     * Checks if a dot in the left patch is colliding with a wall
     * @param dot to test for wall collision
     */
    checkWallCollisionLeftPatch = (dot: Dot): void => {
        if (dot.x - dot.radius <= this.leftMinWidth) {
            dot.collideWithWall(this.leftMinWidth, dot.y);
        } else if (dot.x + dot.radius >= this.leftMaxWidth) {
            dot.collideWithWall(this.leftMaxWidth, dot.y);
        } else if (dot.y - dot.radius <= this.patchMinHeight) {
            dot.collideWithWall(dot.x, this.patchMinHeight);
        } else if (dot.y + dot.radius >= this.patchMaxHeight) {
            dot.collideWithWall(dot.x, this.patchMaxHeight);
        }
    }

    /**
     * Checks if a dot in the right patch is colliding with a wall
     * @param dot to test for wall collision
     */
    checkWallCollisionRightPatch = (dot: Dot): void => {
        if (dot.x - dot.radius <= this.rightMinWidth) {
            dot.collideWithWall(this.rightMinWidth, dot.y);
        } else if (dot.x + dot.radius >= this.rightMaxWidth) {
            dot.collideWithWall(this.rightMaxWidth, dot.y);
        } else if (dot.y - dot.radius <= this.patchMinHeight) {
            dot.collideWithWall(dot.x, this.patchMinHeight);
        } else if (dot.y + dot.radius >= this.patchMaxHeight) {
            dot.collideWithWall(dot.x, this.patchMaxHeight);
        }
    }
}
