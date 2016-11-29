/*
**  Google Translate Assistant - extension for Chrome browser.
**  https://github.com/codedim/gta
**  
**  powered by codedim
*/

// key code constants
const kcShift =  16;
const kcCtrl  =  17;
const kcAlt   =  18;
const kcMKey  =  77;
const kcComma = 188;
const kcDot   = 190;
const kcSlash = 191;

// global variables, control and information elements
var translitElem;    // phonetic notation
var appnameElem;     // 'translator' header
var swapElem;        // language switcher
var speechElem;      // microphone button
var srcListenElem;   // source speaker button
var resListenElem;   // result speaker button
var srcTextArea;     // input source textarea

// keyboard and mouse event control arrays
var keyArray = [];   // array of pressed keys 
var mouseEvent = []; // array of mouse events


window.onload = function() {
	// find all information elements
	translitElem = document.getElementById('src-translit');
	appnameElem  = document.getElementById('gt-appname');
	// find all control elements
	swapElem      = document.getElementById('gt-swap');
	speechElem    = document.getElementById('gt-speech');
	srcListenElem = document.getElementById('gt-src-listen');
	resListenElem = document.getElementById('gt-res-listen');
	srcTextArea   = document.getElementById('source');
	
	if (translitElem && appnameElem && swapElem &&
		speechElem && srcListenElem && resListenElem) 
	{
		window.setInterval(dispatchTranslate, 100);	
	} else {
		if (!translitElem) 
			console.log('Error: Phonetic notation element was not found!');
		if (!appnameElem) 
			console.log('Error: "Translator" header element was not found!');
		if (!swapElem) 
			console.log('Error: Language switcher element was not found!');
		if (!speechElem) 
			console.log('Error: Microphone button element was not found!');
		if (!srcListenElem) 
			console.log('Error: Source speaker button element was not found!');
		if (!resListenElem) 
			console.log('Error: Result speaker button element was not found!');
		if (!srcTextArea) 
			console.log('Error: Source textarea element was not found!');
	}

	setMouseEvents();
}

window.onfocus = function() {
	keyArray = [];
	// set focus to source input textarea
	srcTextArea.focus();
}

window.onblur = function() {
	keyArray = [];
}

window.addEventListener("keydown", function(event) {
	processKeyEvent(event.keyCode, true);
});

window.addEventListener("keyup", function(event) {
	processKeyEvent(event.keyCode, false);
});


function setMouseEvents() {
	var events = ['mousedown', 'mouseup', 'mouseout', 'mouseover', 'click'];

	for (var i = 0, e; e = events[i++];) {
		mouseEvent[e] =  document.createEvent('MouseEvents');
		mouseEvent[e].initEvent(e, true, false);
	}
}


function processKeyEvent(keyCode, isKeyDown) {
	// process shortcuts
	var controlButton, selectText = false;
	if (!isKeyDown && keyArray.length == 2) {
	 	if (keyArray[0] == kcCtrl && keyArray[1] == kcMKey)
	 		controlButton = speechElem;
	 	if (keyArray[0] == kcCtrl && keyArray[1] == kcComma)  
	 		controlButton = srcListenElem;
	 	if (keyArray[0] == kcCtrl && keyArray[1] == kcDot)    
	 		controlButton = resListenElem;
	 	if (keyArray[0] == kcCtrl && keyArray[1] == kcSlash)  
	 		controlButton = swapElem;
	 	// switching keyboard input languages by Alt+Shift or Ctrl+Shift
	 	if ( (keyArray[0] == kcShift && keyArray[1] == kcAlt) || 
	 		 (keyArray[0] == kcAlt && keyArray[1] == kcShift) ||
			 (keyArray[0] == kcCtrl && keyArray[1] == kcShift) ||
			 (keyArray[0] == kcShift && keyArray[1] == kcCtrl) )
		{
	 		controlButton = swapElem;
			selectText = true;
		}
	} 

	// do the job
	if (controlButton) {
		var dispatchEvent = controlButton.dispatchEvent.bind(controlButton);
		dispatchEvent(mouseEvent['mouseover']);
		dispatchEvent(mouseEvent['mousedown']);
		dispatchEvent(mouseEvent['mouseup']);
		dispatchEvent(mouseEvent['mouseout']);
		srcTextArea.focus();
		if (selectText) srcTextArea.select();
	}

	// update key array
	if (isKeyDown) {
		// prevent multy-keydawn events
		if (keyArray[keyArray.length - 1] !== keyCode) 
			keyArray.push(keyCode);
	} else {
		// just free key array if any control key was up
		if (keyCode == kcCtrl || keyCode == kcAlt || keyCode == kcShift)
			keyArray = [];
		else
			keyArray.pop();
	}
}


function dispatchTranslate() {
	if (appnameElem.innerHTML !== translitElem.innerHTML) {
		appnameElem.innerHTML = translitElem.innerHTML;
	}

	// for debug only, must be commented!
/*	
	translitElem.innerHTML = String(keyArray);  
*/
}

