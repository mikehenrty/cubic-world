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

    // Position will be in positive X/Y coordinates that map to X/-Z coords.
    this.position = new THREE.Vector2();

    // Cache quaternions to represent each of 24 orientations.
    this.quaternions = getAllQuaternionsForCube();
  }

  getStaticQuaternion() {
    return this.quaternions[`${this.top}_${this.back}`];
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position.copy(position);
  }

  update(direction) {
    // Update the rotation of the cube.
    this.rotate(direction);

    // Update position model.
    this.position.add(getMoveOffset(direction));
  }

  getNextTopSide(direction) {
    let dir = null;
    switch(direction) {
      case DIR_AHEAD:
        dir = this.back;
        break;

      case DIR_LEFT:
        dir = this.right;
        break;

      case DIR_RIGHT:
        dir = this.left;
        break;

      case DIR_BACK:
        dir = this.front;
        break;
    }

    return dir;
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
