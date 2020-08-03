import * as THREE from 'three';

export const DEBUG = true;

const MAX_WIDTH = 900;

export const SCALE = 1;
export const SCREEN_WIDTH = Math.min(window.innerWidth, MAX_WIDTH) * SCALE;
export const SCREEN_HEIGHT = window.innerHeight * SCALE;
export const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

export const PLAYER_ONE = 1;
export const PLAYER_TWO = 2;

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
export const BOARD_DEPTH = 101;
export const BOARD_WIDTH = 5
export const LINE_COLOR = 'white';

// Cube constants.
export const BOX_SIZE = 50;
export const HALF_BOX = Math.round(BOX_SIZE / 2); // For convenience.
export const FLIP_DURATION = 325;

export const SIDE_TOP = 'TOP';
export const SIDE_FRONT = 'FRONT';
export const SIDE_RIGHT = 'RIGHT';
export const SIDE_LEFT = 'LEFT';
export const SIDE_BACK = 'BACK';
export const SIDE_BOTTOM = 'BOTTOM';

export const SIDE_ONE = 1;
export const SIDE_TWO = 2;
export const SIDE_THREE = 3;
export const SIDE_FOUR = 4;
export const SIDE_FIVE = 5;
export const SIDE_SIX = 6;

export const COLOR_BLACK = 'black';
export const COLOR_RED = '#F23C54';
export const COLOR_BLUE = '#1B62A0';
export const COLOR_GREEN = 'green';
export const COLOR_YELLOW = '#FFF64C'
export const COLOR_PURPLE = 'violet';

export const DIR_AHEAD = 'AHEAD';
export const DIR_LEFT = 'LEFT';
export const DIR_RIGHT = 'RIGHT';
export const DIR_BACK = 'BACK';

export const SIDE_COLORS = {
  1: COLOR_YELLOW,
  2: COLOR_RED,
  3: COLOR_BLUE,
  4: COLOR_BLUE,
  5: COLOR_RED,
  6: COLOR_YELLOW,
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
