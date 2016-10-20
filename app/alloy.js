// The first thing that we have to do is to require an helper to load
// our Trimethyl modules. We call it `T`, but you can call however you 
// want or declaring not at all.
var T = function(m) { return require('T/' + m); };

// This step is, instead, fundamental.
// We have to require at startup because the Trimethyl bootstrap
// set importants global vars about package loading and other
// usefuls features like TSS variables.
T('trimethyl');

// Now, require all the modules we want to use in your app, globally.
// Do not require here modules that you'll use only
// in a specific controller, because this leverages on app boot performance.

// Event handler that uses Backbone Events in pure JS.
var Event = T('event');

// Proxy for Facebook SDK
var Facebook = T('fb');

// Proxy for Google Analytics.
// The UA is automatically obtained from the tiapp.xml file in the section `ga.ua`
var GA = T('ga');

// You can emulate the routing concept adopted in many web framework, 
// to handle incoming universal links and manage your app architecture.
var Router = T('router');

// HTTP requests in a clear interface with automatic internal cache control, 
// automatic body encoding based on content and middleware filters.
var HTTP = T('http');

// The Geo module handle the permissions itself, and we can use
// to retrieve in an easy way the coordinates.
var Geo = T('geo');

// Q is a pure javascript library that implements promises.
var Q = T('ext/q');

// Manages the app windows flow using a global navigator and exposing informations about opened controller and windows. 
// It also tracks the screen view and timing automatically.
var Flow = T('flow');

// Core is our app main module.
// It handles the requests and re-route it via the Event module.
var Core = require('core');

// Now, we require our file `routes.js` that defines all internal
// routes using the Router module. Go for head.
require('routes');