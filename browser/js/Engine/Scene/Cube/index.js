import * as THREE from 'three';
import {
  BOARD_WIDTH,
  BOX_SIZE,
  HALF_BOX,
  FLIP_DURATION,
  FAST_FLIP_DURATION
} from '/js/Engine/constants';
import {
  getMesh,
  getPivot,
  getMixer,
  getActions,
  getPivotOffset,
  setActionDuration
} from './static-helpers';


export const EVT_START_MOVE = 'CubeMove';
export const EVT_FINISH_MOVE = 'CubeMoveFinish';
export const EVT_PICKUP = 'CubePickup';


export default class Cube extends EventTarget {
  constructor(model, isOpponent) {
    super();
    this.model = model;
    this.isOpponent = !!isOpponent;
    // Populate scene.
    this.mesh = getMesh();
    this.pivot = getPivot(this.mesh);
    this.mixer = getMixer(this.pivot, this.moveFinish.bind(this));
    this.actions = getActions(this.mixer);

    this.updateMeshFromModel();

    this.lastDirection = null;
    this.nextMove = null;
  }

  updateMeshFromModel() {
    this.pivot.remove(this.mesh);

    // Reposition the mesh over the square dictated by model.
    const position = this.model.getCubePosition(this.isOpponent);
    const x = ( position.x - Math.floor(BOARD_WIDTH / 2) ) * BOX_SIZE;
    const z = -position.y * BOX_SIZE;
    this.mesh.position.set(x, HALF_BOX, z);

    // Use our pre-generated list of 24 static quaternions
    // to orient our cube properly with the grid.
    this.mesh.setRotationFromQuaternion(
      this.model.getCubeStaticQaternion(this.isOpponent));

    // Put the pivot back at the center bottom of cube.
    this.pivot.position.copy(this.mesh.position);
    this.pivot.position.setY(0);
    this.pivot.attach(this.mesh);
  }

  getNextMove() { return this.nextMove; }

  consumeNextMove() {
    const nextMove = this.nextMove;
    this.nextMove = null;
    return nextMove;
  }

  canPickUp(direction) {
    return this.model.canPickUp(direction, this.isOpponent);
  }

  isAnimating() {
    return this.lastDirection && this.actions[this.lastDirection].isRunning();
  }

  isValidMove(direction) {
    return this.model.cubeCanMove(direction, this.isOpponent);
  }

  tryMove(direction, duration) {
    // Make sure we are not already animating, if so save move for later.
    if (this.isAnimating()) {
      this.nextMove = direction;
      return false;
    }

    // Sanity check that we can move in the requested direction.
    if (!this.isValidMove(direction)) {
      return false;
    }

    // If we weren't given a duration, use defaults.
    if (typeof duration === 'undefined') {
      duration = this.canPickUp(direction) ? FAST_FLIP_DURATION : FLIP_DURATION;
    }

    this.lastDirection = direction;

    // Set up the rotation pivot point.
    this.pivot.position.add(getPivotOffset(direction));
    this.pivot.attach(this.mesh);
    this.mesh.position.sub(getPivotOffset(direction));

    // Start the animation.
    const action = this.actions[direction];
    setActionDuration(action, duration);
    action.play();

    // For moves from current player, dispatch move event.
    if (!this.isOpponent) {
      this.dispatchEvent(
        new CustomEvent(EVT_START_MOVE, { detail: { direction, duration } })
      );
    }

    return true;
  }

  moveFinish(e) {
    const direction = this.lastDirection;
    this.lastDirection = null;

    // Update our model of the cube, so we can use to correct
    // rotation rounding errors.
    this.model.updateCube(direction, this.isOpponent);
    this.actions[direction].stop();
    this.updateMeshFromModel();

    if (this.model.attemptPickup(this.isOpponent)) {
      const { x, y } = this.model.getCubePosition(this.isOpponent);
      this.dispatchEvent(new CustomEvent(EVT_PICKUP, { detail: { x, y } }));
    }

    const nextMove = this.nextMove;
    this.consumeNextMove();
    this.dispatchEvent(new CustomEvent(EVT_FINISH_MOVE, { detail: {
      nextMove,
      lastMove: direction,
    } }));
  }

  getObject3D() {
    return this.pivot;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
