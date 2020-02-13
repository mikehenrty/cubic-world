import * as THREE from 'three';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = 90;
const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;
const BOX_SIZE = 50;

export default class Engine {

  constructor() {
    this.scene = new THREE.Scene();

    const ratio = SCREEN_WIDTH / SCREEN_HEIGHT;
    this.camera = new THREE.PerspectiveCamera( 75, ratio, 0.1, 100000 );
    this.camera.position.set( 400, 300, 1000 );
    this.camera.lookAt( 0, 0, 1000 );
    this.camera.position.z = 4;

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
    this.scene.add( this.cube );

    /*
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
    */

    this.animate = this.animate.bind(this);
  }

  animate() {
    this.cube.rotation.z += 0.04;
    this.cube.position.setX(this.cube.position.getComponent(0) - 3);
    this.camera.position.setX(this.camera.position.getComponent(0) - 3);
    requestAnimationFrame( this.animate );
    this.renderer.render( this.scene, this.camera );
  }

  start() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    var gridHelper = new THREE.GridHelper( 100000, 2001 );
    this.scene.add( gridHelper );

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    this.scene.add( ambientLight );

    const scale = Math.max(window.innerWidth / SCREEN_WIDTH, window.innerHeight / SCREEN_HEIGHT);

    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.transform = `scale(${scale})`;

    this.animate();
  }
}
