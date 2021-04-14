import * as PIXI from 'pixi.js';
import MainLoop from 'mainloop.js';
import { SIMULATION_TIMESTEP } from './utils/Constants';
import { MobileScreen } from './screens/MobileScreen';
import { MotionScreen } from './screens/MotionScreen';
import { TutorialSitDownScreen } from './screens/tutorialScreens/TutorialSitDownScreen';
import { TutorialTaskScreen } from './screens/tutorialScreens/TutorialTaskScreen';
import { TutorialTrialScreen } from './screens/tutorialScreens/TutorialTrialScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { Screens } from "./interfaces/screens";
import { ResultsScreen } from './screens/ResultsScreen';
import { Settings } from './utils/Settings';

export class GameApp {
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public screens: Screens;
    public currentScreen: MotionScreen | TutorialSitDownScreen | TutorialTaskScreen | TutorialTrialScreen | LoadingScreen | ResultsScreen | MobileScreen;
    private threshold: number;

    constructor(width: number, height: number) {
        // create root container and renderer
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer({
            width: width,
            height: height,
            resolution: window.devicePixelRatio, // for retina display devices
            autoDensity: true, // for retina display devices
        });

        if (process.env.NODE_ENV != "production") {
            // For using pixijs inspection dev tool.
            (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ && (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
        }

        // add renderer view to document body
        window.document.body.appendChild(this.renderer.view)

        // set timestep (in ms) the app should simulate between each frame.
        MainLoop.setSimulationTimestep(SIMULATION_TIMESTEP);

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

        // load settings
        Settings.load();

        // set draw and update methods and start main loop
        MainLoop.setDraw(this.render);
        MainLoop.setUpdate((delta: number) => this.gameLoop(delta));
        MainLoop.start();

        // check if user is on a mobile device
        if (window.matchMedia("only screen and (max-width: 760px)").matches) {
            const mobileScreen: MobileScreen = new MobileScreen();
            this.stage.addChild(mobileScreen);
            this.currentScreen = mobileScreen;
            return;
        }

        // show loading screen
        this.showLoadingScreen();

        // load assets
        const loader = PIXI.Loader.shared;
        loader.onError.add((err, _loader, resource) => { console.log(err, resource) });
        loader.onComplete.once(() => {
            // initialize game
            this.setup();
        });
        loader
            .add('dot', './assets/sprites/dot.png')
            .add('backArrow', './assets/sprites/backArrow.png')
            .add('circleHollow', './assets/sprites/circle_hollow.png')
            .add('circleFilled', './assets/sprites/circle_filled.png')
            .add('resultsBarMarker', './assets/sprites/resultsBarMarker.png')
            .add('checkmark', './assets/sprites/checkmark.png')
            .add('cross', './assets/sprites/cross.png')
            .add('sitDownImage', './assets/images/TutorialSitDown-01.png')
            .add('helvetica', './assets/fonts/helvetica-bitmap.fnt')
            .load()
    }

    private showLoadingScreen = (): void => {
        const loadingScreen: LoadingScreen = new LoadingScreen();
        this.stage.addChild(loadingScreen);
        this.currentScreen = loadingScreen;
    }

    private setup = (): void => {
        // create screens
        const tutorialSitDownScreen: TutorialSitDownScreen = new TutorialSitDownScreen(this);
        const tutorialTaskScreen: TutorialTaskScreen = new TutorialTaskScreen(this);
        const tutorialTrialScreen: TutorialTrialScreen = new TutorialTrialScreen(this);
        const motionScreen: MotionScreen = new MotionScreen(this);

        this.screens = {
            tutorialSitDownScreen: tutorialSitDownScreen,
            tutorialTaskScreen: tutorialTaskScreen,
            tutorialTrialScreen: tutorialTrialScreen,
            motionScreen: motionScreen,
            resultsScreen: undefined
        };

        // add screens to stage
        this.stage.addChild(tutorialSitDownScreen, tutorialTaskScreen, tutorialTrialScreen, motionScreen);

        // hide screens and change to first tutorial screen
        this.screens.tutorialTaskScreen.visible = false;
        this.screens.tutorialTrialScreen.visible = false;
        this.screens.motionScreen.visible = false;
        this.changeScreen("tutorialSitDownScreen");
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
    public changeScreen = (key: "tutorialSitDownScreen" | "tutorialTaskScreen" | "tutorialTrialScreen" | "motionScreen" | "resultsScreen"): void => {
        // disable current screen and remove event listeners
        this.currentScreen.visible = false;
        this.currentScreen.removeEventListeners();

        // create new instances of MotionScreen and TutorialTrialScreen if navigated back to
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
        if (key == "resultsScreen") {
            // create result screen and set it to current screen.
            this.screens.resultsScreen = new ResultsScreen(this.getThreshold());
            this.stage.addChild(this.screens.resultsScreen);
            this.currentScreen = this.screens.resultsScreen;
            this.currentScreen.addEventListeners();
            this.currentScreen.visible = true;
        } else {
            // change to new screen
            this.currentScreen = this.screens[key];
            this.currentScreen.addEventListeners();
            this.currentScreen.visible = true;
        }
    }

    private render = (): void => {
        this.renderer.render(this.stage);
    }

    private resize = (): void => {
        this.renderer.view.style.width = window.innerWidth + "px";
        this.renderer.view.style.height = window.innerHeight + "px";
    };

    getThreshold = (): number => {
        return this.threshold;
    }

    setThreshold = (value: number): void => {
        this.threshold = value;
    }
}
