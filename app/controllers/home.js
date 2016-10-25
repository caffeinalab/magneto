// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

//////////////////
// Private vars //
//////////////////

var currentStepIndex = -1;
var isDetecting = false;
var detectInterval = null;

// Reference only locally the library
var Sounds = T('sounds');

// These are the steps (from min to max) 
// that defines the UI and behaviours.
var STEPS = [
{
	value: 0,
	backgroundColor: '#2ECC71',
	title: 'LOW',
	vibrate: false,
	sound: null
},
{
	value: 40,
	backgroundColor: '#F1C40F',
	title: 'MEDIUM',
	vibrate: true,
	sound: Alloy.Globals.SIMULATOR ? null : Sounds.create('fx/warn.mp3')
},
{
	value: 400,
	backgroundColor: '#F75F21',
	title: 'HIGH',
	vibrate: true,
	sound: Alloy.Globals.SIMULATOR ? null : Sounds.create('fx/wtf.mp3')
}
];

/////////////////////
// Private methods //
/////////////////////

function maybeDetect() {
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
}

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

///////////////
// Listeners //
///////////////

$.mapRightButton.addEventListener('click', function(e) {
	Router.go('/map');
});

$.shareFb.addEventListener('click', function() {
	// Dispatch the share route to the target platform using the 
	// Util.buildQuery to build the request (no real needed, only for proof of concept)
	Router.go('/share/facebook' + Util.buildQuery({ modulo: Core.moduloAsString }));
});

$.shareTw.addEventListener('click', function() {
	// Dispatch the share route to the target platform using the 
	// Util.buildQuery to build the request (no real needed, only for proof of concept)
	Router.go('/share/twitter' + Util.buildQuery({ modulo: Core.moduloAsString }));
});

// This is the listener that does every fucking thing
$.startDetectionBtn.addEventListener('click', function(){
	maybeDetect();
});

//////////
// Init //
//////////

// Retrieve the earth magnetic vector and visualize in the label
Core.getEarthMagneticVector(function() {
	$.earthIntensityLabel.text = Core.earthMagneticIntensity;
});

// Set, in a single call, the global navigator (and open it), 
// the boot controller and the boot window.
// You can now access to the navigator using `Flow.getNavigationController()` 
Flow.startup($, $.mainNav, $.mainWindow, 'home', {});
