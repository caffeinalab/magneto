// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var currentStepIndex = -1;
var tick = 0;
var intvHandler = null;

var RESET_STEP = {
	title: 'READY',
	bg: '#2e2e2e'
};

var STEPS = [
{
	val: 0,
	bg: '#2ecc71',
	title: 'LOW',
	vibrate: false,
	sound: null
},
{
	val: 40,
	bg: '#f1c40f',
	title: 'MEDIUM',
	vibrate: true,
	sound: Ti.Media.createSound({ url: 'fx/warn.mp3' })
},
{
	val: 400,
	bg: '#F75F21',
	title: 'HIGH!!',
	vibrate: true,
	sound: Ti.Media.createSound({ url: 'fx/wtf.mp3' })
}
];

/*
Methods
*/

function UIStart() {
	intvHandler = setInterval(UIHandle, 100);
	$.btn.title = 'STOP';
	$.st.text = Core.earthMagneticVector == null ? 'LOCALIZING' : 'STARTING';
}

function UIStop() {
	clearInterval(intvHandler);
	intvHandler = null;

	currentStepIndex = -1;

	$.btn.title = 'START';
	$.btn.color = RESET_STEP.bg;

	$.st.text = RESET_STEP.title;
	$.mainWindow.animate({
		backgroundColor: RESET_STEP.bg,
		duration: 1000
	});

	$.val.text = '0';
	$.siri.set('amplitude', 0);
}

/*
Event
*/

function UIHandle() {
	var value = Core.modulo;

	$.val.text = Core.moduloAsString;

	$.siri.set('amplitude', Math.min(value/500,1));

	var _stepIndex = 0;
	_.each(STEPS, function(step, k){
		if (value >= step.val) {
			_stepIndex = +k;
		}
	});

	var cs = STEPS[_stepIndex];
	$.st.text = Core.earthMagneticVector == null ? 'LOCALIZING' : cs.title;

	if (currentStepIndex !== _stepIndex) {
		currentStepIndex = _stepIndex;

		$.btn.color = cs.bg;
		$.mainWindow.animate({
			backgroundColor: cs.bg,
			duration: 1000
		});

		if (cs.vibrate === true) {
			Ti.Media.vibrate();
		}

		if (cs.sound != null) {
			cs.sound.play();
		}
	}
}

/*
Listeners
*/

function rot13(s){
	return s.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
}

function base64_encode(data) {
  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

function share(platform) {
	var mt = $.val.text;
	var u = rot13( base64_encode(mt).replace(/\=/g,'') );
	T('sharer')[platform]({
		url: 'http://magneto.uno/s/?v=' + u,
	});
}

$.shareFb.addEventListener('click', function(){
	share('facebook');
});

$.shareTw.addEventListener('click', function(){
	share('twitter');
});

$.btn.addEventListener('click', function(){
	if (intvHandler != null) {
		Core.stopDetection();
		UIStop();
	} else {
		Core.startDetection();
		UIStart();
	}
});

$.mainWindow.addEventListener('close', function(){
	clearInterval(intvHandler);
});


// Reset the UI
UIStop();

// Set, in a single call, the global navigator (and open it), 
// the boot controller and the boot window.
// You can now access to the navigator using `Flow.getNavigationController()` 
Flow.startup($, $.mainNav, $.mainWindow, 'main', {});
