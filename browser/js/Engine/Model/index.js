import * as THREE from 'three';
import { BOARD_WIDTH, BOARD_DEPTH } from '/js/Engine/constants';
import { getMoveOffset } from '/js/Engine/Scene/Cube/static-helpers';
import BoardModel from './BoardModel';
import CubeModel from './CubeModel';
import { PLAYER_ONE, PLAYER_TWO } from '../constants';


export default class Model {
  constructor() {
    this.v2 = new THREE.Vector2();

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
    const position = this.getCube(isOpponent).getPosition;
    return this.pickUpBoardSquare(position.x, position.y);
  }

  pickUpBoardSquare(x, y) {
    const enemy = this.board.getSide(x, y);
    if (enemy) {
      this.board.pickUpSquare(x, y);
      ++this.score;
      this.onScoreUpdate && this.onScoreUpdate(this.score);
      return true;
    }
    return false;
  }

  canMove(direction, isOpponent) {
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

    // If we have a colored tile, we can only move onto that square
    // if the next top or bottom will match the tile color.
    const enemySide = this.board.getSide(x, y);
    if (enemySide) {
      const nextTop = cube.getNextTopSide(direction);
      const nextBottom = cube.getNextBottomSide(direction);
      return enemySide === nextBottom || enemySide === nextTop;
    }

    return true;
  }
}
