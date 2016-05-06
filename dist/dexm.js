
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  else {
    root['DEXM'] = factory();
  }
}(this, function() {

  var machines = {};

  
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
  this.oldTimer = null;
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
  console.log('GO :' + destName );

  var self = this;
  var src = this.defs[this.current];
  var dest = this.defs[destName];

  if(!dest) {
    throw new Error('Undefined destination state : ' + destName);
  }


  if(src) {
    src.leave(destName, data);
  }

  this.old = this.current;
  this.oldTimer = this.timer;
  this.current = destName;
  dest.enter(this.old, data);



    if(this.oldTimer) {
      console.log('DELAY CLEARED');
      clearTimeout(this.oldTimer);
    }

  if(dest.delayed) {
    console.log('DELAYED : ' + dest.delayed.delay);
    this.timer = setTimeout(function() {
      console.log('DELAYED GO');
      self.go(dest.delayed.destName);
    }, dest.delayed.delay);
    console.log('---------------------------');
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
  var src = this.defs[this.current],
    destName = null,
    test = false;

  if(!src) { throw new Error('Unexisting source state : ' + this.current); }

  destName = src.succ(eventName);
  test = this.go(destName, data);

  return test;
};


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
State.prototype.timeout = function(destName, delay) {
  this.delayed = {
    destName : destName,
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
  console.log('=== '  + destName);

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


  var wrapper = function(name) {
    var m = machines[name];

    if(!m) {
      m = machines[name] = new Machine();
    }

    return {
      def : function(name) {
        return m.def(name);
      },

      go : function(name) {
        return m.go(name);
      },

      accept : function(name, args) {
        return m.accept(name, args);
      },

      state : function() {
        return m.state();
      },

      list : function() {
        return m.list();
      },

      allowed : function(other) {
        return m.allowed(other);
      },

      forbidden : function(other) {
        return m.forbidden(other);
      },

      destroy : function() {
        delete machines(m);
      }
    }
  }

  return wrapper;
}));