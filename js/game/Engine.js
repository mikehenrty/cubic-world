import * as THREE from 'three';
import Time from './Time';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = 200;
const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;
const BOX_SIZE = 50;
const CUBE_ROTATION_SPEED = 1.0;

export default class Engine {

  constructor() {
    this.time = new Time();
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, ASPECT_RATIO, 0.8, 1600 );
    this.camera.position.set( 130, 400, 300 );
    this.camera.lookAt( 20, -100, -150 );

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
    this.scene.add( this.cube );

    /*
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    */

    var gridHelper = new THREE.GridHelper( 100000, 2001 );
    this.scene.add( gridHelper );

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    this.scene.add( ambientLight );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.animate = this.animate.bind(this);
  }

  animate() {
    const delta = this.time.tick();
    this.cube.rotation.x -= (delta / 16) * CUBE_ROTATION_SPEED * 0.05;
    this.cube.position.setZ(this.cube.position.getComponent(2) -  2 * (delta / 16));
    this.camera.position.setZ(this.camera.position.getComponent(2) - 2 * (delta / 16));
    requestAnimationFrame( this.animate );
    this.renderer.render( this.scene, this.camera );
  }

  start() {
    const scale = Math.max(
      window.innerWidth / SCREEN_WIDTH,
      window.innerHeight / SCREEN_HEIGHT
    );
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.transform = `scale(${scale})`;

    this.time.start();
    this.animate();
  }
}
