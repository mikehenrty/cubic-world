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
    this.cube.update(direction);
  }

  getCubePosition() {
    return this.cube.getPosition();
  }

  getCubeStaticQaternion() {
    return this.cube.getStaticQuaternion();
  }

  getBoardSquareValue(x, y) {
    return this.board.getSide(x, y);
  }

  attemptPickup() {
    return this.pickUpBoardSquare(this.cube.position.x, this.cube.position.y);
  }

  pickUpBoardSquare(x, y) {
    const enemy = this.board.getSide(x, y);
    if (enemy) {
      this.board.pickUpSquare(x, y);
      return true;
    }
    return false;
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

    // If we have a colored tile, we can only move onto that square
    // if the next top or bottom will match the tile color.
    const enemySide = this.board.getSide(x, y);
    if (enemySide) {
      const nextTop = this.cube.getNextTopSide(direction);
      const nextBottom = this.cube.getNextBottomSide(direction);
      return enemySide === nextBottom || enemySide === nextTop;
    }

    return true;
  }
}
