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

  start(delay) {
    const now = this.getNewTime()
    this.startTime = now + delay;
    this.lastTime = now;
    this.currentTime = now;
    this.lastMeasuredTime = now;
    this.frameCount = 0;
  }

  started() {
    return this.currentTime > this.startTime;
  }

  getDeltaUntilStart() {
    return this.startTime - this.currentTime;
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
