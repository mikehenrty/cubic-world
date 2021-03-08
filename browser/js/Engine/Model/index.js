import * as THREE from 'three';
import { BOARD_WIDTH, BOARD_DEPTH } from '/browser/js/Engine/constants';
import { getMoveOffset } from '/browser/js/Engine/Scene/Cube/static-helpers';
import BoardModel from './BoardModel';
import CubeModel from './CubeModel';
import { PLAYER_ONE, PLAYER_TWO } from '../constants';


export default class Model {
  constructor() {
    this.v2 = new THREE.Vector2();
    this.v2secondary = new THREE.Vector2();

    this.playerNum = 0;
    this.score = 0;

    this.cube = new CubeModel();
    this.cubeOpponent = new CubeModel();
    this.board = new BoardModel();

    this.cube.setPosition(this.board.getCubeStartPos());
  }

  getCube(isOpponent) {
    return isOpponent ? this.cubeOpponent : this.cube;
  }

  setPlayer(playerNum) {
    if (playerNum !== PLAYER_ONE && playerNum !== PLAYER_TWO) {
      console.error('Got weird player num', playerNum);
      return;
    }

    const otherPlayerNum = (playerNum === PLAYER_ONE) ? PLAYER_TWO : PLAYER_ONE;
    this.cube.setPosition(this.board.getCubeStartPos(playerNum));
    this.cubeOpponent.setPosition(this.board.getCubeStartPos(otherPlayerNum));
  }

  checkWin(isOpponent) {
    const { y } = this.getCube(isOpponent).getPosition();
    return this.board.isWinningPosition(y);
  }

  weWin() {
    return this.checkWin();
  }

  theyWin() {
    return this.checkWin(true);
  }

  getScore() {
    return this.score;
  }

  updateCube(direction, isOpponent) {
    this.getCube(isOpponent).update(direction);
  }

  getCubePosition(isOpponent) {
    return this.getCube(isOpponent).getPosition();
  }

  getCubeStaticQaternion(isOpponent) {
    return this.getCube(isOpponent).getStaticQuaternion();
  }

  getBoardSquareValue(x, y) {
    return this.board.getSide(x, y);
  }

  attemptPickup(isOpponent) {
    const { x, y } = this.getCube(isOpponent).getPosition();
    return this.pickUpBoardSquare(x, y, isOpponent);
  }

  pickUpBoardSquare(x, y, isOpponent) {
    const enemy = this.board.getSide(x, y);
    if (enemy) {
      this.board.pickUpSquare(x, y);
      if (!isOpponent) {
        ++this.score;
        this.onScoreUpdate && this.onScoreUpdate(this.score);
      }
      return true;
    }
    return false;
  }

  canPickUp(direction, isOpponent) {
    const cube = this.getCube(isOpponent);

    this.v2.copy(cube.position).add(getMoveOffset(direction));
    const x = this.v2.x;
    const y = this.v2.y;

    const enemySide = this.board.getSide(x, y);
    if (!enemySide) {
      return false;
    }

    // If we have a colored tile, we can only move onto that square
    // if the next top or bottom will match the tile color.
    const nextTop = cube.getNextTopSide(direction);
    const nextBottom = cube.getNextBottomSide(direction);
    return enemySide === nextBottom || enemySide === nextTop;
  }

  overlapsACube(v2) {
    if (v2.equals(this.cube.position)) {
      return true;
    }
    if (v2.equals(this.cubeOpponent.getPosition())) {
      return true;
    }

    return false;
  }

  moveCube(direction, isOpponent) {
    this.getCube(isOpponent).setDirection(direction);
  }

  cubeCanMove(direction, isOpponent) {
    const cube = this.getCube(isOpponent);

    this.v2.copy(cube.position).add(getMoveOffset(direction));
    const x = this.v2.x;
    const y = this.v2.y;

    if (x < 0 || x >= BOARD_WIDTH) {
      return false;
    }

    if (y < 0 || y >= BOARD_DEPTH) {
      return false;
    }

    if (this.overlapsACube(this.v2)) {
      return false;
    }

    // For moves originating on this client, we will check
    // if we received a move onto this square from opponent.
    if (!isOpponent && this.cubeOpponent.direction) {
      this.v2secondary.copy(this.cubeOpponent.position)
                      .add(getMoveOffset(this.cubeOpponent.direction));

      if (this.v2.equals(this.v2secondary)) {
        return false;
      }
    }

    if (this.board.isEnemy(x, y)) {
      return this.canPickUp(direction, isOpponent);
    }

    return true;
  }
}
