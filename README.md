
DEXM : Deux Ex Machina !
========================

DEXM (Deus EX Machina) is a TEFSM (Time Embeded Finite State Machine) implementation.

Installation
------------

just include dist/dexm.js in your page

-- or --

load it via UMD (Require JS) or CommonJS + browserify.

Creating a finite State Machine
-------------------------------

Just invoke the factory method with a name for your FSM and eventually options

    var m1 = DEXM('my-machine' /*,  options */);

The second parameter 'options' is a ket/value pairs object :

* tickDelay : default 100 milliseconds
* timeTolerance : default 10 milliseconds

Defining states and transitions
-------------------------------

The 'def' method is here, to be chained with 'on' calls for your transitions, like this :

    m1.def('s1')
      .on('a', 's2')
      .on('b', 's3')
      ...
      .on(eventName, stateName);

    m1.def('s2')
      .on('b', 's2')
      .on('a', 's3');

    m1.def('s3')
      .on('a', 's1');

Running tour FSM
----------------

initialize with "go", then call "accept" :

    m1.go('s1');
    m1.accept('a');
    m1.accept('b');

Transductions
------------

Those are custom actions triggered on entering and on leaving a given state, just use "from" and "to" methods at definition time :

     m1.def('s4')
       .on('a', 's1')
       .from('s1', function() { console.loe('entering...'); })
       .to('s3', function() { console.loe('leaving...'); })

These methods can accept as first argument :

* a statename
* an array of statenames
* a wildcard '*' for all states

Time transitions
----------------

Sometime you may want to achieve a transition after a certain time delay, use in this case the "timeout" method in your definitions :

    m1.def('s5')
      .on('a', 's1')
      .on('b', 's2')
      .timeout('s3', 3000) // in milliseconds
      .from(['s1', 's2'], function() { ... })
      .to('*'], function() { ... });

This behavior is backed, of course, with setInterval and clearInterval of the window object.

Enjoy !

TODO
----

* error (bad transition) callback
* halt method for time scheduled transitions
* add internal stack for basic compiling purposes
* hierarchical FSM def('...').sub(another_fsm)
* test, test & retest (the traffic lights demo)
