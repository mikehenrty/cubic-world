import * as THREE from 'three';

const FONT_SIZE = 100;
const FONT_COLOR = '#C1F2C9';

export default class Text {
  constructor(width, content, x, y) {
    this.width = width;
    this.xPos = x;
    this.yPos = y;
    this.mesh = this.getMesh(content);
    this.setPosition();
  }

  getMesh(content) {
    const canvas = this.makeTextCanvas(FONT_SIZE, content);
    const texture = new THREE.CanvasTexture(canvas);
    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const geometry = new THREE.PlaneBufferGeometry(this.width, this.width);

    return new THREE.Mesh(geometry, material);
  }

  setPosition(x = this.xPos, y = this.yPos) {
    this.mesh.position.setX(x);
    this.mesh.position.setY(y);
  }

  makeTextCanvas(size, content) {
    const borderSize = 2;
    const ctx = document.createElement('canvas').getContext('2d');
    const font =  `${size}px bold sans-serif`;
    ctx.font = font;

    // measure how long the content will be
    const doubleBorderSize = borderSize * 2;
    const width = ctx.measureText(content).width + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = FONT_COLOR;
    ctx.fillText(content, borderSize, borderSize);

    return ctx.canvas;
  }

  update(content) {
    this.mesh = this.getMesh(content);
    this.setPosition();
  }

  getObject3D() {
    return this.mesh;
  }
}
