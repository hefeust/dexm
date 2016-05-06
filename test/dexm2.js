
// instantiation
var m2 = DEXM('machine-2');

console.log(m2.def('maintenance'));

// definitions
m2.def('green')
  .on('tick', 'orange')
  .from('*', function() { console.log('GREEN :  GO !'); })
  .to('*', function() { console.log('leaving green...'); });

m2.def('orange')
  .on('tick', 'red')
  .from('*', function() { console.log('ORANGE :  BE CAREFUL !'); })
  .to('*', function() { console.log('leaving orange...'); });

m2.def('red')
  .on('tick', 'green')
  .from('*', function() { console.log('RED :  STOP !'); })
  .to('*', function() { console.log('leaving red...'); });

// runtime
m2.go('red');
m2.accept('tick');
m2.accept('tick');
m2.accept('tick');
m2.accept('tick');
m2.accept('tick');
