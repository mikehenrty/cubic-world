const INPUT_THRESHOLD = 5;

export default class Input {
  constructor() {
    this.lastX = 0;
    this.lastY = 0;

    this.onUp = null;
    this.onDown = null;
    this.onLeft = null;
    this.onRight = null;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleMove = this.handleMove.bind(this);

    const el = document.body;
    el.addEventListener("touchstart", this.handleStart, false);
    el.addEventListener("touchend", this.handleEnd, false);
    el.addEventListener("touchcancel", this.handleCancel, false);
    el.addEventListener("touchmove", this.handleMove, false);

    document.addEventListener('keydown', this.handleKeydown);
  }

  handleStart(e) {
    const touch = e.changedTouches[0];
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
  }

  handleEnd(e) {
    this.lastX = 0;
    this.lastY = 0;
  }

  handleCancel(e) {
    this.lastX = 0;
    this.lastY = 0;
    alert(e);
  }

  handleMove(e) {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.lastX;
    const deltaY = touch.clientY - this.lastY;
    if (Math.abs(deltaX) > INPUT_THRESHOLD) {
      deltaX > 0 ? this.onRight() : this.onLeft();
    } else if (Math.abs(deltaY) > INPUT_THRESHOLD) {
      deltaY > 0 ? this.onDown() : this.onUp();
    }
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
