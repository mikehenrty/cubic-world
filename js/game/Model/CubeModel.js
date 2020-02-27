import * as THREE from 'three';
import {
  getAllQuaternionsForCube,
  getMoveOffset,
} from '/js/game/objects/Cube/static-helpers';

import {
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
  STARTING_ORIENTATION,
} from '/js/game/constants';


export default class CubeModel {
  constructor() {
    // Set up position and orientation on the playing surface.
    this.top = STARTING_ORIENTATION[SIDE_TOP];
    this.bottom = STARTING_ORIENTATION[SIDE_BOTTOM];
    this.left = STARTING_ORIENTATION[SIDE_LEFT];
    this.right = STARTING_ORIENTATION[SIDE_RIGHT];
    this.front = STARTING_ORIENTATION[SIDE_FRONT];
    this.back = STARTING_ORIENTATION[SIDE_BACK];

    this.position = new THREE.Vector2();

    // Cache quaternions to represent each of 24 orientations.
    this.quaternions = getAllQuaternionsForCube();
  }

  getStaticQuaternion() {
    return this.quaternions[`${this.top}_${this.back}`];
  }

  getXYPosition() {
    return this.position;
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
