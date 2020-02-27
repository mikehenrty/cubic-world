import * as THREE from 'three';
import { BOARD_DEPTH, BOARD_WIDTH, SIDE_COLORS } from '/js/game/constants';

export default class BoardModel {
  constructor() {
    this.enemyColors = [];
    for (let i = 1; i < 6; i++) {
      this.enemyColors[i - 1] = new THREE.Color(SIDE_COLORS[i]);
    }

    this.squares = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      this.squares[x] = this.squares[x] || [];
      for (let y = 0; y < BOARD_DEPTH; y++) {
        this.squares[y] = this.squares[y] || [];

        // Add occassional enemy color.
        if (Math.random() > 0.9) {
          this.squares[x][y] = this.getRandomEnemyColor();
        }
      }
    }
  }

  getColor(x, y) {
    return this.squares[x] && this.squares[x][y];
  }

  getRandomEnemyColor() {
    const index = Math.round(Math.random() * (this.enemyColors.length - 1));
    return this.enemyColors[ index ];
  }
}
