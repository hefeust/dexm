

window.onload = function() {

  console.log('Deus Ex Machina !');

  // cars
  var cl_red = document.getElementById('cl-red'),
    cl_orange = document.getElementById('cl-orange'),
    cl_green = document.getElementById('cl-green');

  // buttons
  var bt_power = document.getElementById('bt-power'),
    bt_down = document.getElementById('bt-maintenace'),
    bt_call = document.getElementById('bt-call');

  // pedestrian lights
  var pl_red = document.getElementById('pl-red'),
    pl_green = document.getElementById('pl-green');

  // the finite state machine
  var machine = DEXM('traffic');
  var blinking_counter = 0;


/*
  machine.def('c-green-p-red');
  machine.def('c-orang-p-red');
  machine.def('c-red-p-green');
  machine.def('c-red-p-off'); // @see C3P0 ?
*/
  machine.def('c-green-p-red')
    .timeout('c-orange-p-red', 5000)
    .from('*', function() {
      cl_green.setAttribute('class', 'on');
      pl_red.setAttribute('class', 'on');
    })
    .to('*', function() {
      cl_green.removeAttribute('class');
      pl_red.removeAttribute('class');
    });

  machine.def('c-orange-p-red')
    .timeout('c-red-p-green', 2000)
    .from('*', function() {
      cl_orange.setAttribute('class', 'on');
      pl_red.setAttribute('class', 'on');
    })
    .to('*', function() {
      cl_orange.removeAttribute('class');
      pl_red.removeAttribute('class');
    });

  machine.def('c-red-p-green')
    .on('cars-go', 'c-green-p-red')
    .timeout('c-red-p-off', 1000)
    .from('c-orange-p-red', function() {
      cl_red.setAttribute('class', 'on');
      blinking_counter = 0;
    })
    .from('c-red-p-off', function() {
      pl_green.setAttribute('class', 'on');
      blinking_counter++;

      if(blinking_counter === 3) {
        blinking_counter = 0;
        machine.accept('cars-go');
      }
    })
    .to('c-green-p-red', function() {
      cl_red.removeAttribute('class');
      pl_green.removeAttribute('class');
    });

  // C3P0 ?
  machine.def('c-red-p-off')
    .timeout('c-red-p-green', 1000)
    .from('c-red-p-green', function() {
      pl_green.removeAttribute('class', 'on');
    })
    .to('c-red-p-green', function() {

    });

    machine.def('lights-off')
      .on('start', 'c-red-p-green')
      .from('*', function() {
        cl_green.removeAttribute('class');
        cl_orange.removeAttribute('class');
        cl_red.removeAttribute('class');
        pl_green.removeAttribute('class');
        pl_red.removeAttribute('class');
        bt_call.setAttribute('disabled', 'true');
      })
      .to('c-red-p-green', function() {
        bt_call.removeAttribute('disabled');
      });



  function handleEvent(elm, evt, cb) {
    if(elm.attachEvent) {
      elm.attachEvent(evt, cb);
    } else {
      elm.addEventListener(evt, cb, false);
    }
  }

  function powerHandler() {
    console.log('activating');
    machine.accept('start');
  }

  function stopHandler() {
    machine.go('stop');
  }

  function maintenanceHandler() {
    machine.go('blink-off');
  }

  // listeners
  handleEvent(bt_power, 'click', powerHandler);
  // handleEvent(, 'click', stopHandler);
  //handleEvent(maintenance, 'click', maintenanceHandler);
  console.log('init...');
  machine.go('lights-off');
};
