
/**
 * TIME SCHEDULER CLASS
 *
 * @constructor {Scheduler}
 * @param {Object} options
 */
function Scheduler(options) {
  options = options || {};
  // this.planned = [];
  this.planned = null;
  // this.timer = null;
  this.tickDelay = options.tickDelay || 100;
  this.timeTolerance = options.timeTolerance || 10;
  this.tickCount = 0;
}

/**
 * add a planned task
 *
 * @param {Function} callback
 * @param {Number} delay in milliseconds
 */
Scheduler.prototype.plan = function(cb, delay) {
  var dtc = Math.floor(delay / this.tickDelay);

  if(this.planned) {
    dtc += this.planned.tickCount;
  }

  this.planned = {
    cb : cb,
    delay : delay,
    tickCount : dtc
  };
};

/**
 * start the scheduler
 *
 */
Scheduler.prototype.start = function() {
  var self = this;

  if(this.timer) { return true; }

  if(!this.planned) { return true; }

  this.timer = setInterval(function _tick() {
    self.tickCount++;
    console.log(self.tickCount);
    if(self.planned.tickCount === self.tickCount) {
      console.log("test : " + self.planned.tickCount);
      self.planned.cb();
    }

  }, this.tickDelay);

  return true;
};
