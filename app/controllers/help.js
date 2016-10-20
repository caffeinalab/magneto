var args = arguments[0] || {};

// This one instead is called externally
$.close = function() {
	$.getView().close();
};