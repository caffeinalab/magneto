// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var Timap = require('ti.map');

var requests = [];

HTTP.getJSON('/api', { method: 'getRequests' }).then(function(data) {
	data.forEach(function(e) {
		requests[ e.id ] = e;
	});
	updateMap(_.extend({}, $.mapView.region, { source: $.mapView }));
});

function updateMap(e) {
	if (requests == null) return;

	var markers = Geo.markerCluster(e, requests, {
		latitude: 'latitude',
		longitude: 'longitude',
	});

	$.mapView.annotations = markers.map(function(c){
		if (_.isNumber(c)) {
			c = requests[c];
			return Timap.createAnnotation({
				latitude: c.latitude,
				longitude: c.longitude,
			});
		} else {
			return Timap.createAnnotation({
				latitude: c.latitude,
				longitude: c.longitude,
				customView: Alloy.createController('map/cluster', c).getView()
			});
		}
	});
}


$.mapView.addEventListener('regionchanged', updateMap);