import * as THREE from 'three';
import { getColorForSide } from '/js/game/Scene/Cube/static-helpers';
import {
  BOX_SIZE,
  HALF_BOX,
  BOARD_DEPTH,
  BOARD_WIDTH,
} from '/js/game/constants';

const RESET_COLOR = new THREE.Color('black');

const START_Z = 0;
const START_X = Math.round( HALF_BOX + (-BOARD_WIDTH / 2) * BOX_SIZE )


export default class Squares {
  constructor(model) {
    this.model = model;
    // Map of x-y coords to geometry array index
    this.coordsToBufferIndex = {};

    this.vertices = [];
    this.colors = [];

    let vi = 0;
    let ci = 0;


    for ( let y = 0; y < BOARD_DEPTH; y++ ) {
      for ( let x = 0; x < BOARD_WIDTH; x++ ) {

        // Validate value on the board before adding geometry.
        const sideNum = this.model.getBoardSquareValue(x, y);
        if (!sideNum) {
          continue;
        }

        // Track this square geo and color in case we want to change it later.
        this.setCoordToIndexMap(x, y, vi, ci);

        const faceColor = getColorForSide(sideNum);
        ci = this.setColorIndices(faceColor, ci);
        vi = this.setVertexIndices(x, y, vi);
      }
    }


    const geometry = new THREE.BufferGeometry();
    geometry.name = 'SquaresGeo';
    geometry.setAttribute( 'position', this.getAttribute(this.vertices) );
    geometry.setAttribute( 'color', this.getAttribute(this.colors, true) );

    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      side: THREE.FrontSide,
    });

    this.plane = new THREE.Mesh( geometry, material );
    this.plane.name = 'SquaresMesh';
  }

  getAttribute(data, dynamic) {
    const attribute = new THREE.Float32BufferAttribute( data, 3 );
    dynamic && attribute.setUsage(THREE.DynamicDrawUsage);
    return attribute;
  }

  setColorIndices(faceColor, ci, colors = this.colors) {
    const colorR = faceColor.r;
    const colorG = faceColor.g;
    const colorB = faceColor.b;

    // Decrement to allow for using pre-increment.
    --ci;

    colors[ ++ci ] = colorR;
    colors[ ++ci ] = colorG;
    colors[ ++ci ] = colorB;

    colors[ ++ci ] = colorR;
    colors[ ++ci ] = colorG;
    colors[ ++ci ] = colorB;

    colors[ ++ci ] = colorR;
    colors[ ++ci ] = colorG;
    colors[ ++ci ] = colorB;

    colors[ ++ci ] = colorR;
    colors[ ++ci ] = colorG;
    colors[ ++ci ] = colorB;

    colors[ ++ci ] = colorR;
    colors[ ++ci ] = colorG;
    colors[ ++ci ] = colorB;

    colors[ ++ci ] = colorR;
    colors[ ++ci ] = colorG;
    colors[ ++ci ] = colorB;

    // Correct for using pre-increment.
    return ci + 1;
  }

  setVertexIndices(x, y, vi) {
    const centerZ = START_Z - y * BOX_SIZE;
    const centerX = START_X + x * BOX_SIZE;

    // Calculate 4 coords surrounding center
    const farRightX = centerX + HALF_BOX;
    const farRightZ = centerZ + HALF_BOX;

    const nearRightX = centerX + HALF_BOX;
    const nearRightZ = centerZ - HALF_BOX;

    const nearLeftX = centerX - HALF_BOX;
    const nearLeftZ = centerZ - HALF_BOX;

    const farLeftX = centerX - HALF_BOX;
    const farLeftZ = centerZ + HALF_BOX;

    // Decrement to allow for using pre-increment.
    --vi;

    // Triangle Face 1.
    this.vertices[ ++vi ] = farLeftX;
    this.vertices[ ++vi ] = 0;
    this.vertices[ ++vi ] = farLeftZ;

    this.vertices[ ++vi ] = farRightX;
    this.vertices[ ++vi ] = 0;
    this.vertices[ ++vi ] = farRightZ;

    this.vertices[ ++vi ] = nearLeftX;
    this.vertices[ ++vi ] = 0
    this.vertices[ ++vi ] = nearLeftZ;

    // Triangle Fac++e 
    this.vertices[ ++vi ] = farRightX;
    this.vertices[ ++vi ] = 0;
    this.vertices[ ++vi ] = farRightZ;

    this.vertices[ ++vi ] = nearRightX
    this.vertices[ ++vi ] = 0;
    this.vertices[ ++vi ] = nearRightZ;

    this.vertices[ ++vi ] = nearLeftX;
    this.vertices[ ++vi ] = 0;
    this.vertices[ ++vi ] = nearLeftZ;

    return vi + 1;
  }

  setCoordToIndexMap(x, y, vertexIndex, colorIndex) {
    this.coordsToBufferIndex[`${x}-${y}`] = { vertexIndex, colorIndex };
  }

  setColor(color, x, y) {
    const ci = this.getColorIndex(x, y);
    this.setColorIndices(color, ci, this.getColorArray());

    // Tell three.js that the colors need updating.
    this.plane.geometry.attributes.color.needsUpdate = true;
  }

  getColorArray() {
    return this.plane.geometry.attributes.color.array;
  }

  getColorIndex(x, y) {
    return this.coordsToBufferIndex[`${x}-${y}`].colorIndex;
  }

  getVertexIndex(x, y) {
    return this.coordsToBufferIndex[`${x}-${y}`].vertexIndex;
  }

  resetSquare(x, y) {
    this.setColor(RESET_COLOR, x, y)
  }

  getObject3D() {
    return this.plane;
  }
}
