import * as PIXI from 'pixi.js';
// import { loadGameAssets } from '../assets/assetLoader';
// import { MotionWorld } from './motion/MotionWorld';
// import { Dot } from './objects/Dot';

// type WorldObjects = Dot | MotionWorld;

export class GameApp {
    private renderer: PIXI.Renderer;
    private stage: PIXI.Container;
    private state: Function;
    // private activeGameObjects: Array<WorldObjects> = [];
    private activeRenderers: Array<any> = [];

    constructor(parent: HTMLElement, width: number, height: number) {
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer({
            width: width,
            height: height,
            resolution: window.devicePixelRatio, // for retina display devices
            autoDensity: true, // for retina display devices
        });

        parent.appendChild(this.renderer.view)
        // parent.replaceChild(this.renderer.view, parent.lastElementChild); // Hack for parcel HMR

        // resize function
        const resize = (): void => {
            this.renderer.resize(window.innerWidth, window.innerHeight);
        }

        // add resize event listener
        window.addEventListener('resize', resize);

        // load assets
        const loader = PIXI.Loader.shared;
        loader.onError.add((err, _loader, resource) => { console.log(err, resource) });
        loader
            .add('dot', './assets/dot.png')
            .load()
        loader.onComplete.once(() => {
            // initialize game
            this.setup();

            // create ticker
            const ticker = new PIXI.Ticker();
            ticker.add(delta => {
                this.gameLoop(delta);
            });
            ticker.start();
        });
    }

    private setup(): void {
        // const sceneContainer: PIXI.Container = new PIXI.Container();

        // this.stage.addChild(sceneContainer);
        // const motionWorld: MotionWorld = new MotionWorld();
        // this.stage.addChild(motionWorld);
        // // const motionRenderer: MotionRenderer = new MotionRenderer(sceneContainer, motionWorld);
        // this.activeGameObjects.push(motionWorld);

        // const texture = PIXI.Texture.from('assets/images/dot.png');
        // const dotSprite: PIXI.Sprite = PIXI.Sprite.from(texture); //TODO: Proper asset loading.
        // sceneContainer.addChild(dotSprite);
    }

    private gameLoop(delta: number): void {
        console.log("gamelooping!")

        this.stage.addChild(new PIXI.Sprite(PIXI.Loader.shared.resources['dot'].texture))

        // update model
        // this.activeGameObjects.forEach(gameObject => {
        //     gameObject.update(delta);
        // });

        // update current game state
        // this.state();

        // render stage
        this.renderer.render(this.stage);
    }
}
