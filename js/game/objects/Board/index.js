import * as THREE from 'three';
import {
  BOX_SIZE,
  HALF_BOX,
  BOARD_DEPTH,
  BOARD_WIDTH,
} from '/js/game/constants';
import { getMoveOffset } from '/js/game/objects/Cube/static-helpers';
import Squares from './Squares';
import Grid from './Grid';

const LINE_COLOR = 0x888888;

export default class Board {
  constructor(model) {
    this.v2 = new THREE.Vector2();

    this.model = model;
    this.squares = new Squares(this.model);
    this.grid = new Grid();

    this.group = new THREE.Group();

    this.group.attach(this.squares.getObject3D());
    this.group.attach(this.grid.getObject3D());
    // Lift the grid slightly off the ground for effect.
    this.grid.getObject3D().position.setY(1);
  }

  canMove(direction, position) {
    this.v2.copy(position).add(getMoveOffset(direction));

    const x = this.v2.x;
    const y = this.v2.y;
    const halfWidth = BOARD_WIDTH / 2;

    if (x < -halfWidth || x > halfWidth) {
      return false;
    }

    if (y < 0 || y > BOARD_DEPTH - 1) {
      return false;
    }


    return true;
  }

  getObject3D() {
    return this.group;
  }
}
