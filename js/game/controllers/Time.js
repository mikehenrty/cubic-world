// Keep past deltas for FPS calculation.
// Higher REMEMBER numbers will be slower but more stable.
const REMEMBER = 30;
const LOG_FPS = false;

export default class Time {
  constructor() {
    this.startTime = 0;
    this.pastTimes = new Array(REMEMBER);
  }

  getNewTime() {
    return performance.now();
  }

  getCurrentTime() {
    return this.pastTimes[0] || this.startTime;
  }

  getLastTime() {
    return this.pastTimes[1] || this.startTime;
  }

  getAverageFPS() {
    const deltas = new Array(REMEMBER - 1);
    for (let i = 0; i < REMEMBER - 1; i++) {
      deltas[i] = this.pastTimes[i] - this.pastTimes[i + 1];
    }
    return 1000 / deltas.reduce((accum, delta) => (
      accum + delta / (REMEMBER - 1)
    ), 0)
  }

  start() {
    this.startTime = this.getNewTime();
    this.pastTimes[0] = this.startTime;

    LOG_FPS && setInterval(() => {
      console.log('FPS::', this.getAverageFPS());
    }, 2000);
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
