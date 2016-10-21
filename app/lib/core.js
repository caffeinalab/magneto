// Main Core module

exports.earthMagneticVector = null;
exports.earthMagneticIntensity = null;

exports.isDetecting = false;

exports.modulo = 0;
exports.moduloAsString = '-';

var headingListenerInstalled = false;

// Handle the data from the compass, analyze it and store the modulo
function headingEventHandler(e) {
	// Sum the components and make the Euclide modulo
	var modulo = Math.sqrt( Math.pow(e.heading.x, 2) + Math.pow(e.heading.y, 2) + Math.pow(e.heading.z, 2) );
	var moduloAsString;

	if (exports.earthMagneticIntensity != null) {
		modulo = Math.abs(modulo - exports.earthMagneticIntensity);
		moduloAsString = modulo.toFixed(0);
	} else {
		// If the earth magnetic intensity is not retrived yet, just put a "*" to indicate an incoerence.
		moduloAsString = modulo.toFixed(0) + '*';
	}

	exports.modulo = modulo;
	exports.moduloAsString = moduloAsString;
}

// This function call our server, passing current user location.
// The server responds with current earth magnetic vector in current user zone.
// We store this value in a global module variable to use it later.
exports.getEarthMagneticVector = function(callback) {
	Geo.getCurrentPosition({
		success: function(geoData) {
			HTTP.send({
				url: 'http://magneto.uno/api',
				data: geoData,

				// Force the parsing from JSON to instance object
				format: 'json',

				success: function(vector) {
					exports.earthMagneticVector = vector;
					exports.earthMagneticIntensity = vector.i;
					callback();
				}
			});
		}
	});
};

// Prompt the user for permissions
exports.askForPermissions = function() {
	if (exports.askForPermissions.controller == null) {
		exports.askForPermissions.controller = Flow.openDirect('help');
		exports.askForPermissions.controller.on('close', function() {
			exports.askForPermissions.controller = null;
		});
	}
};

// Notify the user about his choice.
exports.showDeniedPermission = function() {
	if (exports.showDeniedPermission.controller == null) {
		exports.showDeniedPermission.controller = Flow.openDirect('lsdisabled');
		exports.showDeniedPermission.controller.on('close', function() {
			exports.showDeniedPermission.controller = null;
		});
	}
};

// This one handles the location permissions, showing (or not) the permission window.
exports.checkPermissions = function() {
	if (Alloy.Globals.SIMULATOR) {
		return true;
	}

	// If the user has authorized us, just resolve the 
	// promise (closing the eventual permissions windows)
	if (Geo.isAuthorized()) {
		
		if (exports.showDeniedPermission.controller != null) exports.showDeniedPermission.controller.close();
		if (exports.askForPermissions.controller != null) exports.askForPermissions.controller.close();

		// Dispatch the boot route
		Router.dispatch('/home');

		return true;

	} else if (Geo.isDenied()) {

		if (exports.askForPermissions.controller != null) exports.askForPermissions.controller.close();
	
		// If the permissions are completely rejects, inform the user about that.
		exports.showDeniedPermission();
	
	} else if (Geo.isAuthorizationUnknown()) {
	
		if (exports.showDeniedPermission.controller != null) exports.showDeniedPermission.controller.close();
	
		// Otherwise, notify the user about the permissions that the app is going to ask. And ask them.
		exports.askForPermissions();
	
	}
};

// Start the detection.
// If is the first time, it start the routine of storing the earth magnetic vector,
// and install the heading listener to read the compass data
exports.startDetection = function() {
	exports.isDetecting = true;

	// And install (once) the listener
	if (!headingListenerInstalled) {
		headingListenerInstalled = true;

		// Here, we simulate the modulo using random values on the simulator
		if (Alloy.Globals.SIMULATOR) {
			setInterval(function() {
				headingEventHandler({
					heading: {
						x: 40 * Math.random(),
						y: 40 * Math.random(),
						z: 40 * Math.random()
					}
				});
			}, 100);
		} else {
			Ti.Geolocation.addEventListener('heading', headingEventHandler);
		}
	}
};

// Stop the detection with a simple flag that doesn't call the event
exports.stopDetection = function() {
	exports.isDetecting = false;
};

// Share on the platform
exports.share = function(platform, modulo) {
	var value = Util.rot13( Ti.Blob.base64encode( modulo ).replace(/\=/g,'') );
	T('sharer')[ platform ]({
		url: 'http://magneto.uno/s/?v=' + value,
	});
};

// Do not pause location update never. 
// The user can anyway close the app.
Ti.Geolocation.pauseLocationUpdateAutomatically = true;

// When the user bring its phone close to a magnetic field,
// iOS show the calibration control. But we don't want to, so just disable.
Ti.Geolocation.showCalibration = false;