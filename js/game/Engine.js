import * as THREE from 'three';
import Time from './controllers/Time';
import Input from './controllers/Input';
import Cube from './objects/Cube/';
import Board from './objects/Board/';
import Model from './Model/';
import {
  PIXEL_WIDTH,
  BOX_SIZE,
  DIR_AHEAD,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_BACK
} from '/js/game/constants';

const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const SCREEN_WIDTH = PIXEL_WIDTH;
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

    this.camera = this.getCamera();

    // The model tracks cube and board positioning.
    this.model = new Model();

    this.cube = new Cube( this.model );
    this.cube.onMoveFinish = this.onMoveFinish.bind(this);
    this.scene.add( this.cube.getObject3D() );

    this.board = new Board( this.model );
    this.scene.add( this.board.getObject3D() );
    this.scene.add( this.getLighting() );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.input = new Input();
    this.input.onUp = this.initiateMove.bind(this, DIR_AHEAD);
    this.input.onDown = this.initiateMove.bind(this, DIR_BACK);
    this.input.onLeft = this.initiateMove.bind(this, DIR_LEFT);
    this.input.onRight = this.initiateMove.bind(this, DIR_RIGHT);

    this.nextMove = null;

    this.update = this.update.bind(this);
  }

  getCamera() {
    const camera = new THREE.PerspectiveCamera( 70, ASPECT_RATIO, 0.8, 5000 );
    camera.position.set( CAMERA_LATERAL_OFFSET, CAMERA_HEIGHT, -CAMERA_DISTANCE );
    this.cameraOffset = new THREE.Vector3(0, 0, -CAMERA_DISTANCE);
    this.cameraLookAt = new THREE.Vector3();
    camera.lookAt( 20, -100, -CAMERA_DISTANCE );
    return camera;
  }

  getLighting() {
    /*
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    */

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    return ambientLight;
  }

  initiateMove(direction) {
    const moveSucceeded = this.cube.move(direction);
    if (moveSucceeded) {
      this.nextMove = null;
    } else {
      // Save unsuccessful moves for when current move completes.
      this.nextMove = direction;
    }
  }

  onMoveFinish(direction) {
    if (this.model.attemptPickup()) {
      const cubePosition = this.model.getCubePosition();
      this.board.resetSquare(cubePosition.x, cubePosition.y);
    }

    // Make sure we have something else to do before continuing.
    if ( !this.nextMove && !this.input.isHolding()) {
      return;
    }


    // We use set timeout to avoid stuttering
    // when transition between cube animations.
    setTimeout(() => {
      if (this.nextMove) {
        this.initiateMove(this.nextMove);
      } else if (this.input.isHolding()) {
        this.initiateMove(direction);
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
