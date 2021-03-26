import * as PIXI from 'pixi.js';
import MainLoop from 'mainloop.js';
import { DEVICE_PIXEL_RATIO, SIMULATION_TIMESTEP } from './utils/Constants';
import { MotionScreen } from './screens/MotionScreen';
import { TutorialSitDownScreen } from './screens/TutorialSitDownScreen';
import { TutorialTaskScreen } from './screens/TutorialTaskScreen';
import { TutorialTrialScreen } from './screens/TutorialTrialScreen';
import { Screens } from "./interfaces/screens";

export class GameApp {
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public screens: Screens;
    public currentScreen: MotionScreen | TutorialSitDownScreen | TutorialTaskScreen | TutorialTrialScreen;

    constructor(width: number, height: number) {
        // create root container and renderer
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer({
            width: width,
            height: height,
            resolution: DEVICE_PIXEL_RATIO, // for retina display devices
            autoDensity: true, // for retina display devices
        });

        // For using pixijs inspection dev tool.
        (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ && (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });

        // add renderer view to document body
        window.document.body.appendChild(this.renderer.view)

        // // set timestep (in ms) the app should simulate between each frame.
        MainLoop.setSimulationTimestep(SIMULATION_TIMESTEP);
        // // set max fps.
        // MainLoop.setMaxAllowedFPS(100);

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
            .add('dot', './assets/sprites/dot.png')
            .add('backArrow', './assets/sprites/backArrow.png')
            .add('circleHollow', './assets/sprites/circle_hollow.png')
            .add('circleFilled', './assets/sprites/circle_filled.png')
            .add('tutorialArrow', './assets/sprites/tutorialArrow.png')
            .add('sitDownImage', './assets/images/TutorialSitDown-01.png')
            .add('helvetica', './assets/fonts/helvetica-bitmap.fnt')
            .load()
    }

    private setup = (): void => {
        // set update and render methods.
        MainLoop.setUpdate((delta: number) => this.gameLoop(delta));
        MainLoop.setDraw(this.render);

        // add tutorial sit-down screen to model
        const tutorialSitDownScreen: TutorialSitDownScreen = new TutorialSitDownScreen(this);
        const tutorialTaskScreen: TutorialTaskScreen = new TutorialTaskScreen(this);
        const tutorialTrialScreen: TutorialTrialScreen = new TutorialTrialScreen(this);
        const motionScreen: MotionScreen = new MotionScreen(this);

        this.screens = {
            tutorialSitDownScreen: tutorialSitDownScreen,
            tutorialTaskScreen: tutorialTaskScreen,
            tutorialTrialScreen: tutorialTrialScreen,
            motionScreen: motionScreen
        };

        // add screens to stage
        this.stage.addChild(tutorialSitDownScreen, tutorialTaskScreen, tutorialTrialScreen, motionScreen);

        // set current screen and hide the others
        this.currentScreen = this.screens.tutorialSitDownScreen;
        this.screens.tutorialTaskScreen.visible = false;
        this.screens.tutorialTrialScreen.visible = false;
        this.screens.motionScreen.visible = false;

        // add event listeners 
        this.currentScreen.addEventListeners();
    }

    private gameLoop = (delta: number): void => {
        // update model
        this.currentScreen.update(delta);

        // log FPS
        // let fps = Math.round(MainLoop.getFPS());
        // console.log(fps);
    }

    /**
     * Sets the current screen. 
     * @param key string referring to a key in the Screens interface.
     */
    public changeScreen = (key: "tutorialSitDownScreen" | "tutorialTaskScreen" | "tutorialTrialScreen" | "motionScreen"): void => {
        this.currentScreen.visible = false;
        this.currentScreen.removeEventListeners();
        if (this.currentScreen === this.screens.motionScreen) {
            this.stage.removeChild(this.screens.motionScreen);
            this.screens.motionScreen = new MotionScreen(this);
            this.screens.motionScreen.visible = false;
            this.stage.addChild(this.screens.motionScreen);
        } else if (this.currentScreen === this.screens.tutorialTrialScreen) {
            this.stage.removeChild(this.screens.tutorialTrialScreen);
            this.screens.tutorialTrialScreen = new TutorialTrialScreen(this);
            this.screens.tutorialTrialScreen.visible = false;
            this.stage.addChild(this.screens.tutorialTrialScreen);
        }
        this.currentScreen = this.screens[key];
        this.currentScreen.addEventListeners();
        this.currentScreen.visible = true;
    }

    private render = (): void => {
        this.renderer.render(this.stage);
    }

    public resize = (): void => {
        this.renderer.view.style.width = window.innerWidth + "px";
        this.renderer.view.style.height = window.innerHeight + "px";
    };
}
