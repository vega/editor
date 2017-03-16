module['exports'] = function myService (hook) { 
  
  var github = require('octonode');
 
  var key = hook.params.gistid;

  var client = github.client();

  //var main = config.main;
  var gistid = hook.params.gistid;
  var ghgist = client.gist();

  ghgist.get(gistid,  function(err, g){
    if (err) {
      return hook.res.json(err);   
    }


    //hook.res.json(g.files); 
    Object.keys(g.files).forEach(function(filename) {
      //console.log(filename);
      var content = g.files[filename].content;

      // try to parse content as json
      try {
        JSON.parse(content)
      } catch(e) {
        // if it throws an error continue
        return;
      }

      // otherwise:
      hook.res.json(content); 
    });
  })
};