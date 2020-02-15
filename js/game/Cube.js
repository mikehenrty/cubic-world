import * as THREE from 'three';

const BOX_SIZE = 50;
const CUBE_ROTATION_SPEED = 1.0;

const FLIP_DURATION = 500;

const COLOR_BLACK = 'black';
const COLOR_RED = 'red';
const COLOR_BLUE = 'blue';
const COLOR_GREEN = 'honeydew';
const COLOR_YELLOW = 'yellow';
const COLOR_PURPLE = 'violet';

const CUBE_COLORS = [
  COLOR_BLACK,
  COLOR_RED,
  COLOR_BLUE,
  COLOR_GREEN,
  COLOR_YELLOW,
  COLOR_PURPLE,
]

// Monkey patch mesh prototype.
THREE.Object3D.prototype.rotateAroundWorldAxis = function() {

  var q1 = new THREE.Quaternion();
  return function ( point, axis, angle ) {

    q1.setFromAxisAngle( axis, angle );

    this.quaternion.multiplyQuaternions( q1, this.quaternion );
    //this.applyQuaternion( q1 );

    this.position.sub( point );
    this.position.applyQuaternion( q1 );
    this.position.add( point );

    return this;
  }
}();

export default class Cube {
  constructor() {
    var geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);

    let colors = CUBE_COLORS.slice(0);
    for ( var i = 0; i < geometry.faces.length; i+=2 ) {
      const color = colors.pop();
      geometry.faces[ i ].color.setStyle( color );
      geometry.faces[ i + 1 ].color.setStyle( color );
    }
    var material = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      vertexColors: THREE.FaceColors,
    });
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.set(0, BOX_SIZE / 2, 0);

    // Setup rotation.
    this.axis = new THREE.Vector3(0, 0, 1);
    this.pivot = new THREE.Vector3(BOX_SIZE / 2, 0, 0);
  }

  getMesh() {
    return this.mesh;
  }

  update(delta) {
    this.mesh.rotateAroundWorldAxis(
      this.pivot,
      this.axis,
      CUBE_ROTATION_SPEED * Math.PI * delta / 1000,
    );
    this.mesh.position.setZ(this.mesh.position.getComponent(2) -  2 * (delta / 16));
  }
}
