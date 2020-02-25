import * as THREE from 'three';
import { BOARD_DEPTH, BOARD_WIDTH } from '/js/game/objects/Board/';
import {
  BOX_SIZE,
  HALF_BOX,
  SIDE_COLORS
} from '/js/game/objects/Cube/static-helpers';

const DEFAULT_SQUARE_COLOR = 'black';

export default class Squares {
  constructor() {
    this.squareColor = new THREE.Color(DEFAULT_SQUARE_COLOR);
    this.enemyColors = [];
    for (let i = 1; i < 6; i++) {
      this.enemyColors[i - 1] = new THREE.Color(SIDE_COLORS[i]);
    }

    let vertices = [];
    let colors = [];
    let vi = 0;
    let ni = 0;
    let ci = 0;

    const startZ = 0;
    const startX = Math.round( HALF_BOX + (-BOARD_WIDTH / 2) * BOX_SIZE )

    for ( let i = 0; i < BOARD_DEPTH; i++ ) {
      const centerZ = startZ - i * BOX_SIZE;
      for ( let j = 0; j < BOARD_WIDTH; j++ ) {
        const centerX = startX + j * BOX_SIZE;

        // Calculate 4 coords surrounding center
        const farRightX = centerX + HALF_BOX;
        const farRightZ = centerZ + HALF_BOX;

        const nearRightX = centerX + HALF_BOX;
        const nearRightZ = centerZ - HALF_BOX;

        const nearLeftX = centerX - HALF_BOX;
        const nearLeftZ = centerZ - HALF_BOX;

        const farLeftX = centerX - HALF_BOX;
        const farLeftZ = centerZ + HALF_BOX;

        // Triangle Face 1.
        vertices[ vi++ ] = farLeftX;
        vertices[ vi++ ] = 0;
        vertices[ vi++ ] = farLeftZ;

        vertices[ vi++ ] = farRightX;
        vertices[ vi++ ] = 0;
        vertices[ vi++ ] = farRightZ;

        vertices[ vi++ ] = nearLeftX;
        vertices[ vi++ ] = 0
        vertices[ vi++ ] = nearLeftZ;

        // Triangle Face 2.
        vertices[ vi++ ] = farRightX;
        vertices[ vi++ ] = 0;
        vertices[ vi++ ] = farRightZ;

        vertices[ vi++ ] = nearRightX
        vertices[ vi++ ] = 0;
        vertices[ vi++ ] = nearRightZ;

        vertices[ vi++ ] = nearLeftX;
        vertices[ vi++ ] = 0;
        vertices[ vi++ ] = nearLeftZ;


        let faceColor = ( Math.random() > .9 )
          ? this.getRandomEnemyColor()
          : this.squareColor;

        const colorR = faceColor.r;
        const colorG = faceColor.g;
        const colorB = faceColor.b;

        colors[ ci++ ] = colorR;
        colors[ ci++ ] = colorG;
        colors[ ci++ ] = colorB;

        colors[ ci++ ] = colorR;
        colors[ ci++ ] = colorG;
        colors[ ci++ ] = colorB;

        colors[ ci++ ] = colorR;
        colors[ ci++ ] = colorG;
        colors[ ci++ ] = colorB;

        colors[ ci++ ] = colorR;
        colors[ ci++ ] = colorG;
        colors[ ci++ ] = colorB;

        colors[ ci++ ] = colorR;
        colors[ ci++ ] = colorG;
        colors[ ci++ ] = colorB;

        colors[ ci++ ] = colorR;
        colors[ ci++ ] = colorG;
        colors[ ci++ ] = colorB;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      side: THREE.FrontSide,
    });

    this.plane = new THREE.Mesh( geometry, material );
    this.plane.position.set(0, -1, 0);
  }

  getRandomEnemyColor() {
    const index = Math.round(Math.random() * (this.enemyColors.length - 1));
    return this.enemyColors[ index ];
  }

  getObject3D() {
    return this.plane;
  }
}
