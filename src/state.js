
/**
 * state definition
 *
 * @param {String} name
 */
function State(name) {
  this.name = name;
  this.table = {};
  this.enterCallbacks = {};
  this.leaveCallbacks = {};
  this.delayed = null;
}

/**
 * write a line in local transition table entry
 *
 * @param {String} event
 * @param {String} dest
 * @param {Function} callback trandiuction function
 */
State.prototype.on = function(event, dest, callback) {
  this.table[event] = {
    event : event,
    dest : dest,
    callback : callback
  };
};

/**
 * specify an entering transduction
 *
 * @param {String|Array<String>} src
 * @param {Function} callback
 * @returns {State} this for fluent interface
 */
State.prototype.from = function(src, callback) {
  var self = this, prop = '';

  if(src) {
    if(typeof src === 'string') {
      src = [src];
    }

    for(var i = 0; i < src.length; i++) {
      self.enterCallbacks[src[i]] = callback;
    }
  }

  return this;
};

/**
 * specify a leaving transduction
 *
 * @param {String|Array<String>} src
 * @param {Function} callback
 * @returns {State} this for fluent interface
 */
State.prototype.to = function(dest, callback) {
  var self = this, prop = '';

  if(dest) {
    if(typeof dest === 'string') {
      dest = [dest];
    }

    for(var i = 0; i < dest.length; i++) {
      self.leaveCallbacks[dest[i]] = callback;
    }
  }

  return this;
};

/**
 * for delayed event auto firing
 *
 * @param {String} eventName
 * @param {Number} delay in milliseconds
 */
State.prototype.timeout = function(dest, delay) {
/*
  this.delayed = {
    destName : destName,
    delay : delay
  };
*/
  this.table[null] = {
    event : "#TIMED#",
    dest : dest,
    callback : function timed() { return true; },
    delay : delay
  };
};

/**
 * test if this state can access other  state
 -
 * @param {String} other
 * @return {Boolean}
 */
State.prototype.allowed = function(other) {

};

/**
 * test if this state mist not access other  state
 -
 * @param {String} other
 * @return {Boolean}
 */
State.prototype.forbidden = function(other) {

};

/**
 * compute the successor state name
 * according to eventName
 *
 * @param {String} eventName
 */
State.prototype.succ = function(eventName) {
  var destName = null;

  if(this.table.hasOwnProperty(eventName)) {
    destName = this.table[eventName ].dest;
  }
  // console.log('=== '  + destName);

  return destName;
};

/**
 * enter transduction
 *
 * @param {String} srcName
 * @param {Object} data
 */
State.prototype.enter = function(srcName,  data) {
//  console.log('entering ' + srcName);

  if(this.enterCallbacks.hasOwnProperty('*')) {
    this.enterCallbacks['*'].call({}, data);
  } else if(this.enterCallbacks.hasOwnProperty(srcName)) {
    this.enterCallbacks[srcName].call({}, data);
  }

};

/**
 * leave transduction
 *
 * @param {String} destName
 * @param {Object} data
 */
State.prototype.leave = function(destName, data) {
//  console.log('leaving ' + destName);

  if(this.leaveCallbacks.hasOwnProperty('*')) {
    this.leaveCallbacks['*'].call({}, data);
  } else if(this.leaveCallbacks.hasOwnProperty(destName)) {
    this.leaveCallbacks[destName].call({}, data);
  }

};
