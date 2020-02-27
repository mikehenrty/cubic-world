import * as THREE from 'three';
import { BOARD_DEPTH, BOARD_WIDTH } from '/js/game/constants';

// We may not want to include 6 as an enemy side.
const SIDE_ENEMIES = [1, 2, 3, 4, 5];
const NUM_ENEMY_TYPES = SIDE_ENEMIES.length;

export default class BoardModel {
  constructor() {
    this.squares = [];

    for (let x = 0; x < BOARD_WIDTH; x++) {
      this.squares[x] = this.squares[x] || [];
      for (let y = 0; y < BOARD_DEPTH; y++) {
        this.squares[y] = this.squares[y] || [];

        // Add occassional enemy.
        if (Math.random() > 0.9) {
          this.squares[x][y] = this.getRandomEnemySide();
        }
      }
    }

    this.startingPosition = new THREE.Vector2(Math.floor(BOARD_WIDTH / 2), 0);
  }

  getCubeStartingPosition() {
    return this.startingPosition;
  }

  getSide(x, y) {
    return this.squares[x] && this.squares[x][y];
  }

  getRandomEnemySide() {
    return SIDE_ENEMIES[ Math.round(Math.random() * (NUM_ENEMY_TYPES - 1)) ];
  }
}
