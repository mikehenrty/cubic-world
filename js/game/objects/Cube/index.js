import * as THREE from 'three';
import {
  getMesh,
  getPivot,
  getMixer,
  getActions,
  getClips,
  getPivotOffset,
  getMoveOffset,
  getColorForSide,
  getTopBackQuaternion,
  getStartingOrientation,
  BOX_SIZE,
  HALF_BOX,
  SIDE_TOP,
  SIDE_FRONT,
  SIDE_RIGHT,
  SIDE_LEFT,
  SIDE_BACK,
  SIDE_BOTTOM,
  DIR_AHEAD,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_BACK
} from './cube-helper';

export default class Cube {
  constructor() {
    // Reusable quaternion.
    this.q = new THREE.Quaternion();

    // Set up position and orientation on the playing surface.
    const starting = getStartingOrientation();
    this.top = starting[SIDE_TOP];
    this.bottom = starting[SIDE_BOTTOM];
    this.left = starting[SIDE_LEFT];
    this.right = starting[SIDE_RIGHT];
    this.front = starting[SIDE_FRONT];
    this.back = starting[SIDE_BACK];
    this.position = new THREE.Vector2();

    // Populate scene.
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

    this.rotateModel(direction);

    /*
    const tbq = getTopBackQuaternion(this.top, this.back);
    if (tbq) {
      this.q = tbq;
    } else {
      this.mesh.getWorldQuaternion(this.q);
    }
    */

    this.mesh.getWorldQuaternion(this.q);

    // Update position model.
    this.position.add(getMoveOffset(direction));
    const posX = this.position.x * BOX_SIZE;
    const posZ = -this.position.y * BOX_SIZE;


    // Remove the mesh and set it's world coords.
    this.pivot.remove(this.mesh);
    this.mesh.position.set(posX, HALF_BOX, posZ);
    this.mesh.setRotationFromQuaternion(this.q);

    this.actions[direction].stop();
    this.pivot.position.set(posX, 0, posZ);
    this.pivot.attach(this.mesh);

    console.log('top', getColorForSide(this.top), this.top);
    console.log('back', getColorForSide(this.back), this.back);
  }

  rotateModel(direction) {
    switch(direction) {
      case DIR_AHEAD:
        [
          this.top, this.front, this.bottom, this.back
        ] = [
          this.back, this.top, this.front, this.bottom
        ];
        break;

      case DIR_LEFT:
        [
          this.top, this.left, this.bottom, this.right
        ] = [
          this.right, this.top, this.left, this.bottom
        ];
        break;

      case DIR_RIGHT:
        [
          this.top, this.left, this.bottom, this.right
        ] = [
          this.left, this.bottom, this.right, this.top
        ];
        break;

      case DIR_BACK:
        [
          this.top, this.front, this.bottom, this.back
        ] = [
          this.front, this.bottom, this.back, this.top
        ];
        break;

      default:
        console.log('unrecognized direction', direction);
        break;
    }

  }

  getObject3D() {
    return this.pivot;
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
