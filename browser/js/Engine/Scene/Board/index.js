import * as THREE from 'three';
import {
  BOX_SIZE,
  HALF_BOX,
  BOARD_DEPTH,
  BOARD_WIDTH,
} from '/js/Engine/constants';
import Squares from './Squares';
import Grid from './Grid';

export default class Board {
  constructor(model, data) {
    this.model = model;

    // If we have a board, use that.
    if (data) {
      this.model.board.setFromString(data);
    }

    this.squares = new Squares(this.model);
    this.grid = new Grid();

    this.group = new THREE.Group();
    this.group.name = 'BoardGroup';

    this.group.attach(this.squares.getObject3D());
    this.group.attach(this.grid.getObject3D());

    // Lift the grid slightly off the ground for effect.
    this.grid.getObject3D().position.setY(1);
  }

  resetSquare(x, y) {
    this.squares.resetSquare(x, y);
  }

  getObject3D() {
    return this.group;
  }
}
