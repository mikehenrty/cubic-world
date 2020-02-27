import * as THREE from 'three';
import {
  BOX_SIZE,
  HALF_BOX,
  BOARD_DEPTH,
  BOARD_WIDTH,
} from '/js/game/constants';
import Squares from './Squares';
import Grid from './Grid';

const LINE_COLOR = 0x888888;

export default class Board {
  constructor(model) {
    this.model = model;
    this.squares = new Squares(this.model);
    this.grid = new Grid();

    this.group = new THREE.Group();

    this.group.attach(this.squares.getObject3D());
    this.group.attach(this.grid.getObject3D());
    // Lift the grid slightly off the ground for effect.
    this.grid.getObject3D().position.setY(1);
  }

  getObject3D() {
    return this.group;
  }
}
