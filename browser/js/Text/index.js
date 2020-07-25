import * as THREE from 'three';

const BORDER_SIZE = 2;
const FONT_COLOR = '#C1F2C9';

export default class Text {
  constructor(height, content, x, y) {
    this.height = Math.round(height);
    this.xPos = x;
    this.yPos = y;
    this.mesh = this.getMesh(content);
    this.setPosition();
  }

  getMesh(content) {
    const canvas = this.makeTextCanvas(this.height, content);
    this.width = canvas.width;

    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const geometry = new THREE.PlaneBufferGeometry(canvas.width, canvas.height);
    geometry.name = `TextGeo-${content}`;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `TextMesh-${content}`;

    return mesh;
  }

  setPosition(x = this.xPos, y = this.yPos) {
    this.mesh.position.setX(x);
    this.mesh.position.setY(y);
  }

  makeTextCanvas(size, content) {
    const ctx = document.createElement('canvas').getContext('2d');
    const font =  `${size}px bold sans-serif`;
    ctx.font = font;

    // measure how long the content will be
    const doubleBorderSize = BORDER_SIZE * 2;
    const width = ctx.measureText(content).width + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = FONT_COLOR;
    ctx.fillText(content, BORDER_SIZE, BORDER_SIZE);

    return ctx.canvas;
  }

  update(content) {
    content = content || '';
    this.mesh = this.getMesh(content);
    this.setPosition();
  }

  getObject3D() {
    return this.mesh;
  }
}
