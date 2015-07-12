// Watch external vega directory and copy build files upon update
var child_process = require('child_process');
var chokidar = require('chokidar');
var dir = '../vega/';
var target = 'vendor/';

function copy(source) {
  child_process.execFile('/bin/cp', [source, target]);
  console.log('copied ' + source + ' to ' + target);
}

chokidar.watch(dir + 'vega*')
  .on('error', function(error) { console.error('Error', error); })
  .on('add', copy)
  .on('change', copy);

console.log('Watching ' + dir);