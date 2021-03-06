import * as THREE from 'three';
import {
  BOX_SIZE,
  HALF_BOX,
  BOARD_DEPTH,
  BOARD_WIDTH,
  GRID_COLOR,
} from '/browser/js/Engine/constants';


// Where does this sit on the Y plane.
const Y_OFFSET = 0;
const Z_OFFSET = 1;

export default class Grid {
  constructor() {
    const pixelWidth = BOARD_WIDTH * BOX_SIZE;
    const pixelDepth = BOARD_DEPTH * BOX_SIZE;
    const color =  new THREE.Color(GRID_COLOR);

    const halfWidth = Math.round(pixelWidth / 2);

    let j = 0;
    let vertices = [], colors = [];

    for ( var i = 0, k = HALF_BOX + Z_OFFSET; i <= BOARD_DEPTH; i ++, k -= BOX_SIZE ) {
      vertices.push( -halfWidth, Y_OFFSET, k, halfWidth, Y_OFFSET, k );

      color.toArray( colors, j ); j += 3;
      color.toArray( colors, j ); j += 3;
    }

    for ( let i = 0; i <= BOARD_WIDTH; i++ ) {
      const x = -halfWidth + (i * BOX_SIZE);
      vertices.push( x, Y_OFFSET, HALF_BOX + Z_OFFSET, x, Y_OFFSET, - pixelDepth + HALF_BOX + Z_OFFSET );

      color.toArray( colors, j ); j += 3;
      color.toArray( colors, j ); j += 3;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    var material = new THREE.LineBasicMaterial( {
      linewidth: 1.2,
      vertexColors: THREE.VertexColors,
    } );

    this.lines = new THREE.LineSegments( geometry, material );
    this.lines.name = 'GridLines';
  }

  getObject3D() {
    return this.lines;
  }
}
