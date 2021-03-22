import * as PIXI from 'pixi.js';
import { MotionTutorialWorld } from '../motion/MotionTutorialWorld';
import { Settings } from '../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialTaskScreen extends TutorialScreen {
    protected motionTutorialWorld: MotionTutorialWorld;
    protected motionTutorialWorldContainer: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    protected tutorialArrow: PIXI.Sprite;

    constructor() {
        super();
        // set header text
        this.header.text = "MOTION TEST TUTORIAL";

        // add motion tutorial world container
        this.motionTutorialWorldContainer.tint = 0;
        this.motionTutorialWorldContainer.anchor.set(0.5, 0)
        this.motionTutorialWorldContainer.x = this.contentX;
        this.motionTutorialWorldContainer.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.motionTutorialWorldContainer.width = Settings.WINDOW_WIDTH_PX;
        this.motionTutorialWorldContainer.height = Settings.WINDOW_HEIGHT_PX / 2.3;
        this.addChild(this.motionTutorialWorldContainer);

        // add motion tutorial world
        this.motionTutorialWorld = new MotionTutorialWorld();
        this.addChild(this.motionTutorialWorld);

        // add tutorial arrow
        const tutorialArrowTexture: PIXI.Texture = PIXI.Loader.shared.resources['tutorialArrow'].texture;
        this.tutorialArrow = new PIXI.Sprite(tutorialArrowTexture);
        this.tutorialArrow.anchor.set(0.5, 0);
        this.tutorialArrow.scale.set(0.07, 0.03);
        this.tutorialArrow.roundPixels = true;
        this.tutorialArrow.position.x = this.motionTutorialWorld.patchRight.x + this.motionTutorialWorld.patchRight.width / 2;
        this.tutorialArrow.position.y = this.motionTutorialWorldContainer.y + this.motionTutorialWorldContainer.height / 16;
        this.addChild(this.tutorialArrow)

        // add tutorial text
        this.tutorialText.text =
            "During the test, you should identify and click on the box where some of the dots are moving systematically back and forth." +
            "The other box will contain dots moving randomly. Repeat this exercise until the test is done. The test takes approximately 8 minutes.";

        // change selected circle texture
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[1].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        this.motionTutorialWorld.update(delta);
    }
}