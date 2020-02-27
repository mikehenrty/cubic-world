import * as THREE from 'three';
import Time from './controllers/Time';
import Input from './controllers/Input';
import Cube from './objects/Cube/';
import Board from './objects/Board/';
import Model from './Model/';
import {
  BOX_SIZE,
  DIR_AHEAD,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_BACK
} from '/js/game/constants';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = 100;
const SCREEN_HEIGHT = SCREEN_WIDTH / ASPECT_RATIO;

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

    // The model tracks cube and board positioning.
    this.model = new Model();

    this.cube = new Cube( this.model );
    this.cube.onMoveFinish = this.onMoveFinish.bind(this);
    this.scene.add( this.cube.getObject3D() );

    this.board = new Board( this.model );
    this.scene.add( this.board.getObject3D() );

    /*
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    */

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    this.scene.add( ambientLight );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);


    this.input = new Input();
    this.input.onUp = this.initiateMove.bind(this, DIR_AHEAD);
    this.input.onDown = this.initiateMove.bind(this, DIR_BACK);
    this.input.onLeft = this.initiateMove.bind(this, DIR_LEFT);
    this.input.onRight = this.initiateMove.bind(this, DIR_RIGHT);

    this.update = this.update.bind(this);
  }

  initiateMove(direction) {
    if (this.board.canMove(direction, this.cube.getPositionVec())) {
      this.cube.move(direction);
    }
  }

  onMoveFinish(direction) {
    setTimeout(() => {
      if (this.input.isHolding()) {
        this.cube.initiateMove(direction);
      }
    }, 10);
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
