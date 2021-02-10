import { GAME_WIDTH, GAME_HEIGHT } from './utils/Constants';
import { GameApp } from './app';

window.onload = () => {
  new GameApp(GAME_WIDTH, GAME_HEIGHT);
};
