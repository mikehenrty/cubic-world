import * as THREE from 'three';

import Time from './controllers/Time';
import Input from './controllers/Input';
import Cube, {
  EVT_PICKUP,
  EVT_START_MOVE,
  EVT_FINISH_MOVE
} from './Scene/Cube';
import Board from './Scene/Board';
import Model from './Model';
import Text from '/js/Text';
import {
  DEBUG,
  ASPECT_RATIO,
  SCALE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  ORTHO_DEPTH,
  BOX_SIZE,
  DIR_AHEAD,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_BACK,
  PLAYER_ONE,
  PLAYER_TWO,
  FAST_FLIP_DURATION,
  HALF_BOX
} from './constants';


const CAMERA_DISTANCE = 400;
const CAMERA_LATERAL_OFFSET = 150;
const CAMERA_HEIGHT = 300;
const CAMERA_LOOK_DISTANCE = 6 * BOX_SIZE;

export const EVT_CUBE_MOVE = 'CubeMove';


export default class Engine extends EventTarget {

  constructor() {
    super();
    this.player = 0;
    this.v = new THREE.Vector3();

    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = this.getCamera();

    this.input = new Input();
    this.input.onUp = this.initiateMove.bind(this, DIR_AHEAD);
    this.input.onDown = this.initiateMove.bind(this, DIR_BACK);
    this.input.onLeft = this.initiateMove.bind(this, DIR_LEFT);
    this.input.onRight = this.initiateMove.bind(this, DIR_RIGHT);
    this.input.onRelease = this.cancelNextMove.bind(this);

    // The model tracks cube and board positioning.
    this.model = new Model();
    this.model.onScoreUpdate = this.onScoreUpdate.bind(this);

    // Create the main cube scene object.
    this.cube = new Cube( this.model );
    this.cube.addEventListener(EVT_PICKUP, this.onPickUp.bind(this));
    this.cube.addEventListener(EVT_START_MOVE, this.onMoveStart.bind(this));
    this.cube.addEventListener(EVT_FINISH_MOVE, this.onMoveFinish.bind(this));

    // Create opponent's cube.
    this.cubeOpponent = new Cube( this.model, true );
    this.cubeOpponent.addEventListener(EVT_PICKUP, this.onPickUp.bind(this));
    this.cubeOpponent.addEventListener(EVT_FINISH_MOVE,
                                       this.onMoveFinishOpponent.bind(this));

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.autoClear = false;

    this.sceneHUD = this.getSceneHUD();
    this.HUDCamera = this.getHUDCamera();

    this.update = this.update.bind(this);

    // Flag to move camera differently when animating onto colored square.
    this.isEating = false;
  }

  setPlayer(player) {
    this.player = player;
    this.model.setPlayer(player);
    this.cube.updateMeshFromModel();
    this.cubeOpponent.updateMeshFromModel();
    this.scene.add( this.cubeOpponent.getObject3D() );
  }

  weArePlayerOne() {
    this.setPlayer(PLAYER_ONE);
  }

  weArePlayerTwo() {
    this.setPlayer(PLAYER_TWO);
  }

  initWorld(boardData) {
    if (this.board) {
      console.error('Already initialized world', boardData);
      return;
    }

    this.scene.add( this.cube.getObject3D() );
    this.board = new Board( this.model, boardData );
    this.scene.add( this.board.getObject3D() );
    this.scene.add( this.getLighting() );
  }

  getBoardData() {
    return this.model.board.getAsString();
  }

  updateNextMoveDebug() {
    if (!this.nextMoveText) {
      return;
    }

    const nextMove = this.cube.getNextMove();

    this.sceneHUD.remove(this.nextMoveText.getObject3D());
    let moveText = '';
    switch (nextMove) {
      case DIR_AHEAD:
        moveText = '↑';
        break;

      case DIR_LEFT:
        moveText = '←';
        break;

      case DIR_RIGHT:
        moveText = '→';
        break;

      case DIR_BACK:
        moveText = '↓';
        break;

      default:
        moveText = '';
        break;
    }

    this.nextMoveText.update(moveText);
    this.sceneHUD.add(this.nextMoveText.getObject3D());
  }

  updateCountdown() {
    let num;
    if (!this.time.startTime) {
      num = '-';
    } else  {
      num = Math.ceil(this.time.getDeltaUntilStart() / 1000);
      if (num <= 0) {
        num = 'GO!';
      }
    }

    this.sceneHUD.remove(this.countdownText.getObject3D());
    this.countdownText.update(num);
    this.sceneHUD.add(this.countdownText.getObject3D());
  }

