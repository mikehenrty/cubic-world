import * as THREE from 'three';

export const BOX_SIZE = 50;
export const HALF_BOX = Math.round(BOX_SIZE / 2); // For convenience.
const FLIP_DURATION = 250;

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

const SIDE_COLORS = {
  1: COLOR_PURPLE,
  2: COLOR_YELLOW,
  3: COLOR_GREEN,
  4: COLOR_BLUE,
  5: COLOR_RED,
  6: COLOR_BLACK,
}

const STARTING_ORIENTATION = {
  TOP: SIDE_THREE,
  FRONT: SIDE_SIX,
  RIGHT: SIDE_ONE,
  LEFT: SIDE_TWO,
  BACK: SIDE_FIVE,
  BOTTOM: SIDE_FOUR,
}

const CUBE_COLORS = [
  COLOR_BLACK,
  COLOR_RED,
  COLOR_BLUE,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_PURPLE,
];

export const DIR_AHEAD = 'AHEAD';
export const DIR_LEFT = 'LEFT';
export const DIR_RIGHT = 'RIGHT';
export const DIR_BACK = 'BACK';

const DIRECTIONS = [
  DIR_AHEAD, DIR_LEFT, DIR_RIGHT, DIR_BACK
];

const PIVOTS = {
  AHEAD: new THREE.Vector3(0, 0, -HALF_BOX),
  LEFT:  new THREE.Vector3(-HALF_BOX, 0, 0),
  RIGHT: new THREE.Vector3(HALF_BOX, 0, 0),
  BACK:  new THREE.Vector3(0, 0, HALF_BOX),
};

const MOVES = {
  AHEAD: new THREE.Vector2(0, 1),
  LEFT: new THREE.Vector2(-1, 0),
  RIGHT: new THREE.Vector2(1, 0),
  BACK: new THREE.Vector2(0, -1),
};

const AXES = {
  AHEAD_BACK: new THREE.Vector3(1, 0, 0),
  RIGHT_LEFT: new THREE.Vector3(0, 0, 1),
}

const CLIPS = {
  AHEAD: createCubeMoveAnimation(
    'ahead.quaternion',
    FLIP_DURATION,
    AXES.AHEAD_BACK
  ),
  LEFT: createCubeMoveAnimation(
    'left.quaternion',
    FLIP_DURATION,
    AXES.RIGHT_LEFT,
    true
  ),
  RIGHT: createCubeMoveAnimation(
    'right.quaternion',
    FLIP_DURATION,
    AXES.RIGHT_LEFT,
  ),
  BACK: createCubeMoveAnimation(
    'back.quaternion',
    FLIP_DURATION,
    AXES.AHEAD_BACK,
    true
  ),
}


export function getStartingOrientation() {
  return STARTING_ORIENTATION;
}

export function getMesh() {
  const geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
  const material = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
  });

  geometry.faces[ 0 ].color.setStyle( SIDE_COLORS[SIDE_ONE] );
  geometry.faces[ 1 ].color.setStyle( SIDE_COLORS[SIDE_ONE] );
  geometry.faces[ 2 ].color.setStyle( SIDE_COLORS[SIDE_TWO] );
  geometry.faces[ 3 ].color.setStyle( SIDE_COLORS[SIDE_TWO] );
  geometry.faces[ 4 ].color.setStyle( SIDE_COLORS[SIDE_THREE] );
  geometry.faces[ 5 ].color.setStyle( SIDE_COLORS[SIDE_THREE] );
  geometry.faces[ 6 ].color.setStyle( SIDE_COLORS[SIDE_FOUR] );
  geometry.faces[ 7 ].color.setStyle( SIDE_COLORS[SIDE_FOUR] );
  geometry.faces[ 8 ].color.setStyle( SIDE_COLORS[SIDE_FIVE] );
  geometry.faces[ 9 ].color.setStyle( SIDE_COLORS[SIDE_FIVE] );
  geometry.faces[ 10 ].color.setStyle( SIDE_COLORS[SIDE_SIX] );
  geometry.faces[ 11 ].color.setStyle( SIDE_COLORS[SIDE_SIX] );

  // Make sure to position box above z-x plane.
  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(0, HALF_BOX, 0);
  return mesh;
}

export function getPivot(mesh) {
  const pivot = new THREE.Group();
  pivot.attach(mesh);
  return pivot;
}

export function getMixer(root, finishHandler) {
  const mixer = new THREE.AnimationMixer(root);
  finishHandler && mixer.addEventListener('finished', finishHandler);
  return mixer;
}

export function createCubeMoveAnimation( trackName, period, axis, backward ) {
  const from = new THREE.Quaternion();
  const to = new THREE.Quaternion();
  from.setFromAxisAngle( axis, 0 );
  to.setFromAxisAngle( axis, ( backward ? 1 : -1 ) * Math.PI / 2 );

  const times = [ 0, period ];
  const values = [ ...from.toArray(), ...to.toArray() ];
  const track = new THREE.QuaternionKeyframeTrack( trackName, times, values );

  return new THREE.AnimationClip( null, period, [ track ] );
};

function _getAction(mixer, name) {
  const action = mixer.clipAction(name).setLoop(THREE.LoopOnce);
  action.clampWhenFinished = true;
  return action;
}
export function getActions(mixer) {
  return {
    AHEAD: _getAction(mixer, CLIPS.AHEAD),
    LEFT: _getAction(mixer, CLIPS.LEFT),
    RIGHT: _getAction(mixer, CLIPS.RIGHT),
    BACK: _getAction(mixer, CLIPS.BACK),
  };
}

export function getPivotOffset(direction) {
  return PIVOTS[direction];
}

export function getMoveOffset(direction) {
  return MOVES[direction];
}

export function getColorForSide(sideNum) {
  return SIDE_COLORS[sideNum];
}

export function getRandomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}
