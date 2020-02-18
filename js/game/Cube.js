import * as THREE from 'three';
import { createCubeMoveAnimation } from './animation';

const BOX_SIZE = 50;
const HALF_BOX = Math.round(BOX_SIZE / 2); // For convenience.
const FLIP_DURATION = 2000;

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

const PIVOTS = {
  RIGHT: new THREE.Vector3(HALF_BOX, 0, 0),
  LEFT:  new THREE.Vector3(-HALF_BOX, 0, 0),
  AHEAD: new THREE.Vector3(0, 0, HALF_BOX),
  BACK:  new THREE.Vector3(0, 0, -HALF_BOX),
};

const AXES = {
  RIGHT_LEFT: new THREE.Vector3(0, 0, 1),
  AHEAD_BACK: new THREE.Vector3(1, 0, 0),
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
    this.group.attach(this.mesh);
    this.mesh.position.set(0, HALF_BOX, 0);

    this.group.position.add(PIVOTS.BACK);
    this.mesh.position.sub(PIVOTS.BACK);

    this.clip = createCubeMoveAnimation(
      '.quaternion',
      FLIP_DURATION,
      AXES.AHEAD_BACK
    );

    this.mixer = new THREE.AnimationMixer(this.group);

    this.action = this.mixer.clipAction(this.clip);
    this.action.setLoop(THREE.LoopOnce);
    this.action.play();

    this.mixer.addEventListener('finished', e => this.reset(e));
  }

  getObject3D() {
    return this.group;
  }

  update(delta) {
    this.mixer.update(delta);
  }

  reset(e) {
    console.log('got e', e);
    this.group.position.sub(PIVOTS.BACK);
    this.mesh.position.add(PIVOTS.BACK);

    this.group.position.add(PIVOTS.BACK);
    this.mesh.position.sub(PIVOTS.BACK);

    this.clip = createCubeMoveAnimation(
      '.quaternion',
      FLIP_DURATION,
      AXES.AHEAD_BACK
    );

    this.action = this.mixer.clipAction(this.clip);
    this.action.setLoop(THREE.LoopPingPong);
    this.action.play();
  }
}
