import * as THREE from 'three';
import Time from './Time';
import Cube from './Cube';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = 200;
const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;

export default class Engine {

  constructor() {
    this.time = new Time();
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, ASPECT_RATIO, 0.8, 1600 );
    this.camera.position.set( 130, 400, 300 );
    this.camera.lookAt( 20, -100, -150 );

    this.cube = new Cube();
    this.scene.add( this.cube.getObject3D() );

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
    const lastCubeZ = this.cube.mesh.position.z;
    this.cube.update(delta);
    const deltaCubeZ = this.cube.mesh.position.z - lastCubeZ;
    this.camera.position.z += deltaCubeZ;
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
