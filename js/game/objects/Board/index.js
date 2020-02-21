import * as THREE from 'three';
import { BOX_SIZE, HALF_BOX } from '../Cube/static-helpers';
import Squares from './Squares.js';

export const BOARD_DEPTH = 101;
export const BOARD_WIDTH = 7
const LINE_COLOR = 0x888888;

export default class Board {
  constructor() {
    this.squares = new Squares();

    const pixelWidth = BOARD_WIDTH * BOX_SIZE;
    const pixelDepth = BOARD_DEPTH * BOX_SIZE;
    const color =  new THREE.Color(LINE_COLOR);

    const halfWidth = Math.round(pixelWidth / 2);

    let j = 0
    let vertices = [], colors = [];

    for ( var i = 0, k = HALF_BOX; i <= BOARD_DEPTH; i ++, k -= BOX_SIZE ) {
      vertices.push( -halfWidth, 0, k, halfWidth, 0, k );

      color.toArray( colors, j ); j += 3;
      color.toArray( colors, j ); j += 3;
    }

    for ( let i = 0; i <=BOARD_WIDTH; i++ ) {
      const x = -halfWidth + (i * BOX_SIZE);
      vertices.push( x, 0, HALF_BOX, x, 0, - pixelDepth + HALF_BOX );

      color.toArray( colors, j ); j += 3;
      color.toArray( colors, j ); j += 3;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

    this.lines = new THREE.LineSegments( geometry, material );
    this.lines.attach(this.squares.getObject3D());
  }

  getObject3D() {
    return this.lines;
  }
}
