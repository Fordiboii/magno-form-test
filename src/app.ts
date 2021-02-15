import * as PIXI from 'pixi.js';
import { MotionWorld } from './motion/MotionWorld';
import { Dot } from './objects/Dot';
import MainLoop from 'mainloop.js';
import { DEVICE_PIXEL_RATIO } from './utils/Constants';

export class GameApp {
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    private activeGameObjects: Array<Dot | MotionWorld> = [];

    constructor(width: number, height: number) {
        // create root container and renderer
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer({
            width: width,
            height: height,
            resolution: DEVICE_PIXEL_RATIO, // for retina display devices
            autoDensity: true, // for retina display devices
        });

        // add renderer view to document body
        window.document.body.appendChild(this.renderer.view)

        // set timestep (in ms) the app should simulate between each frame.
        MainLoop.setSimulationTimestep(20);
        // set max fps.
        MainLoop.setMaxAllowedFPS(100);

        // warn if the browser doesn't support the Page Visibility API and revert to onblur and onfocus events.
        if (document.hidden === undefined) {
            console.log("This website requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.")
            window.onblur = () => MainLoop.stop();
            window.onfocus = () => MainLoop.start();
        } else {
            // stop running if the tab is hidden and start if made visible.
            window.addEventListener("visibilitychange", () => {
                if (window.document.visibilityState == "hidden") {
                    MainLoop.stop();
                } else if (window.document.visibilityState == "visible") {
                    MainLoop.start();
                }
            })
        }

        // add resize event listener
        window.addEventListener('resize', this.resize);

        // load assets
        const loader = PIXI.Loader.shared;
        loader.onError.add((err, _loader, resource) => { console.log(err, resource) });
        loader.onComplete.once(() => {
            // initialize game
            this.setup();
            // start game loop
            MainLoop.start();
        });
        loader
            .add('dot', './assets/dot.png')
            .load()
    }

    private setup = (): void => {
        // set update and render methods.
        MainLoop.setUpdate((delta: number) => this.gameLoop(delta));
        MainLoop.setDraw(this.render);

        // add motion world to stage and model
        const motionWorld: MotionWorld = new MotionWorld();
        this.stage.addChild(motionWorld);
        this.activeGameObjects.push(motionWorld);
    }

    private gameLoop = (delta: number): void => {
        // update model
        this.activeGameObjects.forEach(gameObject => {
            gameObject.update(delta);
        });

        // log FPS
        let fps = Math.round(MainLoop.getFPS());
        console.log(fps);

        // update current game state
        // this.state();
    }

    private render = (): void => {
        this.renderer.render(this.stage);
    }

    private resize = (): void => {
        this.renderer.resize(window.innerWidth, window.innerHeight);
    }
}
