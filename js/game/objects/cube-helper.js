import * as THREE from 'three';

export const BOX_SIZE = 50;
export const HALF_BOX = Math.round(BOX_SIZE / 2); // For convenience.
const FLIP_DURATION = 250;

const COLOR_BLACK = 'black';
const COLOR_RED = 'red';
const COLOR_BLUE = 'blue';
const COLOR_GREEN = 'honeydew';
const COLOR_YELLOW = 'yellow';
const COLOR_PURPLE = 'violet';

const CUBE_COLORS = [
  COLOR_BLACK,
  COLOR_RED,
  COLOR_BLUE,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_PURPLE,
];

const DIR_AHEAD = 'AHEAD';
const DIR_LEFT = 'LEFT';
const DIR_RIGHT = 'RIGHT';
const DIR_BACK = 'BACK';

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


export function getMesh() {
  const geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
  const colors = CUBE_COLORS.slice(0);
  const material = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
  });

  for ( let i = 0; i < geometry.faces.length; i+=2 ) {
    const color = colors.pop();
    geometry.faces[ i ].color.setStyle( color );
    geometry.faces[ i + 1 ].color.setStyle( color );
  }

  const mesh = new THREE.Mesh( geometry, material );
  // Make sure to position box above z-x plane.
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

export function getActions(mixer) {
  const clips = {
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

  return {
    AHEAD: mixer.clipAction(clips.AHEAD).setLoop(THREE.LoopOnce),
    LEFT: mixer.clipAction(clips.LEFT).setLoop(THREE.LoopOnce),
    RIGHT: mixer.clipAction(clips.RIGHT).setLoop(THREE.LoopOnce),
    BACK: mixer.clipAction(clips.BACK).setLoop(THREE.LoopOnce),
  };
}

export function getPivotOffset(direction) {
  return PIVOTS[direction];
}

export function getMoveOffset(direction) {
  return MOVES[direction];
}

export function getRandomDirection() {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}
