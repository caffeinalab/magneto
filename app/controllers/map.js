// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var Timap = require('ti.map');

// Private var that store all the requests
var requests = {};

function fetchRequests() {
	HTTP.getJSON('/api', { method: 'getRequests' }).then(function(data) {

		// Re-map the data from the server to Array to an HashMap (JS object)
		data.forEach(function(e) { requests[ e.id ] = e; });

		// And immediately update the annoations on the map
		updateMap(_.extend({}, $.mapView.region, { source: $.mapView }));

	});
}

// This is the method that update the annoations on the map,
// clustering it using `Geo.markerCluster`
function updateMap(e) {

	// Sorry bro.
	if (requests == null) return;

	// Using the `e` variable that contains currents informations about the event map,
	// re-cluster the pins
	var markers = Geo.markerCluster(e, requests, {
		latitude: 'latitude',
		longitude: 'longitude',
	});

	// And set the annoations in the map
	$.mapView.annotations = markers.map(function(c) {

		if (_.isNumber(c)) {
		
			// If `c` is a number, it represents an id that you have to use to obtain
			// the pin again, with its informations of latitude, longitude
			c = requests[c];
		
			return Timap.createAnnotation({
				latitude: c.latitude,
				longitude: c.longitude,
			});

		} else {

			// otherwise, this is a cluster containing latitude, longitude and count of markers in 
			return Timap.createAnnotation({
				latitude: c.latitude,
				longitude: c.longitude,
				customView: Alloy.createController('map/cluster', c).getView()
			});
		}

	});
}

///////////////
// Listeners //
///////////////

$.mapView.addEventListener('regionchanged', updateMap);

//////////
// Init //
//////////

fetchRequests();