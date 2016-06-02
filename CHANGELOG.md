
2.0.0 / 2016-06-01
==================

  * if verbose set in config, then set hapi-confi to be verbose
  * removed authPlugins and strategies. use plugin priority and hapi-strategy-loader as a plugin now
  * a little bit of housekeeping

1.0.0 / 2016-05-30
==================

  * updated confi
  * clone view before passing to server
  * verbose logging off by default, with example
  * confi 2.0.0 added to package, vision added to dev dependencies.
  * refactor auto statement, added dependency ordering, tests for vision load, updated eslint packages to latest versions
  * updated to use firstandthird eslint config 2.0.0
  * eslint-config-firstandthird updated to 2.0.0
  * es6 config and package files, converted main executables to es6
  * handles parse errors

0.3.0 / 2016-04-22
==================

  * updated dependencies
  * fixes server not starting if logging was disabled. fixes #7
  * allow sorting of plugins with _priority

0.2.0 / 2016-02-16
==================

  * updated confi version

0.1.1 / 2016-02-15
==================

  * fixed some linting errors
  * added linting
  * Create README.md
  * added tests to make sure it configures the hapi server correctly
  * extraneous debug statement removed
  * added basic lab tests to verify thathapi-confi uses confi correctly updated to confi 1.0.0

0.1.0 / 2015-11-10
==================

  * fixed requireCwd to fall back to normal require if dep doesn't start with '.'

0.0.7 / 2015-10-27
==================

  * if strategies.options.provider.profile is a string, treat as server method
  * added options.before hook to be able to change server/config before processing

0.0.6 / 2015-10-11
==================

  * don't error if no connection property

0.0.5 / 2015-10-10
==================

  * fixed loading plugins with _enabled: false

0.0.4 / 2015-10-10
==================

  * fix if _enabled: false

0.0.3 / 2015-10-02
==================

  * fixed require if ./lib

0.0.2 / 2015-09-27
==================

  * added vision and views support
  * changed async.forEachOf to async.forEachOfSeries
