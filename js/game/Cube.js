import * as THREE from 'three';

const BOX_SIZE = 50;
const CUBE_ROTATION_SPEED = 1.0;

export default class Cube {
  constructor() {
    var geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    for ( var i = 0; i < geometry.faces.length; i+=2 ) {
      const color = Math.random() * 0xffffff;
      geometry.faces[ i ].color.setHex( color );
      geometry.faces[ i + 1 ].color.setHex( color );
    }
    var material = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      vertexColors: THREE.FaceColors,
    });
    this.cube = new THREE.Mesh( geometry, material );
    this.cube.position.set(0, BOX_SIZE / 2, 0);
  }

  getMesh() {
    return this.cube;
  }

  update(delta) {
    this.cube.rotation.x -= (delta / 16) * CUBE_ROTATION_SPEED * 0.05;
    this.cube.position.setZ(this.cube.position.getComponent(2) -  2 * (delta / 16));
  }
}
