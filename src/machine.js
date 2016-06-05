
/**
 * the finite state machine class
 *
 * @param [Object}] options
 */
function Machine(options) {
  this.defs = {};
  this.current = null;
  this.old = null;
  //this.timer = new Timer(options);
  this.scheduler = new Scheduler(options);
  // this.oldTimer();
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
  var timedDest = null;

   if(!dest) {
     throw new Error('Undefined destination state : ' + destName);
   }

   if(src) {
     src.leave(destName, data);
   }


   this.old = this.current;
   // this.oldTimer = this.timer;
   this.current = destName;
   dest.enter(this.old, data);

   if(dest.table[null]) {
     timedDest = dest.table[null];
     console.log('DELAYED : ' + timedDest.delay);

     this.scheduler.plan(function _plan() {
       self.go(timedDest.dest);
     }, timedDest.delay);

     this.scheduler.start();
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
