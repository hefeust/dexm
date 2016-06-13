
function handleClick(elm, cb) {
  if(window.attachEvent) {
    elm.attachEvent("click", cb);
  } else {
    elm.addEventListener("click", cb, true);
  }
}

function switchon(elm) {
  elm.setAttribute('class', 'on');
}

function switchoff(elm) {
  elm.removeAttribute('class');
}

window.onload = function() {
  var pl_green = document.getElementById("pl-green"),
    pl_red = document.getElementById("pl-red"),
    cl_green = document.getElementById("cl-green"),
    cl_orange = document.getElementById("cl-orange"),
    cl_red = document.getElementById("cl-red"),
    bt_power = document.getElementById("bt-power");

  console.log([pl_red, pl_green, cl_red, cl_green, cl_orange]);

  var machine = DEXM('traffic-lights');
  var blinking = 0;

    // lights off
  machine.def('C0P0')
    .timeout('C3P0', 1000)
    .from('*', function() {
      switchoff(pl_green);
      switchoff(pl_red);
      switchoff(cl_green);
      switchoff(cl_orange);
      switchoff(cl_red);
    });

  // lights all on
  machine.def('CXPX')
    .timeout('C0P0', 500)
    .from('*', function() {
      switchon(pl_green);
      switchon(pl_red);
      switchon(cl_green);
      switchon(cl_orange);
      switchon(cl_red);
   });

  // cars green, pedestrian red all on
  machine.def('C1P3')
    .timeout('C2P3', 2000)
    .from('*', function() {
      switchon(cl_green);
      switchon(pl_red);
    })
    .to('*', function() {
      switchoff(cl_green);
      switchoff(pl_red);
    });

  // cars orange, pedestrian red
  machine.def('C2P3')
    .timeout('C3P1', 1000)
    .from('*', function() {
      switchon('cl_orange');
      switchon('pl_red');
    })
    .to('*', function() {
      switchoff('cl_orange');
      switchoff('pl_red');
    });



  // cars red, pedestrian green
  machine.def('C3P1')
    .timeout('C3P0', 3000)
    .from('*', function() {
      switchon(cl_red);
      switchon(pl_green);
    })
    .to('*', function() {
      switchoff(cl_red);
      switchoff(pl_green);
    });

  // car red pedestrian off
  machine.def('C3P0')
    .timeout('C3P9', 500)
    .from('*', function() {
      switchon(cl_red);
    })
    .to('*', function() {
      switchoff(cl_red);
    });

  // car red pedestrian on
    machine.def('C3P9')
    .timeout('C3P0', 500)
    .from('*', function() {
      switchon(cl_red);
      blinking++;
      if(blinking === 2) {
        blinking = 0;
        machine.go('C1P3');
      }
    })
    .to('*', function() {
      switchoff(cl_red);
      //switchoff(cl_green);
    });

  handleClick(bt_power, function() {
    machine.go('CXPX');
  });

  machine.go('C0P0');
};
