
/**
 * the finite state machine class
 *
 * @param [Object}] options
 */
function Machine(options) {
  this.defs = {};
  this.current = null;
  this.old = null;
  this.timer = null;
  this.options = options || {};
}

/**
 * create a state definition
 *
 * @param {String} name
 * @return {State}
 */
Machine.prototype.def = function(name) {
  var state = new State(name);

  this.defs[name] = state;

  //return state;
  // module pattern to keep privacy
  var wrapper = {
    on : function(event, dest) {
      state.on(event, dest);
      return wrapper;
    },

    timeout : function(destName, delay) {
      state.timeout(destName, delay);
      return wrapper;
    },

    from : function(src, callback) {
      state.from(src, callback);
      return wrapper;
    },

    to : function(dest, callback) {
      state.to(dest, callback);
      return wrapper;
    }
  };

  return wrapper;
};

/**
 * return a list of definition names
 *
 * @return {Array}
 */
Machine.prototype.list = function() {
  var list = [];

  for(var d in this.defs) {
    list.push(d);
  }

  return list;
};

/**
 * return current state name
 *
 * @return {String}
 */
Machine.prototype.state = function() {
  return this.current;
};


/**
 * ask for state exustence
 *
 * @param {String}
 * @return {Boolean}
 */
Machine.prototype.exists = function(name) {
  var test = this.defs.hasOwnProperty(name);

  return test;
};

/**
 * test if current state can access the other
 *
 * @param {String} other
 */
Machine.prototype.allowed = function(other) {
  var src = this.defs[this.current],
    test = false;

  if(src && src.allowed(other)) {
    test = true;
  }

  return test;
};

/**
 * test if current state must not access the other
 *
 * @param {String} other
 */
Machine.prototype.forbidden = function(other) {
  var src = this.defs[this.current],
    test = false;

  if(src && src.forbidden(other)) {
    test = true;
  }

  return test;
};

/**
 * set up an arbitrary state
 * useful for initialization
 *
 * @param {String} name
 */
Machine.prototype.go = function(destName, data) {
  console.log('go : ' + destName);

  var self = this;
  var dest = this.defs[destName];

  if(!dest) { throw new Error('Undefined state : ' + destName); }

  // if there was an existing timer, deactivate it !
  if(this.timer) {
    clearTimeout(this.timer);
  }
  console.log(dest);
  dest.enter(this.current, data);
  this.current = destName;

  // for delayed states with automatic transitions
  if(dest.delayed) {
    this.timer = setTimeout(function() {
      var otherName = dest.delayed.destName;
      var other = self.defs[otherName];

      if(!other) { throw new Error('Undefined other state : ' + otherName ); }

      dest.leave(self.current, data);
      self.go(otherName, data);

    }, dest.delayed.delay);
  }

  return true;
};

/**
 * accept an event on input
 *
 * @param {String} event
 * @return {Boolean} true on success
 */
Machine.prototype.accept = function(eventName, data) {
  var src = this.defs[this.current];
  var destName = null;

  if(!src) { throw new Error('Undefined state : ' + this.current); }

  destName = src.succ(eventName);
  src.leave(destName, data);

  console.log('accept :  ' + eventName);
  console.log('src : ' + this.current);
  console.log('go : ' + destName);

  this.go(destName, data);

  return true;
};
