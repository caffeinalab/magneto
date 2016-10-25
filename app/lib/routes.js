// This is the router.js file and it defines all routes in the app.
// Please read here https://github.com/trimethyl/trimethyl/wiki/Router
// to understand how it works, but I think that is very straightforward.

// Home boot route
Router.on('/home', function() {

	// Do not dispatch multiple times
	Alloy.Globals.homeDispatchedAtLeastOnce = true;

	// Do not use `Flow.openDirect` 'cause there's no reason to do that.
	// You have to simply open the controller, the controller do the rest.
	Alloy.createController('home');

});

// With this route we match any sharing to a platform specified in the route,
// in this form: `/share/facebook?modulo=22`
Router.on(/^\/share\/(\w+)/, function(platform) {

	// You can always access to current query information using the this object,
	// and the `this.queryKey` object are the parameters specifed in the request
	var modulo = this.queryKey.modulo;

	// We simply wrote the share API in this way, no reason in the project to explain why
	var value = Util.rot13( Ti.Utils.base64encode( this.queryKey.modulo ).toString().replace(/\=/g,'') );
	var url = 'http://magneto.uno/s/?v=' + value;

	// Call dinamically the sharing method passing the URL
	T('sharer')[ platform ]({
		url: url
	});
	
});