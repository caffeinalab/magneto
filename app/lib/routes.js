// This is the router.js file and it defines all routes in the app.
// Please read here https://github.com/trimethyl/trimethyl/wiki/Router
// to understand how it works, but I think that is very straightforward.

// Home boot route
Router.on('/home', Core.locationPermsMiddleware, function() {
	// Do not use `Flow.openDirect` 'cause there's no reason to do that.
	// You have to simply open the controller, the controller do the rest.
	Alloy.createController('main');
});