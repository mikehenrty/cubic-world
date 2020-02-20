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

export const DIR_AHEAD = 'AHEAD';
export const DIR_LEFT = 'LEFT';
export const DIR_RIGHT = 'RIGHT';
export const DIR_BACK = 'BACK';


const SIDE_COLORS = {
  1: COLOR_PURPLE,
  2: COLOR_YELLOW,
  3: COLOR_GREEN,
  4: COLOR_BLUE,
  5: COLOR_RED,
  6: COLOR_BLACK,
}

const STARTING_ORIENTATION = {
  TOP: SIDE_ONE,
  FRONT: SIDE_FOUR,
  RIGHT: SIDE_FIVE,
  LEFT: SIDE_TWO,
  BACK: SIDE_THREE,
  BOTTOM: SIDE_SIX,
}

const CUBE_COLORS = [
  COLOR_BLACK,
  COLOR_RED,
  COLOR_BLUE,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_PURPLE,
];

const PI_OVER_TWO = Math.PI / 2;
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

  // Right side.
  geometry.faces[ 0 ].color.setStyle( SIDE_COLORS[SIDE_FIVE] );
  geometry.faces[ 1 ].color.setStyle( SIDE_COLORS[SIDE_FIVE] );

  // Left side.
  geometry.faces[ 2 ].color.setStyle( SIDE_COLORS[SIDE_TWO] );
  geometry.faces[ 3 ].color.setStyle( SIDE_COLORS[SIDE_TWO] );

  // Top side.
  geometry.faces[ 4 ].color.setStyle( SIDE_COLORS[SIDE_ONE] );
  geometry.faces[ 5 ].color.setStyle( SIDE_COLORS[SIDE_ONE] );

  // Bottom side.
  geometry.faces[ 6 ].color.setStyle( SIDE_COLORS[SIDE_SIX] );
  geometry.faces[ 7 ].color.setStyle( SIDE_COLORS[SIDE_SIX] );

  // Back side.
  geometry.faces[ 8 ].color.setStyle( SIDE_COLORS[SIDE_THREE] );
  geometry.faces[ 9 ].color.setStyle( SIDE_COLORS[SIDE_THREE] );

  // Front side.
  geometry.faces[ 10 ].color.setStyle( SIDE_COLORS[SIDE_FOUR] );
  geometry.faces[ 11 ].color.setStyle( SIDE_COLORS[SIDE_FOUR] );

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

export function getAllQuaternionsForCube() {
  const newQuat = () => new THREE.Quaternion();
  const degToRad = deg => deg * Math.PI / 180;
  let axis = new THREE.Vector3();

  // Map keys are format "(top)_(back)".
  let map = {};

  // The following was heaily derived:
  // https://www.euclideanspace.com/maths/discrete/groups/categorise/finite/cube/index.htm

  // Z axis.
  axis.set(0, 0, 1);
  map['1_3'] = newQuat().setFromAxisAngle(axis, 0); // Default position.
  map['5_3'] = newQuat().setFromAxisAngle(axis, PI_OVER_TWO);
  map['6_3'] = newQuat().setFromAxisAngle(axis, Math.PI);
  map['2_3'] = newQuat().setFromAxisAngle(axis, -PI_OVER_TWO);

  // X axis.
  axis.set(1, 0, 0);
  map['4_1'] = newQuat().setFromAxisAngle(axis, PI_OVER_TWO);
  map['6_4'] = newQuat().setFromAxisAngle(axis, Math.PI);
  map['3_6'] = newQuat().setFromAxisAngle(axis, -PI_OVER_TWO);

  // Y axis.
  axis.set(0, 1, 0);
  map['1_2'] = newQuat().setFromAxisAngle(axis, PI_OVER_TWO);
  map['1_4'] = newQuat().setFromAxisAngle(axis, Math.PI);
  map['1_5'] = newQuat().setFromAxisAngle(axis, -PI_OVER_TWO);

  // Rotate about opposite vertices.
  axis.set(1, 1, 1).normalize();
  map['3_5'] = newQuat().setFromAxisAngle(axis, degToRad(-120));
  map['5_1'] = newQuat().setFromAxisAngle(axis, degToRad(120));

  axis.set(1, -1, 1).normalize();
  map['2_6'] = newQuat().setFromAxisAngle(axis, degToRad(-120));
  map['4_5'] = newQuat().setFromAxisAngle(axis, degToRad(120));

  axis.set(-1, -1, 1).normalize();
  map['4_2'] = newQuat().setFromAxisAngle(axis, degToRad(-120));
  map['5_6'] = newQuat().setFromAxisAngle(axis, degToRad(120));

  axis.set(-1, 1, 1).normalize();
  map['2_1'] = newQuat().setFromAxisAngle(axis, degToRad(-120));
  map['3_2'] = newQuat().setFromAxisAngle(axis, degToRad(120));

  // Rotate about opposite parallel lines.
  axis.set(0, 1, 1).normalize();
  map['3_1'] = newQuat().setFromAxisAngle(axis, Math.PI);
  axis.set(1, 0, 1).normalize();
  map['6_5'] = newQuat().setFromAxisAngle(axis, Math.PI);
  axis.set(0, -1, 1).normalize();
  map['4_6'] = newQuat().setFromAxisAngle(axis, Math.PI);
  axis.set(-1, 0, 1).normalize();
  map['6_2'] = newQuat().setFromAxisAngle(axis, Math.PI);
  axis.set(1, 1, 0).normalize();
  map['5_4'] = newQuat().setFromAxisAngle(axis, Math.PI);
  axis.set(-1, 1, 0).normalize();
  map['2_4'] = newQuat().setFromAxisAngle(axis, Math.PI);

  return map;
}

export function createCubeMoveAnimation( trackName, period, axis, backward ) {
  const from = new THREE.Quaternion();
  const to = new THREE.Quaternion();
  from.setFromAxisAngle( axis, 0 );
  // HACK: 1.9333 is from eye-balling it, otherwise cube wouldn't rotate enough.
  to.setFromAxisAngle( axis, ( backward ? 1 : -1 ) * Math.PI / 1.93333 );

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