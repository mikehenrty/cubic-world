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

const DIRECTIONS = [
  DIR_AHEAD, DIR_LEFT, DIR_RIGHT, DIR_BACK
];

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
    // Reusable objects.
    this.q = new THREE.Quaternion();
    this.v = new THREE.Vector3();

    this.initMesh();
    this.initGroupMesh();
    this.initMixer();
this.movingDirection = false;
    this.move(DIR_AHEAD);
  }

  initMesh() {
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
  }

  initGroupMesh() {
    if (!this.group) {
      this.group = new THREE.Group();
    }

    this.group.attach(this.mesh);
    this.mesh.position.setY(HALF_BOX);
  }

  initMixer() {
    this.mixer = new THREE.AnimationMixer(this.group);
    this.actions = {
      AHEAD: this.mixer.clipAction(CLIPS.AHEAD).setLoop(THREE.LoopOnce),
      LEFT: this.mixer.clipAction(CLIPS.LEFT).setLoop(THREE.LoopOnce),
      RIGHT: this.mixer.clipAction(CLIPS.RIGHT).setLoop(THREE.LoopOnce),
      BACK: this.mixer.clipAction(CLIPS.BACK).setLoop(THREE.LoopOnce),
    };

    this.mixer.addEventListener('finished', this.moveFinish.bind(this));
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

    this.mesh.getWorldPosition(this.v);
    this.mesh.getWorldQuaternion(this.q);

    this.group.remove(this.mesh);
    this.mesh.position.copy(this.v);
    this.mesh.setRotationFromQuaternion(this.q);
    this.actions[direction].stop();
    this.group.position.copy(this.v);
    this.initGroupMesh();

    setTimeout(() => {
      // Move a random direction.
      this.move(DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]);
    }, 200);
  }

  getObject3D() {
    return this.group;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
