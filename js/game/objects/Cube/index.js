import * as THREE from 'three';
import { BOARD_WIDTH, BOX_SIZE, HALF_BOX } from '/js/game/constants';
import {
  getMesh,
  getPivot,
  getMixer,
  getActions,
  getPivotOffset,
} from './static-helpers';


export default class Cube {
  constructor(model) {
    this.model = model;

    // Populate scene.
    this.mesh = getMesh();
    this.pivot = getPivot(this.mesh);
    this.mixer = getMixer(this.pivot, this.moveFinish.bind(this));
    this.actions = getActions(this.mixer);

    this.updateMeshFromModel();

    this.lastMove = null;
    this.nextMove = null;
  }

  updateMeshFromModel() {
    // Reposition the mesh over the square dictated by model.
    const position = this.model.getCubePosition();
    const x = ( position.x - Math.floor(BOARD_WIDTH / 2) ) * BOX_SIZE;
    const z = -position.y * BOX_SIZE;
    this.mesh.position.set(x, HALF_BOX, z);

    // Use our pre-generated list of 24 static quaternions
    // to orient our cube properly with the grid.
    this.mesh.setRotationFromQuaternion(this.model.getCubeStaticQaternion());

  }

  move(direction) {
    if (this.lastMove && this.actions[this.lastMove].isRunning()) {

      // If user wants to change direction, remember that
      // and attempt to play it at the end of the move.
      if (direction !== this.lastMove) {
        this.nextMove = direction;
      }
      return;
    }

    if ( !this.model.canMove(direction) ) {
      return;
    }

    this.lastMove = direction;
    this.nextMove = null;

    // Set up the rotation pivot point.
    this.pivot.position.add(getPivotOffset(direction));
    this.pivot.attach(this.mesh);
    this.mesh.position.sub(getPivotOffset(direction));

    // Start the animation.
    this.actions[direction].play();
  }

  moveFinish(e) {
    const direction = this.lastMove;

    // Update our model of the cube, so we can use to correct
    // rotation rounding errors.
    this.model.updateCube(direction);

    this.pivot.remove(this.mesh);
    this.updateMeshFromModel();

    this.actions[direction].stop();

    // Put the pivot back at the center bottom of cube.
    this.pivot.position.copy(this.mesh.position);
    this.pivot.position.setY(0);
    this.pivot.attach(this.mesh);

    // If we have a move pending perform that before calling onMoveFinish.
    if (this.nextMove) {
      setTimeout(() => this.move(this.nextMove));
    } else {
      this.onMoveFinish && this.onMoveFinish(direction);
    }
  }

  getObject3D() {
    return this.pivot;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
