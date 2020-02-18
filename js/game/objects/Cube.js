import * as THREE from 'three';
import {
  getMesh,
  getPivot,
  getMixer,
  getActions,
  getClips,
  getPivotOffset,
  getMoveOffset,
  BOX_SIZE,
  HALF_BOX
} from './cube-helper';

export default class Cube {
  constructor() {
    // Reusable quaternion.
    this.q = new THREE.Quaternion();

    // Our position on the playing surface.
    this.position = new THREE.Vector2();
    this.mesh = getMesh();
    this.pivot = getPivot(this.mesh);
    this.mixer = getMixer(this.pivot, this.moveFinish.bind(this));
    this.actions = getActions(this.mixer);

    this.lastMove = false;
  }

  move(direction) {
    if (this.lastMove && this.actions[this.lastMove].isRunning()) {
      console.log('ignoring while others are running');
      return;
    }
    this.lastMove = direction;
    this.pivot.position.add(getPivotOffset(direction));
    this.pivot.attach(this.mesh);
    this.mesh.position.sub(getPivotOffset(direction));
    this.actions[direction].play();
  }

  moveFinish(e) {
    const direction = this.lastMove;

    this.position.add(getMoveOffset(direction));
    const posX = this.position.x * BOX_SIZE;
    const posZ = -this.position.y * BOX_SIZE;

    this.mesh.getWorldQuaternion(this.q);

    // Remove the mesh and set it's world coords.
    this.pivot.remove(this.mesh);
    this.mesh.position.set(posX, HALF_BOX, posZ);
    this.mesh.setRotationFromQuaternion(this.q);

    this.actions[direction].stop();
    this.pivot.position.set(posX, 0, posZ);
    this.pivot.attach(this.mesh);
  }

  getObject3D() {
    return this.pivot;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
