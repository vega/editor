var config = {
  open: false
};

config.init = function() {
  var $d3 = ved.$d3;

  // Set up the debugging button.
  $d3.select('.btn_config').on('click', function() {
    config.open = !config.open;
    d3.selectAll('.config').style('display', config.open ? 'block' : 'none');
    d3.select(this).classed('selected', config.open);
    ved.resize();
  });

  // Config dropdown.
  $d3.select('.sel_config').on('change', config.select)
    .select('optgroup')
    .selectAll('option.spec')
      .data(VG_CONFIGS)
    .enter().append('option')
      .text(function(d) { return d; });
};

config.select = function() {
  var $d3 = ved.$d3,
      editor = ved.editor[VEGA_CONFIG],
      sel = $d3.select('.sel_config').node();

  if (!sel.value) {
    editor.setValue('');
    editor.gotoLine(0);
    ved.parseVg();
  } else if (sel.value === 'default') {
    editor.setValue(JSON3.stringify(vg.config, null, 2, 60));
    editor.gotoLine(0);
    ved.parseVg();
  } else {
    d3.text(config.uri(sel.value), function(err, text) {
      editor.setValue(text);
      editor.gotoLine(0);
      ved.parseVg();
    });
  }
};

config.uri = function(opt) {
  return ved.path + 'spec/vega/themes/' + opt + '.json';
};