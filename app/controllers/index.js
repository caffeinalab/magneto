// Our index.js file is only an entry point to dispatch the boot route
Router.dispatch('/home');

// ********** Bonus TIP ********** 
// With this method, you can call another route just to test on boot.
// We used to that using Ti.Shadow and by storing it in the config.json file
if (Ti.Shadow && Alloy.CFG.bootDebugRoute) {
	Router.dispatch(Alloy.CFG.bootDebugRoute);
}