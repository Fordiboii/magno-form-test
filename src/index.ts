import { MotionApp } from './MotionApp';

window.onload = () => {
  // create test
  if (process.env.TEST_TYPE == "MOTION") {
    new MotionApp(window.innerWidth, window.innerHeight);
  } else if (process.env.TEST_TYPE == "FORM_FIXED") {
    // TOOD: create FormApp
    console.log("form fixed")
  } else if (process.env.TEST_TYPE == "FORM_RANDOM") {
    // TODO: create FormApp
    console.log("form random")
  }
};
