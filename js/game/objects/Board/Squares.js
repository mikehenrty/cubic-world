import * as THREE from 'three';
import { getColorForSide } from '/js/game/objects/Cube/static-helpers';
import {
  BOX_SIZE,
  HALF_BOX,
  BOARD_DEPTH,
  BOARD_WIDTH,
} from '/js/game/constants';

const THE_COLOR_PURPLE = new THREE.Color('purple');

const START_Z = 0;
const START_X = Math.round( HALF_BOX + (-BOARD_WIDTH / 2) * BOX_SIZE )


export default class Squares {
  constructor(model) {
    this.model = model;
    // Map of x-y coords to geometry array index
    this.coordsToBufferIndex = {};

    this.vertices = [];
    this.colors = [];

    this.vi = -1;
    this.ci = -1;


    for ( let y = 0; y < BOARD_DEPTH; y++ ) {
      for ( let x = 0; x < BOARD_WIDTH; x++ ) {

        // Validate value on the board before adding geometry.
        const sideNum = this.model.getBoardSquareValue(x, y);
        if (!sideNum) {
          continue;
        }

        // Track this square geo and color in case we want to change it later.
        this.setCoordToIndexMap(x, y);

        const faceColor = getColorForSide(sideNum);
        this.setColorIndices(faceColor);
        this.setVertexIndices(x, y);
      }
    }


    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 3 ) );

    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      side: THREE.FrontSide,
    });

    this.plane = new THREE.Mesh( geometry, material );
  }

  getAttribute(data, dynamic) {
    const attribute = new THREE.Float32BufferAttribute( data, 3 );
    dynamic && attribute.setUsage(THREE.DynamicDrawUsage);
  }

  setColorIndices(faceColor, ci) {
    const colorR = faceColor.r;
    const colorG = faceColor.g;
    const colorB = faceColor.b;

    this.colors[ ++this.ci ] = colorR;
    this.colors[ ++this.ci ] = colorG;
    this.colors[ ++this.ci ] = colorB;

    this.colors[ ++this.ci ] = colorR;
    this.colors[ ++this.ci ] = colorG;
    this.colors[ ++this.ci ] = colorB;

    this.colors[ ++this.ci ] = colorR;
    this.colors[ ++this.ci ] = colorG;
    this.colors[ ++this.ci ] = colorB;

    this.colors[ ++this.ci ] = colorR;
    this.colors[ ++this.ci ] = colorG;
    this.colors[ ++this.ci ] = colorB;

    this.colors[ ++this.ci ] = colorR;
    this.colors[ ++this.ci ] = colorG;
    this.colors[ ++this.ci ] = colorB;

    this.colors[ ++this.ci ] = colorR;
    this.colors[ ++this.ci ] = colorG;
    this.colors[ ++this.ci ] = colorB;
  }

  setVertexIndices(x, y) {
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

    // Triangle Face 1.
    this.vertices[ ++this.vi ] = farLeftX;
    this.vertices[ ++this.vi ] = 0;
    this.vertices[ ++this.vi ] = farLeftZ;

    this.vertices[ ++this.vi ] = farRightX;
    this.vertices[ ++this.vi ] = 0;
    this.vertices[ ++this.vi ] = farRightZ;

    this.vertices[ ++this.vi ] = nearLeftX;
    this.vertices[ ++this.vi ] = 0
    this.vertices[ ++this.vi ] = nearLeftZ;

    // Triangle Fac++this.e 
    this.vertices[ ++this.vi ] = farRightX;
    this.vertices[ ++this.vi ] = 0;
    this.vertices[ ++this.vi ] = farRightZ;

    this.vertices[ ++this.vi ] = nearRightX
    this.vertices[ ++this.vi ] = 0;
    this.vertices[ ++this.vi ] = nearRightZ;

    this.vertices[ ++this.vi ] = nearLeftX;
    this.vertices[ ++this.vi ] = 0;
    this.vertices[ ++this.vi ] = nearLeftZ;
  }

  setCoordToIndexMap(x, y, vertexIndex, colorIndex) {
    this.coordsToBufferIndex[`${x}-${y}`] = { vertexIndex, colorIndex };
  }

  setColor(color, x, y) {
    const ci = this.getColorIndex(x, y);
    this.setColorIndices(color, ci);
  }

  getColorIndex(x, y) {
    return this.coordsToBufferIndex[`${x}-${y}`].color;
  }

  getVertexIndex(x, y) {
    return this.coordsToBufferIndex[`${x}-${y}`].vertices;
  }

  resetSquare(x, y) {
    this.setColor(THE_COLOR_PURPLE, x, y)
  }

  getObject3D() {
    return this.plane;
  }
}
