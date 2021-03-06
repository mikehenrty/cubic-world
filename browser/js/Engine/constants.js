import * as THREE from 'three';

export const DEBUG = true;

export const IS_FIREFOX =
  navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

const MAX_WIDTH = 900;

//export const SCALE = IS_FIREFOX ? 0.65 : 1;
export const SCALE = 1;
export const SCREEN_WIDTH = Math.min(window.innerWidth, MAX_WIDTH) * SCALE;
export const SCREEN_HEIGHT = window.innerHeight * SCALE;
export const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

export const PLAYER_ONE = 1;
export const PLAYER_TWO = 2;

export const START_DELAY = 2000;  // ms
export const END_DELAY = 2000;

/*
 *
// Number of pixels in the screen.
const PIXEL_WIDTH_MOBILE = 500;
const PIXEL_WIDTH_DESKTOP = 750;
// Our guess for desktop screen minimum width.
const WIDTH_THRESHOLD = 1000;

// Not sure if these should be constants or not.
export const ASPECT_RATIO = window.innerWidth / window.innerHeight;
export const SCREEN_WIDTH = (window.innerWidth >= WIDTH_THRESHOLD) ?
  PIXEL_WIDTH_DESKTOP : PIXEL_WIDTH_MOBILE;
export const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;
*/
export const ORTHO_DEPTH = 1000;

// Board constants.
export const BOARD_DEPTH = 31;
export const BOARD_WIDTH = 5
export const GRID_COLOR = 0x595959;

// Cube constants.
export const BOX_SIZE = 50;
export const HALF_BOX = Math.round(BOX_SIZE / 2); // For convenience.
export const FLIP_DURATION = 325;
export const FAST_FLIP_DURATION = 225;
export const MIN_FLIP_DURATION = 100;

export const SIDE_TOP = 'TOP';
export const SIDE_FRONT = 'FRONT';
export const SIDE_RIGHT = 'RIGHT';
export const SIDE_LEFT = 'LEFT';
export const SIDE_BACK = 'BACK';
export const SIDE_BOTTOM = 'BOTTOM';
export const SIDE_GOAL = 'GOAL';

export const SIDE_ONE = 1;
export const SIDE_TWO = 2;
export const SIDE_THREE = 3;
export const SIDE_FOUR = 4;
export const SIDE_FIVE = 5;
export const SIDE_SIX = 6;
export const SIDE_MINUS_ONE = -1;

export const COLOR_BLACK = 'black';
export const COLOR_RED = '#ff0000';
export const COLOR_BLUE = '#0000ff';
export const COLOR_GREEN = '#00ff00';
export const COLOR_YELLOW = '#d6e506';
export const COLOR_PURPLE = '#f100ff';

export const DIR_AHEAD = 'AHEAD';
export const DIR_LEFT = 'LEFT';
export const DIR_RIGHT = 'RIGHT';
export const DIR_BACK = 'BACK';

export const SIDE_COLORS = {
 '-1': COLOR_PURPLE,
  0: COLOR_BLACK,
  1: COLOR_GREEN,
  2: COLOR_RED,
  3: COLOR_BLUE,
  // 4..6 are copied for now.
  4: COLOR_BLUE,
  5: COLOR_RED,
  6: COLOR_GREEN,
}

export const SIDE_COLORS_OPPONENT = {
  1: COLOR_YELLOW,
  2: COLOR_RED,
  3: COLOR_BLUE,
}

export const STARTING_ORIENTATION = {
  TOP: SIDE_ONE,
  FRONT: SIDE_FOUR,
  RIGHT: SIDE_FIVE,
  LEFT: SIDE_TWO,
  BACK: SIDE_THREE,
  BOTTOM: SIDE_SIX,
}

export const DIRECTIONS = [
  DIR_AHEAD, DIR_LEFT, DIR_RIGHT, DIR_BACK
];
