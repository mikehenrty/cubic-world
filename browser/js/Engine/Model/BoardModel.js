import * as THREE from 'three';
import { BOARD_DEPTH, BOARD_WIDTH } from '/js/Engine/constants';

// We may not want to include 6 as an enemy side.
const SIDE_ENEMIES = [1, 2, 3, 4, 5];
const NUM_ENEMY_TYPES = SIDE_ENEMIES.length;

export default class BoardModel {
  constructor() {
    this.squares = [];

    for (let x = 0; x < BOARD_WIDTH; x++) {
      this.squares[x] = this.squares[x] || [];
      for (let y = 2; y < BOARD_DEPTH; y++) {
        this.squares[y] = this.squares[y] || [];

        // If we are in the farthest row, this is the goal.
        if (y === BOARD_DEPTH - 1) {
          this.squares[x][y] = -1
        } else if (Math.random() > 0.7) {
          // Otherwise add occassional enemy.
          this.squares[x][y] = this.getRandomEnemySide();
        }
      }
    }
  }

  isWinningPosition(y) {
    // Last space on the grid.
    return y === BOARD_DEPTH - 1;
  }

  getAsString() {
    return JSON.stringify(this.squares);
  }

  setFromString(data) {
    this.squares = JSON.parse(data);
  }

  getCubeStartPos(playerNum) {
    let startX;
    if (playerNum === 1) {
      startX = 1;
    } else if (playerNum === 2) {
      startX = BOARD_WIDTH - 2;
    } else {
      startX = Math.floor(BOARD_WIDTH / 2);
    }

    return new THREE.Vector2(startX, 0);
  }

  getSide(x, y) {
    return this.squares[x] && this.squares[x][y];
  }

  isEnemy(x, y) {
    return this.getSide(x, y) > 0;
  }

  pickUpSquare(x, y) {
    this.squares[x][y] = undefined;
  }

  getRandomEnemySide() {
    return SIDE_ENEMIES[ Math.round(Math.random() * (NUM_ENEMY_TYPES - 1)) ];
  }
}
