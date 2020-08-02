export default class Time {
  constructor() {
    this.startTime = 0;
    this.lastTime = 0;
    this.currentTime = 0;

    this.lastMeasuredTime = 0;
    this.frameCount = 0;
  }

  getNewTime() {
    return performance.now();
  }

  getAverageFPS() {
    const deltaSeconds = this.getDeltaSinceLastMeasured() / 1000;  // ms -> s
    const fps = this.frameCount / deltaSeconds;
    this.frameCount = 0;
    this.lastMeasuredTime = this.getNewTime();

    return fps;
  }

  start() {
    this.startTime = this.getNewTime();
    this.lastTime = this.startTime;
    this.currentTime = this.startTime;
    this.lastMeasuredTime = this.startTime;
    this.frameCount = 0;
  }

  getDeltaSinceLastMeasured() {
    return this.currentTime - this.lastMeasuredTime;
  }

  getDeltaSinceLastTick() {
    return this.currentTime - this.lastTime;
  }

  tick() {
    const delta = this.getDeltaSinceLastTick();

    // Update times and counters.
    ++this.frameCount;
    this.lastTime = this.currentTime;
    this.currentTime = this.getNewTime();

    return delta;
  }
}
