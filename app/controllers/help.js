var args = arguments[0] || {};

$.helpBtn.addEventListener('click', function(e) {
	Geo.authorizeLocationServices({
		success: Core.checkPermissions,
		error: Core.checkPermissions
	});
});

// This one instead is called externally
$.close = function() {
	$.getView().close();
};