  getSceneHUD() {
    const textSize = SCREEN_HEIGHT / 10;
    const score = this.model.getScore();
    const x = -SCREEN_WIDTH / 2 + textSize / 2;
    const y = SCREEN_HEIGHT / 2 - textSize / 2;
    this.textScore = new Text(textSize, score, x, y);

    const sceneHUD = new THREE.Scene();
    sceneHUD.add(this.textScore.getObject3D());

    const countdownSize = SCREEN_HEIGHT / 12;
    const countdownX = 0;
    const countdownY = SCREEN_HEIGHT / 2 - countdownSize / 2 - 30;
    this.countdownText = new Text(countdownSize, '_', countdownX, countdownY);
    sceneHUD.add(this.countdownText.getObject3D());

    // Add FPS to HUD.
    if (DEBUG) {
      const fpsSize = SCREEN_HEIGHT / 18;
      const fpsX = 0;
      const fpsY = SCREEN_HEIGHT / 2 - fpsSize / 2;
      this.fpsText = new Text(fpsSize, '0 fps', fpsX, fpsY);
      sceneHUD.add(this.fpsText.getObject3D());

      const moveX = 0;
      const moveY = SCREEN_HEIGHT / 3 - fpsSize / 2;
      this.nextMoveText = new Text(fpsSize, '', moveX, moveY);
      sceneHUD.add(this.nextMoveText.getObject3D());

      setInterval(() => {
        sceneHUD.remove(this.fpsText.getObject3D());
        this.fpsText.update(Math.round(this.time.getAverageFPS()) + ' fps');
        sceneHUD.add(this.fpsText.getObject3D());
      }, 2000);
    }

    return sceneHUD;
  }

  getHUDCamera() {
    const camera = new THREE.OrthographicCamera(
      -SCREEN_WIDTH / 2, SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2, -SCREEN_HEIGHT / 2,
      -ORTHO_DEPTH / 2, ORTHO_DEPTH / 2
    );

    return camera;
  }

  getCamera() {
    const camera = new THREE.PerspectiveCamera( 70, ASPECT_RATIO, 0.8, 5000 );
    camera.position.set( CAMERA_LATERAL_OFFSET, CAMERA_HEIGHT, CAMERA_DISTANCE );
    this.cameraOffset = new THREE.Vector3(0, 0, -CAMERA_LOOK_DISTANCE);
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

  onScoreUpdate(score) {
    this.sceneHUD.remove(this.textScore.getObject3D());
    this.textScore.update(score);
    this.sceneHUD.add(this.textScore.getObject3D());
  }

  onPickUp({ detail }) {
    const { x, y } = detail;
    console.log('got pickup', x, y);
    this.board.resetSquare(x, y);
  }

  onMoveStart({ detail }) {
    if (detail.duration === FAST_FLIP_DURATION) {
      this.isEating = true;
    }
    this.dispatchEvent(new CustomEvent(EVT_CUBE_MOVE, { detail }));
  }

  initiateMove(direction) {
    if (!this.time.started()) {
      return false;
    }

    this.cube.tryMove(direction);
    DEBUG && this.updateNextMoveDebug();
  }

  initiateMoveOpponent(direction, duration) {
    if (!this.time.started()) {
      return false;
    }

    this.cubeOpponent.tryMove(direction, duration);
  }

  cancelNextMove() {
    if (!this.time.started()) {
      return false;
    }

    this.cube.consumeNextMove();
    DEBUG && this.updateNextMoveDebug();
  }

  onMoveFinish({ detail }) {
    this.isEating = false;
    if (detail.nextMove || this.input.isHolding()) {
      // Need to call this in a setTimeout to prevent jank.
      setTimeout(() => {
        this.initiateMove(detail.nextMove || detail.lastMove);
      }, 1);
    }
    DEBUG && this.updateNextMoveDebug();
  }

  onMoveFinishOpponent({ detail }) {
    if (detail.nextMove) {
      // Need to call this in a setTimeout to prevent jank.
      setTimeout(() => {
        this.initiateMoveOpponent(detail.nextMove);
      }, 1);
    }
  }

  update() {
    requestAnimationFrame( this.update );

    // Stop the countdown refresh soon after game has started.
    if (this.time.startTime + 1000 > this.time.currentTime) {
      this.updateCountdown()
    }

    const delta = this.time.tick();
    this.cube.update(delta);
    this.cubeOpponent.update(delta);

    this.cube.mesh.getWorldPosition(this.v);
    this.camera.position.setZ(this.v.z + CAMERA_DISTANCE);
    this.camera.position.setX(this.v.x + CAMERA_LATERAL_OFFSET);

    // Should we make the camera bouncy?
    if (this.isEating) {
      this.v.y = Math.round((this.v.y - HALF_BOX) / 2);
    } else {
      this.v.y = 0;
    }

    this.cameraLookAt.addVectors(this.v, this.cameraOffset);
    this.camera.lookAt(this.cameraLookAt);

    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );
    this.renderer.render( this.sceneHUD, this.HUDCamera );
  }

  async start(delay) {
    if (!this.board) {
      this.initWorld();
    }
    /*
    const scale = Math.max(
      window.innerWidth / SCREEN_WIDTH,
      window.innerHeight / SCREEN_HEIGHT
    );
    */
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.transform = `scale(${ 1 / SCALE })`;

    this.time.start(delay || 0);
    this.update();
  }
}
