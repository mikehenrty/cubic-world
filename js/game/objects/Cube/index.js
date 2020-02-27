import * as THREE from 'three';
import CubeModel from './Model';
import { HALF_BOX } from '/js/game/constants';
import {
  getMesh,
  getPivot,
  getMixer,
  getActions,
  getPivotOffset,
} from './static-helpers';

export default class Cube {
  constructor() {
    this.model = new CubeModel();

    // Populate scene.
    this.mesh = getMesh();
    this.pivot = getPivot(this.mesh);
    this.mixer = getMixer(this.pivot, this.moveFinish.bind(this));
    this.actions = getActions(this.mixer);

    this.lastMove = false;
  }

  getPositionVec() {
    // Raw position is stored in normal x/y coords.
    return this.model.position;
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

    // Update our model of the cube, so we can use to correct
    // rotation rounding errors.
    this.model.update(direction);
    const { x, z } = this.model.getXZPosition();

    // Remove the mesh and set it's world coords.
    this.pivot.remove(this.mesh);
    this.mesh.position.set(x, HALF_BOX, z);

    // Use our pre-generated list of 24 static quaternions
    // to orient our cube properly with the grid.
    this.mesh.setRotationFromQuaternion(this.model.getStaticQuaternion());

    this.actions[direction].stop();
    this.pivot.position.set(x, 0, z);
    this.pivot.attach(this.mesh);

    this.onMoveFinish && this.onMoveFinish(direction);
  }

  getObject3D() {
    return this.pivot;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
