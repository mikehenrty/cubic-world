import * as THREE from 'three';
import Time from './controllers/Time';
import Input from './controllers/Input';
import Cube from './objects/Cube/';
import Board from './objects/Board/';
import { BOX_SIZE } from './objects/Cube/static-helpers';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = 200;
const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;

const LEVEL_SIZE = 101;
const GRID_DIVISIONS = LEVEL_SIZE;
const GRID_SIZE = LEVEL_SIZE * BOX_SIZE;

const CAMERA_DISTANCE = 350;
const CAMERA_LATERAL_OFFSET = 110;
const CAMERA_HEIGHT = 300;
const CAMERA_LOOK_DISTANCE = 6 * BOX_SIZE;

export default class Engine {

  constructor() {
    this.v = new THREE.Vector3();

    this.time = new Time();
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, ASPECT_RATIO, 0.8, 5000 );
    this.camera.position.set( CAMERA_LATERAL_OFFSET, CAMERA_HEIGHT, -CAMERA_DISTANCE );
    this.cameraOffset = new THREE.Vector3(0, 0, -CAMERA_DISTANCE);
    this.cameraLookAt = new THREE.Vector3();
    this.camera.lookAt( 20, -100, -CAMERA_DISTANCE );

    this.cube = new Cube();
    this.cube.onMoveFinish = this.onMove.bind(this);
    this.scene.add( this.cube.getObject3D() );

    /*
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    */

    this.board = new Board();
    this.scene.add( this.board.getObject3D() );

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

    this.update = this.update.bind(this);
  }

  onMove(direction) {
    setTimeout(() => {
      if (this.input.isHolding()) {
        this.cube.move(direction);
      }
    }, 10)
  }

  update() {
    requestAnimationFrame( this.update );

    const delta = this.time.tick();
    this.cube.update(delta);

    this.cube.mesh.getWorldPosition(this.v);
    this.camera.position.setZ(this.v.z + CAMERA_DISTANCE);
    //this.camera.position.setX(this.v.x + CAMERA_LATERAL_OFFSET);
    this.cameraLookAt.addVectors(this.v, this.cameraOffset);
    this.camera.lookAt(this.cameraLookAt);

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
    this.update();
  }
}
