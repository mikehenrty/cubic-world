import * as THREE from 'three';
import { BOARD_DEPTH, BOARD_WIDTH } from '/js/game/objects/Board/';
import { BOX_SIZE } from '/js/game/objects/Cube/static-helpers';

export default class Squares {
  constructor() {
    var geometry = new THREE.PlaneBufferGeometry(
      BOARD_WIDTH * BOX_SIZE,
      BOARD_DEPTH * BOX_SIZE,
      BOARD_WIDTH, BOARD_DEPTH
    );

    var material = new THREE.MeshBasicMaterial( {color: 0x444444, side: THREE.FrontSide} );
    this.plane = new THREE.Mesh( geometry, material );
    this.plane.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    this.plane.position.set(0, -1, -Math.floor(BOARD_DEPTH / 2) * BOX_SIZE );
  }

  getObject3D() {
    return this.plane;
  }
}
