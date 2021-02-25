import { GameApp } from './app';
import { Settings } from './utils/Settings';

window.onload = () => {
  // load settings
  Settings.load();

  // create game
  new GameApp(Settings.WINDOW_WIDTH_PX, Settings.WINDOW_HEIGHT_PX);
};
