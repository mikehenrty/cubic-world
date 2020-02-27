import * as THREE from 'three';
import { BOARD_WIDTH, BOARD_DEPTH } from '/js/game/constants';
import { getMoveOffset } from '/js/game/objects/Cube/static-helpers';
import BoardModel from './BoardModel';
import CubeModel from './CubeModel';


export default class Model {
  constructor() {
    this.v2 = new THREE.Vector2();

    this.cube = new CubeModel();
    this.board = new BoardModel();

    this.cube.setPosition(this.board.getCubeStartingPosition());
  }

  updateCube(direction) {
    return this.cube.update(direction);
  }

  getCubePosition() {
    return this.cube.getPosition();
  }

  getCubeStaticQaternion() {
    return this.cube.getStaticQuaternion();
  }

  getBoardSquareColor(x, y) {
    return this.board.getColor(x, y);
  }

  canMove(direction) {
    this.v2.copy(this.cube.position).add(getMoveOffset(direction));

    const x = this.v2.x;
    const y = this.v2.y;

    if (x < 0 || x >= BOARD_WIDTH) {
      return false;
    }

    if (y < 0 || y >= BOARD_DEPTH) {
      return false;
    }

    if (this.board.getColor(x, y)) {
      return false;
    }

    return true;
  }
}
