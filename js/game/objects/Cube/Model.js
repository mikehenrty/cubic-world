import * as THREE from 'three';
import {
  getAllQuaternionsForCube,
  getStartingOrientation,
  getMoveOffset,
  SIDE_TOP,
  SIDE_FRONT,
  SIDE_RIGHT,
  SIDE_LEFT,
  SIDE_BACK,
  SIDE_BOTTOM,
  DIR_AHEAD,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_BACK,
  BOX_SIZE,
} from './static-helpers';

export default class CubeModel {
  constructor() {
    // Set up position and orientation on the playing surface.
    const starting = getStartingOrientation();
    this.top = starting[SIDE_TOP];
    this.bottom = starting[SIDE_BOTTOM];
    this.left = starting[SIDE_LEFT];
    this.right = starting[SIDE_RIGHT];
    this.front = starting[SIDE_FRONT];
    this.back = starting[SIDE_BACK];

    this.position = new THREE.Vector2();

    // Cache quaternions to represent each of 24 orientations.
    this.quaternions = getAllQuaternionsForCube();
  }

  getStaticQuaternion() {
    return this.quaternions[`${this.top}_${this.back}`];
  }

  getXZPosition(position = this.position) {
    return {
      x: position.x * BOX_SIZE,
      z: -position.y * BOX_SIZE,
    };
  }

  update(direction) {
    // Update the rotation of the cube.
    this.rotate(direction);

    // Update position model.
    this.position.add(getMoveOffset(direction));
  }

  rotate(direction) {
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
}
