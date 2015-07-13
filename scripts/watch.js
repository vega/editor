// Watch external vega directory and copy build files upon update
var child_process = require('child_process');
var chokidar = require('chokidar');
var target = 'vendor/';

var dir = process.argv[2] || '../vega/';
if (dir[dir.length-1] !== '/') dir += '/';

function copy(source) {
  child_process.execFile('/bin/cp', [source, target]);
  console.log('copied ' + source + ' to ' + target);
}

chokidar.watch(dir + 'vega*')
  .on('error', function(error) { console.error('Error', error); })
  .on('add', copy)
  .on('change', copy);

console.log('Watching ' + dir);