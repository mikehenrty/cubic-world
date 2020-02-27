import * as THREE from 'three';

export const DEBUG = false;

// Number of pixels in the screen.
export const PIXEL_WIDTH = 120;

// Board constants.
export const BOARD_DEPTH = 11;
export const BOARD_WIDTH = 5

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
export const COLOR_RED = 'red';
export const COLOR_BLUE = 'blue';
export const COLOR_GREEN = 'green';
export const COLOR_YELLOW = 'yellow';
export const COLOR_PURPLE = 'violet';

export const DIR_AHEAD = 'AHEAD';
export const DIR_LEFT = 'LEFT';
export const DIR_RIGHT = 'RIGHT';
export const DIR_BACK = 'BACK';

export const SIDE_COLORS = {
  1: COLOR_PURPLE,
  2: COLOR_YELLOW,
  3: COLOR_GREEN,
  4: COLOR_BLUE,
  5: COLOR_RED,
  6: COLOR_BLACK,
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
