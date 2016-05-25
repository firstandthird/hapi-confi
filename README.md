## hapi-confi

  Set up and run a hapi server using yaml/json files from a config directory

### Installation

`npm install hapi-confi`

### Usage

```
var Hapi = require('hapi');
var hapiConfi = require('hapi-confi');
hapiConfi(Hapi, options, function(err, server, config) {
   /* server is a configured hapi server here */
   server.start(function(){
   });
}
```

### Options

 - `configPath` - relative to 'cwd', defaults to 'conf/'
 - `server`    - standard hapi server configuration options, see hapi docs for available options.

### Major Config items:  

  - `before`  - list of event handlers to fire on a 'before' event
  - `logging` - list of reporters to use from 'good.js', the hapi logging library
    -  `reporters` -  any 'good-' reporters to use for logging (e.g. good-console)
  - `authPlugins`  - list of auth plugins
  - `strategies`  - list of strategies of the form:
    - `provider` 
      - `scheme`  
      - `mode`
      - `options`
      - `profile` - 
  - `plugins`  - list of hapi plugins that will be added to your server through hapi.register()
    - `options` - options to pass when the plugin is registered
 - `views`  - list of view engines to register with hapi.views()
  - `engines` - list of modules to import and pass to view
  
