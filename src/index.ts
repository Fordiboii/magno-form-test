import { GameApp } from './app';

window.onload = () => {
  // create game
  new GameApp(window.innerWidth, window.innerHeight);
};
