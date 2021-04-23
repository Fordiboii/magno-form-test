import { GameApp } from './app';
import { TestType } from './utils/Enums';

window.onload = () => {
  // create test
  if (process.env.TEST_TYPE == "MOTION") {
    new GameApp(window.innerWidth, window.innerHeight, TestType.MOTION);
  } else if (process.env.TEST_TYPE == "FORM_FIXED") {
    new GameApp(window.innerWidth, window.innerHeight, TestType.FORM_FIXED);
  } else if (process.env.TEST_TYPE == "FORM_RANDOM") {
    new GameApp(window.innerWidth, window.innerHeight, TestType.FORM_RANDOM);
  }
};
