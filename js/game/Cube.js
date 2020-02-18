import * as THREE from 'three';
import { createCubeMoveAnimation } from './animation';

const BOX_SIZE = 50;
const HALF_BOX = Math.round(BOX_SIZE / 2); // For convenience.
const FLIP_DURATION = 1500;

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

const PIVOTS = {
  AHEAD: new THREE.Vector3(0, 0, -HALF_BOX),
  LEFT:  new THREE.Vector3(-HALF_BOX, 0, 0),
  RIGHT: new THREE.Vector3(HALF_BOX, 0, 0),
  BACK:  new THREE.Vector3(0, 0, HALF_BOX),
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

export default class Cube {
  constructor() {
    var geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);

    let colors = CUBE_COLORS.slice(0);
    for ( var i = 0; i < geometry.faces.length; i+=2 ) {
      const color = colors.pop();
      geometry.faces[ i ].color.setStyle( color );
      geometry.faces[ i + 1 ].color.setStyle( color );
    }
    var material = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      vertexColors: THREE.FaceColors,
    });
    this.mesh = new THREE.Mesh( geometry, material );

    this.group = new THREE.Group();
    // this.group.position.copy();
    // this.group.position.add(PIVOTS.AHEAD);
    this.group.add(this.mesh);
    this.mesh.position.set(0, HALF_BOX, 0);

    this.mixer = new THREE.AnimationMixer(this.group);
    this.actions = {
      AHEAD: this.mixer.clipAction(CLIPS.AHEAD).setLoop(THREE.LoopOnce),
      LEFT: this.mixer.clipAction(CLIPS.LEFT).setLoop(THREE.LoopOnce),
      RIGHT: this.mixer.clipAction(CLIPS.RIGHT).setLoop(THREE.LoopOnce),
      BACK: this.mixer.clipAction(CLIPS.BACK).setLoop(THREE.LoopOnce),
    };

    this.mixer.addEventListener('finished', this.moveFinish.bind(this));

    this.movingDirection = false;
    this.move(DIR_AHEAD);
  }

  move(direction) {
    this.movingDirection = direction;
    this.group.position.add(PIVOTS[direction]);
    this.mesh.position.sub(PIVOTS[direction]);
    this.actions[direction].play();
  }

  moveFinish(e) {
    console.log('got e', e);
    const direction = this.movingDirection;
    this.group.position.sub(PIVOTS[direction]);
    this.mesh.position.add(PIVOTS[direction]);
    this.actions[direction].stop();
  }

  getObject3D() {
    return this.group;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
