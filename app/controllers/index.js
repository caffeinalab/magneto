// Ask the permissions
Core.checkPermissions();

// If the user has declined the permissions, he can go to the Settings and re-enabled,
// but we want to check instantly again
Ti.App.addEventListener('resumed', function(e) {
	Core.checkPermissions();
});


// ********** Bonus TIP ********** 
// With this method, you can call another route just to test on boot.
// We used to that using Ti.Shadow and by storing it in the config.json file
if (Ti.Shadow && Alloy.CFG.bootDebugRoute) {
	Router.dispatch(Alloy.CFG.bootDebugRoute);
}