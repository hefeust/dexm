
// instantiation
var m3 = DEXM('machine-3');

// definitions
m3.def('green')
  .timeout('orange', 2000)
  .from('*', function() { console.log('GREEN :  GO !'); })
  .to('*', function() { console.log('leaving green...'); });

m3.def('orange')
  .timeout('red', 2000)
  .from('*', function() { console.log('ORANGE :  BE CAREFUL !'); })
  .to('*', function() { console.log('leaving orange...'); });

m3.def('red')
  .timeout('green', 2000)
  .from('*', function() { console.log('RED :  STOP !'); })
  .to('*', function() { console.log('leaving red...'); });

// runtime
m3.go('red');
