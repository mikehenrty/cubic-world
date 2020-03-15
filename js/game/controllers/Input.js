const INPUT_THRESHOLD = 40;
const SECONDARY_INPUT_THRESHOLD = INPUT_THRESHOLD * 1.4;
const TAP_THRESHOLD = 120; // milliseconds

const BOX_THRESHOLD = Math.round(window.innerWidth / 7);
const BOX_Y_POSITION = Math.round(2 * window.innerHeight / 3);
const BOX_X_POSITION = Math.round(window.innerWidth / 3);


export default class Input {
  constructor() {
    this.held = false;
    this.lastX = 0;
    this.lastY = 0;
    this.lastPressTime = null;

    this.onUp = null;
    this.onDown = null;
    this.onLeft = null;
    this.onRight = null;
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
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
    document.addEventListener('keyup', this.handleKeyup);
  }

  press() {
    this.lastPressTime = performance.now();
    this.held = true;
  }

  release() {
    this.held = false;
    this.onRelease && this.onRelease();
    if (performance.now() - this.lastPressTime < TAP_THRESHOLD) {
      this.tap();
    }
    this.lastPressTime = null;
  }

  tap() {
    // Check where tap took place and dispatch move event if needed.
    if (this.lastY < BOX_Y_POSITION - BOX_THRESHOLD) {
      this.onUp && this.onUp();
    } else if (this.lastY > BOX_Y_POSITION + BOX_THRESHOLD) {
      this.onDown && this.onDown();
    } else if (this.lastX < BOX_X_POSITION) {
      this.onLeft && this.onLeft();
    } else if (this.lastX > BOX_X_POSITION + BOX_THRESHOLD) {
      this.onRight && this.onRight();
    }
  }

  isHolding() {
    return this.held;
  }

  handleStart(e) {
    this.press();
    const touch = e.changedTouches[0];
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
  }

  handleEnd(e) {
    this.release();
    this.lastX = 0;
    this.lastY = 0;
  }

  handleCancel(e) {
    this.handleEnd(e);
  }

  handleMove(e) {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.lastX;
    const deltaY = touch.clientY - this.lastY;
    if (Math.abs(deltaX) > INPUT_THRESHOLD) {
      deltaX > 0 ? this.onRight() : this.onLeft();
      this.lastX = touch.clientX;
    } else if (Math.abs(deltaY) > INPUT_THRESHOLD) {
      deltaY > 0 ? this.onDown() : this.onUp();
      this.lastY = touch.clientY;
    }
  }

  handleKeyup(e) {
    this.release();
  }

  handleKeydown(e) {
    if (e.repeat) {
      return;
    }

    this.press();

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
