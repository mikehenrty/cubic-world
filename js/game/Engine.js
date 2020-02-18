import * as THREE from 'three';
import Time from './Time';
import Cube from './Cube';
import Input from './Input';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = 100;
const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;

export default class Engine {

  constructor() {
    this.v = new THREE.Vector3();

    this.time = new Time();
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, ASPECT_RATIO, 0.8, 2000 );
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


    this.input = new Input();
    this.input.onUp = this.cube.move.bind(this.cube, 'AHEAD');
    this.input.onDown = this.cube.move.bind(this.cube, 'BACK');
    this.input.onLeft = this.cube.move.bind(this.cube, 'LEFT');
    this.input.onRight = this.cube.move.bind(this.cube, 'RIGHT');

    this.animate = this.animate.bind(this);
  }

  animate() {
    requestAnimationFrame( this.animate );

    const delta = this.time.tick();
    this.cube.update(delta);
    this.cube.mesh.getWorldPosition(this.v);
    // TODO: how to move the camera?
    this.camera.lookAt(this.v);
    //
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
