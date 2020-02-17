import * as THREE from 'three';

// Monkey patch mesh prototype to add `rotateAroundWorldAxis` method.
export function monkeyPathRotateWorld() {
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
}


export function createCubeMoveAnimation( trackName, period, axis ) {
  const from = new THREE.Quaternion();
  const to = new THREE.Quaternion();
  from.setFromAxisAngle( axis, 0 );
  to.setFromAxisAngle( axis, -Math.PI / 2 );

  const times = [ 0, period ];
  const values = [ ...from.toArray(), ...to.toArray() ];
  const track = new THREE.QuaternionKeyframeTrack( trackName, times, values );

  return new THREE.AnimationClip( null, period, [ track ] );
};
