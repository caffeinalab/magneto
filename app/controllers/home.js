// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var currentStepIndex = -1;
var isDetecting = false;
var detectInterval;

var Sounds = T('sounds');

// These are the steps (from min to max) that defines the UI and behaviours.
var STEPS = [
{
	value: 0,
	backgroundColor: '#2ecc71',
	title: 'LOW',
	vibrate: false,
	sound: null
},
{
	value: 40,
	backgroundColor: '#f1c40f',
	title: 'MEDIUM',
	vibrate: true,
	sound: Sounds.create('fx/warn.mp3')
},
{
	value: 400,
	backgroundColor: '#F75F21',
	title: 'HIGH',
	vibrate: true,
	sound: Sounds.create('fx/wtf.mp3')
}
];

$.shareFb.addEventListener('click', function(){
	Core.share('facebook', Core.moduloAsString);
});

$.shareTw.addEventListener('click', function(){
	Core.share('twitter', Core.moduloAsString);
});

// This is the listener that does every fucking thing
$.startDetectionBtn.addEventListener('click', function(){
	if (isDetecting) {
		
		// Change the button UI
		$.startDetectionBtn.title = 'START';
		$.startDetectionBtn.backgroundColor = '#FFF';
	
		// Set a flag to inform the app that is not detecting
		isDetecting = false;

		// Clear the interval to refresh the UI
		clearInterval(detectInterval);
		
		// And stop the real compass detection
		Core.stopDetection();

	} else {

		// Change the button UI
		$.startDetectionBtn.title = 'STOP';
		$.startDetectionBtn.backgroundColor = '#8FFF';

		// Set a flag to inform the app that is not detecting
		isDetecting = true;

		// Start a UI refresh interval
		detectInterval = setInterval(refreshUI, 100);

		// And start the compass detection. Can pass time before the start really occurs.
		Core.startDetection();

	}
});

// Respond to the main event changing the UI according it
function refreshUI() {
	// Avoid to refresh
	if (!isDetecting) return;
	
	// Update the UI
	$.val.text = Core.moduloAsString;
	$.siriWidget.call('setAmplitude', Math.min(Core.modulo / 500, 1));

	// Check the max step reached
	var _stepIndex = 0;
	_.each(STEPS, function(step, k){
		if (Core.modulo >= step.value) {
			_stepIndex = +k;
		}
	});

	// And update the UI conseguentally
	var currentStep = STEPS[_stepIndex];
	$.st.text = currentStep.title;

	// Only process if somethings's changed
	if (currentStepIndex !== _stepIndex) {
		currentStepIndex = _stepIndex;

		// Change the colors based on the steps
		$.startDetectionBtn.color = currentStep.backgroundColor;
		$.mainWindow.animate({
			backgroundColor: currentStep.backgroundColor,
			duration: 1000
		});

		// Vibrate if specified on the step
		if (currentStep.vibrate) {
			Ti.Media.vibrate();
		}

		// If a sound is specified, play the sound
		if (currentStep.sound != null) {
			currentStep.sound.play();
		}
	}
}

// Get current user position
Geo.getCurrentPosition({
	success: function(geoData) {

		// Set the new region of the map
		$.mapView.setRegion({
			animated: true,
			latitude: geoData.latitude,
			longitude: geoData.longitude,
			latitudeDelta: 1,
		});
	
	}
});

Core.getEarthMagneticVector(function() {
	$.earthIntensityLabel.text = Core.earthMagneticIntensity;
});

// Set, in a single call, the global navigator (and open it), 
// the boot controller and the boot window.
// You can now access to the navigator using `Flow.getNavigationController()` 
Flow.startup($, $.mainNav, $.mainWindow, 'main', {});
