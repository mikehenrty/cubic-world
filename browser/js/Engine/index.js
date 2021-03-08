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
import Text from '/browser/js/Text';
import {
  DEBUG,
  ASPECT_RATIO,
  SCALE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  ORTHO_DEPTH,
  BOARD_DEPTH,
  BOX_SIZE,
  DIR_AHEAD,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_BACK,
  PLAYER_ONE,
  PLAYER_TWO,
  FAST_FLIP_DURATION,
  HALF_BOX,
  END_DELAY
} from './constants';


const CAMERA_DISTANCE = 300;
const CAMERA_LATERAL_OFFSET = 150;
const CAMERA_HEIGHT = 300;
const CAMERA_LOOK_DISTANCE = 6 * BOX_SIZE;

export const EVT_CUBE_MOVE = 'CubeMove';
export const EVT_WIN = 'PlayerWin';


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
      console.warn('Already initialized world', boardData);
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
      if (num <= 0 && num > -500) {
        num = 'GO!';
      } else if (num <= 0) {
        num = '';
      }
    }

    this.setCountdown(num);
  }

  setCountdown(text) {
    this.sceneHUD.remove(this.countdownText.getObject3D());
    this.countdownText.update(text);
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
    const countdownY = SCREEN_HEIGHT / 2 - countdownSize / 2 - 100;
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
    
    var light = new THREE.DirectionalLight( 0xFFFFFF, 0.45 );
    light.position.set(200, 50, 25);
    var helper = new THREE.DirectionalLightHelper( light, 15 );
    this.scene.add( light );
    this.scene.add( helper );

    var light = new THREE.DirectionalLight( 0xFFFFFF, 0.45 );
    light.position.set(0, 50, 125);
    var helper = new THREE.DirectionalLightHelper( light, 15 );
    this.scene.add( light );
    this.scene.add( helper );
    

    /*
    var point = new THREE.PointLight( 0xffffff, 1, 1000 );
    point.position.set( 200, 200, 200 );
    this.cube.getObject3D().add( point );

    var light3 = new THREE.PointLight( 0xffffff, 1, 1000 );
    light3.position.set( -50, 50, -100 );
    this.cube.getObject3D().add( light3 );

    var light4 = new THREE.PointLight( 0xffffff, 1, 1000 );
    light4.position.set( -50, 50, 100 );
    this.cube.getObject3D().add( light4 );
    */
    // const light = new THREE.DirectionalLight(color, intensity);
    // this.scene.add(light);
    //

    /*
    for (let i = 0; i < 20; i++) {
      continue;
      let pointLight = new THREE.PointLight( 0xff0000, 500, 500 );
      pointLight.position.set( 50, 240, -50 * i + 100 );
      this.scene.add( pointLight );

      let sphereSize = 10;
      let pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
      this.scene.add( pointLightHelper );
    }
    */
    

    /*
    for (let i = 0; i < 3; i++) {
      var spotLight = new THREE.SpotLight( 0xffffff, 0.4, 700, Math.PI / 8, 0, 1 );
      spotLight.position.set( 200, 500, -500 - ( 600 * i ));
      // spotLight.shadow.mapSize.width = 0
      // spotLight.shadow.mapSize.height = 0;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;

      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 3000;
      spotLight.shadow.camera.fov = 1;
      spotLight.target = this.cube.getObject3D();
      this.scene.add( spotLight );
      // this.scene.add( spotLight.target );

      // var spotLightHelper = new THREE.SpotLightHelper( spotLight );
      //this.scene.add( spotLightHelper );
    }
    */

    // var ambientLight = new THREE.AmbientLight( 0x606060, 0.8 );
    // return ambientLight;
    var areaLight = new THREE.HemisphereLight( 0xffffff, 0x000000, 0.9 );
    // var helper = new THREE.DirectionalLightHelper( areaLight, 15 );
    // this.scene.add( helper );
    return areaLight;
  }

  onScoreUpdate(score) {
    this.sceneHUD.remove(this.textScore.getObject3D());
    this.textScore.update(score);
    this.sceneHUD.add(this.textScore.getObject3D());
  }

  onPickUp({ detail }) {
    const { x, y } = detail;
    this.board.resetSquare(x, y);
  }

  onMoveStart({ detail }) {
    if (detail.duration === FAST_FLIP_DURATION) {
      this.isEating = true;
    }
    this.dispatchEvent(new CustomEvent(EVT_CUBE_MOVE, { detail }));
  }

  initiateMove(direction) {
    if (!this.time.running()) {
      return false;
    }

    this.cube.tryMove(direction);
    DEBUG && this.updateNextMoveDebug();
  }

  initiateMoveOpponent(direction, duration) {
    if (!this.time.running()) {
      return false;
    }

    this.cubeOpponent.tryMove(direction, duration);
  }

  cancelNextMove() {
    if (!this.time.running()) {
      return false;
    }

    this.cube.consumeNextMove();
    DEBUG && this.updateNextMoveDebug();
  }

  onMoveFinish({ detail }) {
    this.isEating = false;

    // Check if we won.
    if (this.model.weWin()) {
      // this.dispatchEvent(new CustomEvent(EVT_WIN));
      this.onWin();
      return;
    }

    // Continue moving if we received a new direction,
    // or the old direction is being held.
    if (detail.nextMove || this.input.isHolding()) {
      // Need to call this in a setTimeout to prevent jank.
      setTimeout(() => {
        this.initiateMove(detail.nextMove || detail.lastMove);
      }, 1);
    }
    DEBUG && this.updateNextMoveDebug();
  }

  onMoveFinishOpponent({ detail }) {
    // Check if opponent won.
    if (this.model.theyWin()) {
      this.onWin(true);
      return;
    }

    if (detail.nextMove) {
      // Need to call this in a setTimeout to prevent jank.
      setTimeout(() => {
        this.initiateMoveOpponent(detail.nextMove);
      }, 1);
    }
  }

  onWin(isOpponent) {
    this.time.end();

    const winText = isOpponent ? 'You lose!' : 'You win!';
    this.setCountdown(winText);
  }

  signalDisconnect() {
    this.setCountdown('disconnected');
  }

  update() {
    if (this.time.ended() && this.time.timeSinceEnded() > END_DELAY) {
      location.reload();
      return;
    }

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
    //this.camera.position.setX(this.v.x + CAMERA_LATERAL_OFFSET);

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
