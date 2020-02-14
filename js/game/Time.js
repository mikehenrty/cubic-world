// Keep past deltas for FPS calculation.
// Higher REMEMBER numbers will be slower but more stable.
const REMEMBER = 5;

export default class Time {
  constructor() {
    this.startTime = 0;
    this.pastTimes = new Array(REMEMBER);
  }

  getNewTime() {
    return Date.now();
  }

  getCurrentTime() {
    return this.pastTimes[0] || this.startTime;
  }

  getLastTime() {
    return this.pastTimes[1] || this.startTime;
  }

  start() {
    this.startTime = this.getNewTime();
    this.pastTimes[0] = this.startTime;
  }

  // Shift the times back and add the current one.
  updatePastTimes() {
    for (let i = REMEMBER - 1; i > 0; i--) {
      this.pastTimes[i] = this.pastTimes[i - 1];
    }

    this.pastTimes[0] = this.getNewTime();
  }

  getDeltaSinceLastTick() {
    return this.getCurrentTime() - this.getLastTime();
  }

  tick() {
    this.updatePastTimes();
    return this.getDeltaSinceLastTick();
  }
}
