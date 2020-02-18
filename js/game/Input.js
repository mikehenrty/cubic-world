export default class Input {
  constructor() {
    this.onUp = null;
    this.onDown = null;
    this.onLeft = null;
    this.onRight = null;

    this.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.handleKeydown);
  }

  handleKeydown(e) {
    switch(e.key) {
      case 'ArrowUp':
        this.onUp && this.onUp();
        break;

      case 'ArrowDown':
        this.onDown && this.onDown();
        break;

      case 'ArrowLeft':
        this.onLeft && this.onLeft();
        break;

      case 'ArrowRight':
        this.onRight && this.onRight();
        break;
    }
  }
}
