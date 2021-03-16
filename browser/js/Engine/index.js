import * as THREE from 'three';

import Stats from 'stats.js';
import { RectAreaLightHelper } from './RectAreaLightHelper';
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
  END_DELAY,
  BOARD_WIDTH
} from './constants';


const CAMERA_DISTANCE = 250;
const CAMERA_LATERAL_OFFSET = 120;
const CAMERA_HEIGHT = 220;
const CAMERA_LOOK_DISTANCE = 6 * BOX_SIZE;
const SURROUND_LIGHT_OFFSET = 90;

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

    this.renderer = new THREE.WebGLRenderer({
      autoClear: false,
      //antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.sceneHUD = this.getSceneHUD();
    this.HUDCamera = this.getHUDCamera();

    this.update = this.update.bind(this);

    // Flag to move camera differently when animating onto colored square.
    this.isEating = false;

    // FPS counter.
    this.stats = new Stats();
    this.stats.showPanel(0);
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

    this.scene.fog = new THREE.Fog(0x000000, 400, 3000);

    this.scene.add( this.cube.getObject3D() );
    this.board = new Board( this.model, boardData );
    this.scene.add( this.board.getObject3D() );

    this.addGround();
    this.addLighting();
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

  addGround() {
    let material = new THREE.MeshStandardMaterial({
      color: 0x222222,
    });

    var floorGeometry = new THREE.PlaneGeometry(10000, 10000, 1, 1);
    var ground = new THREE.Mesh(floorGeometry, material);
    ground.translateY(-400);
    ground.rotation.x = -Math.PI/2
    this.scene.add(ground);
  }

  addLighting() {
    // Get our 3 surrounding lights.
    const intensity = 0.4;
    this.lightRight = new THREE.PointLight( 0xFFFFFF, intensity );
    this.lightRight.position.set(SURROUND_LIGHT_OFFSET, BOX_SIZE, 0);
    this.scene.add( this.lightRight );
    // this.scene.add( new THREE.PointLightHelper( this.lightRight, 19 ) );

    this.lightBack = new THREE.PointLight( 0xFFFFFF, intensity );
    this.lightBack.position.set(0, BOX_SIZE - 20, SURROUND_LIGHT_OFFSET);
    this.scene.add( this.lightBack );
    // this.scene.add( new THREE.PointLightHelper( this.lightBack , 15 ) );

    this.lightTop = new THREE.PointLight( 0xFFFFFF, intensity );
    this.lightTop.position.set(0, SURROUND_LIGHT_OFFSET, HALF_BOX);
    this.scene.add( this.lightTop );
    // this.scene.add( new THREE.PointLightHelper( this.lightTop , 15 ) );

    // Add our goal post lights.
    const zPos = BOARD_DEPTH * BOX_SIZE;
    const lWidth = (BOX_SIZE * BOARD_WIDTH) / 3;
    
    const rectLight1 = new THREE.RectAreaLight( 0xff0000, 50, lWidth, -400 );
    rectLight1.position.set( -lWidth, 5, -zPos );
    this.scene.add( rectLight1 );

    const rectLight2 = new THREE.RectAreaLight( 0x00ff00, 50, lWidth, -400 );
    rectLight2.position.set( 0, 5, -zPos );
    this.scene.add( rectLight2 );    

    const rectLight3 = new THREE.RectAreaLight( 0x0000ff, 50, lWidth, -400 );
    rectLight3.position.set( lWidth, 5, -zPos );
    this.scene.add( rectLight3 );

    this.scene.add( new RectAreaLightHelper( rectLight1 ) );
    this.scene.add( new RectAreaLightHelper( rectLight2 ) );
    this.scene.add( new RectAreaLightHelper( rectLight3 ) );

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

    //this.scene.add(new THREE.AmbientLight( 0xffffff, 1 ));
    this.scene.add(new THREE.HemisphereLight( 0xffffff, 0x000000, 1 ));
  }

  /**
   * Playground function, never worked. Unused for now.
   */
  addShadows() {
    this.lightRight.target = this.cube.getObject3D();
    this.lightRight.castShadow = true;
    
    this.lightRight.target = this.cube.getObject3D();
    this.lightRight.shadow.mapSize.width = 1024;
    this.lightRight.shadow.mapSize.height = 1024;
    this.lightRight.shadow.camera.visible = true;
    this.lightRight.shadowDarkness = 0.5;
    this.lightRight.shadow.camera.near = 1;
    this.lightRight.shadow.camera.far = 400;
    this.lightRight.shadow.camera.left = -10;
    this.lightRight.shadow.camera.right = 10;
    this.lightRight.shadow.camera.top = 10;
    this.lightRight.shadow.camera.bottom = -10;
    this.lightRight.shadow.camera.fov = 0.2;
    this.scene.add( new THREE.CameraHelper( this.lightRight.shadow.camera ) );
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

    this.stats.begin();

    // Stop the countdown refresh soon after game has started.
    if (this.time.startTime + 1000 > this.time.currentTime) {
      this.updateCountdown()
    }

    const delta = this.time.tick();

    this.cube.update(delta);
    this.cubeOpponent.update(delta);

    this.cube.mesh.getWorldPosition(this.v);
    const { x, y, z } = this.v;

    this.camera.position.setZ(z + CAMERA_DISTANCE);
    this.camera.position.setX(x / 2 + CAMERA_LATERAL_OFFSET);

    // Make camera bouncy when eating.
    let lookAtY = 0;
    if (this.isEating) {
      lookAtY = Math.round((y - HALF_BOX) / 1.2);
    }
    
    // Update our surround lights position to follow cube.
    this.lightBack.position.setZ(z + SURROUND_LIGHT_OFFSET - 36);
    this.lightBack.position.setX(x - 5);
    this.lightRight.position.setZ(z);
    this.lightRight.position.setX(x + SURROUND_LIGHT_OFFSET - HALF_BOX);
    this.lightTop.position.setZ(z);
    this.lightTop.position.setX(x);
    
    // this.cameraLookAt.addVectors(this.v, this.cameraOffset);
    this.camera.lookAt(x, lookAtY, z);

    this.renderer.clear();
    this.renderer.render( this.scene, this.camera );

    //this.renderer.render( this.sceneHUD, this.HUDCamera );

    this.stats.end();
    requestAnimationFrame( this.update );
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

    document.body.append(this.stats.dom);
    this.time.start(delay || 0);
    this.update();
  }
}
