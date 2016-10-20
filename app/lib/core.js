// Main Core module

exports.earthMagneticVector = null;
exports.earthMagneticIntensity = null;

exports.isDetecting = false;
exports.modulo = 0;
exports.moduloAsString = '0*';

var headingListenerInstalled = false;
var authOnPause;

// Handle the data from the compass, analyze it and store the modulo
function headingEventHandler(e) {
	// Sum the components and make the Euclide modulo
	var modulo = Math.sqrt(
	Math.pow(e.heading.x, 2) + 
	Math.pow(e.heading.y, 2) + 
	Math.pow(e.heading.z, 2)
	);

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
function storeEarthMagneticVector() {
	Geo.getCurrentPosition(function(geoData) {
		HTTP.send({
			url: 'http://magneto.uno/api',
			data: geoData,
			success: function(vector) {
				exports.earthMagneticVector = vector;
				exports.earthMagneticIntensity = vector.i;
			}
		});
	});
}

// Prompt the user for permissions
exports.askForPermissions = function() {
	Flow.openDirect('help');
};

// Notify the user about his choice.
exports.showDeniedPermission = function() {
	Flow.openDirect('lsdisabled');
};

// This is what we call a middleware.
// You can use with the Router module to stop certain routes when somethings's wrong.
// In this specific case, this one handles the location permissions, showing (or not) the permission window.
// The Router module uses a Q.promise, so you have to return it. Oh, and it's async.
exports.locationPermsMiddleware = function() {

	// Q.promise return a promise that you can resolve or reject
	return Q.promise(function(resolve, reject) {

		// If the user has authorized us, just resolve the 
		// promise (closing the eventual permissions windows)
		if (Geo.isAuthorized()) {
			resolve();
		} else if (Geo.isDenied()) {
			// If the permissions are completely rejects, inform the user about that.
			exports.showDeniedPermission();
			// and reject this promise
			reject();
		} else if (Geo.isAuthorizationUnknown()) {
			// Otherwise, notify the user about the permissions that the app is going to ask. And ask them.
			exports.askForPermissions();
			// and reject this promise
			reject();
		}

	});
};

// Start the detection.
// If is the first time, it start the routine of storing the earth magnetic vector,
// and install the heading listener to read the compass data
exports.startDetection = function() {
	exports.isDetecting = true;
	if (exports.earthMagneticVector == null) {
		storeEarthMagneticVector();
	}
	if (!headingListenerInstalled) {
		headingListenerInstalled = true;
		Ti.Geolocation.addEventListener('heading', headingEventHandler);
	}
};

// Stop the detection with a simple flag that doesn't call the event
exports.stopDetection = function() {
	exports.isDetecting = false;
};


// Do not pause location update never. 
// The user can anyway close the app.
Ti.Geolocation.pauseLocationUpdateAutomatically = true;

// When the user bring its phone close to a magnetic field,
// iOS show the calibration control. But we don't want to, so just disable.
Ti.Geolocation.showCalibration = false;

// Save the state of the permissions on pause
Ti.App.addEventListener('pause', function(e) {
	authOnPause = Geo.isAuthorized();
});

// If the user has declined the permissions, he can go to the Settings and re-enabled,
// but we want to check instantly again
Ti.App.addEventListener('resumed', function(e) {
	if (authOnPause != Geo.isAuthorized()) {
		Router.go('/home');
	}
});
