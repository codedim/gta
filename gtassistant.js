/*
**  Google Translate Assistant is an extension for the Google Chrome 
**  browser that provides an user with convenient keyboard shortcuts 
**  for the Google Translate service.
**  
**  powered by codedim, https://github.com/codedim/gta
*/

// key code constants
const kcShift =  16;
const kcCtrl  =  17;
const kcAlt   =  18;
const kcMKey  =  77;
const kcComma = 188;
const kcDot   = 190;
const kcSlash = 191;
// max chars in appname elem
const maxAppnameChars = 120;

// global variables, control and information elements
var translitElem;    // phonetic notation
var appnameElem;     // 'translator' header
var swapElem;        // language switcher
var speechElem;      // microphone button
var srcListenElem;   // source speaker button
var resListenElem;   // result speaker button
var srcTextArea;     // input source textarea
var srcLangButtons;  // source language buttons
var resLangButtons;  // result language buttons

// keyboard and mouse event control arrays
var keyArray = [];   // array of pressed keys 
var mouseEvent = []; // array of mouse events


window.onload = function() {
	// find all information elements
	translitElem = document.getElementById('src-translit');
	appnameElem  = document.getElementById('gt-appname');
	// find all control elements
	swapElem       = document.getElementById('gt-swap');
	speechElem     = document.getElementById('gt-speech');
	srcListenElem  = document.getElementById('gt-src-listen');
	resListenElem  = document.getElementById('gt-res-listen');
	srcTextArea    = document.getElementById('source');
	srcLangButtons = document.getElementById('gt-sl-sugg');
	resLangButtons = document.getElementById('gt-tl-sugg');
	
	// the speech button can be unavailabe in mozilla firefox
	if (!speechElem) 
		console.log('Error: Microphone button element was not found!');

	// all other elements should be found before..
	if (translitElem && appnameElem && swapElem && srcListenElem && 
		resListenElem && srcTextArea && srcLangButtons && resLangButtons) 
	{
		// ..we start the dispatchTranslate timer
		window.setInterval(dispatchTranslate, 100);	
	} else {
		if (!translitElem) 
			console.log('Error: Phonetic notation element was not found!');
		if (!appnameElem) 
			console.log('Error: "Translator" header element was not found!');
		if (!swapElem) 
			console.log('Error: Language switcher element was not found!');
		if (!srcListenElem) 
			console.log('Error: Source speaker button element was not found!');
		if (!resListenElem) 
			console.log('Error: Result speaker button element was not found!');
		if (!srcTextArea) 
			console.log('Error: Source textarea element was not found!');
		if (!srcLangButtons) 
			console.log('Error: Source select language element was not found!');
		if (!resLangButtons) 
			console.log('Error: Result select language element was not found!');
	}

	setMouseEvents();
}

window.onfocus = function() {
	keyArray = [];
	// set focus and select text in source textarea
	srcTextArea.focus();
	srcTextArea.select();
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
		{
	 		controlButton = srcListenElem;
			selectText = true;
		}
	 	if (keyArray[0] == kcCtrl && keyArray[1] == kcDot) 
			controlButton = resListenElem;
	 	if (keyArray[0] == kcCtrl && keyArray[1] == kcSlash)  
	 		controlButton = swapElem;
	 	// switching keyboard input languages by Alt+Shift shortcut
	 	if ( (keyArray[0] == kcShift && keyArray[1] == kcAlt) || 
	 		 (keyArray[0] == kcAlt && keyArray[1] == kcShift) )
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
	const GreySlash  = ' <span style="color:gray">/</span> ';

	if (appnameElem.innerHTML !== translitElem.innerHTML) {
		// determine the sourse and result languages, and if.. 
		if (translitElem.innerHTML.length && 
			getActiveLang(srcLangButtons) == 'en' && 
			!translitElem.innerHTML.includes(GreySlash)) 
		{
			// ..they are English vs Russian, show transcription
			if (getActiveLang(resLangButtons) == 'ru') {
				translitElem.innerHTML += GreySlash + 
					getEnRuTranscription(translitElem.innerHTML, 
						srcTextArea.value);
				
			}
		}

		// replace appname elem text with translit elem text
		appnameElem.innerHTML = translitElem.innerHTML;

		// do not overfloat appname elem
		if (appnameElem.innerHTML.length >= maxAppnameChars) {
			appnameElem.innerHTML = appnameElem.innerHTML.substr(0, 
				maxAppnameChars) + '...';
		}
	}
/*	
	// for debug only, must be commented!
	translitElem.innerHTML = String(keyArray);  
*/
}

function getActiveLang(langButtonArea) {
	var langButtons = langButtonArea.childNodes;
	for (var i = 0; i < langButtons.length; i++) {
		if (langButtons[i].hasAttribute('role') &&
			langButtons[i].getAttribute('role') == 'button')
		{
			if (langButtons[i].hasAttribute('aria-pressed') &&
				langButtons[i].getAttribute('aria-pressed') == 'true' &&
				langButtons[i].hasAttribute('value')) 
			{
				return langButtons[i].getAttribute('value');
			}
		}
	};
	return false;
}

function getEnRuTranscription(translitStr, originalWord) {
	const translitArray  = [ 'j', 'ZH', 'y', 'SH', 'CH', 'NG', 'T͟H', 'TH', 
		'oi', 'ou', 'i(ə)', 'e(ə)', 'o͝o', 'ou(ə)', 'ou(-ə)', 'o͞o', 'o͝o', '(h)w',
		'a', 'i', 'ä', 'ə', 'ā',  'ē',  'ī',  'ō',  'ä',  'ô',  'ə',  'ə' ];
	const transriptArray = [ 'dʒ', 'ʒ', 'j', 'ʃ',  'tʃ', 'ŋ',  'ð',  'θ',  
		'ɔɪ', 'aʊ',  'ɪə',   'eə',  'ʊə',  'auə',   'auə',   'u:', 'ʊ',   'w',
		'æ', 'ɪ', 'ɒ', 'ʌ', 'eɪ', 'ɪ:', 'aɪ', 'əʊ', 'ɑ:', 'ɔ:', 'ɜː', 'ə' ];
	var searchFrom = 0;

	// search for translit array items and replace with 
	// corresponding transript array items
	for (var j = 0; j < translitStr.length; j++) {
		var minFound = translitArray.length;
		// at first, loop all translit array
		for (var i = 0; i < translitArray.length; i++) {
			var match = translitStr.indexOf(translitArray[i], searchFrom);
			if (match >= 0) {
				// and find the first item to replace
				if (match < minFound) {
					minFound = match;
					var item = i;
				} 
			}
		}
		// replace if found
		if (minFound < translitArray.length) {
			var start = translitStr.substr(0, minFound);
			var end = translitStr.substr(minFound + translitArray[item].length);
			var replaceWith;

			if ( translitArray[item] == 'ə' || 
				 translitArray[item] == 'ä' ||
				 translitArray[item] == 'o͝o' ) 
			{
				replaceWith = makeCorrections(translitArray[item], 
					originalWord, minFound);
			} else {
				replaceWith = transriptArray[item];
			}

			// replace the item
			translitStr = start + replaceWith;
			searchFrom = translitStr.length;
			translitStr += end;
		} else {
			break;		
		}
	}

	return translitStr;
}

// determines more appropriate transcription for 'ə', 'ä' or 'o͝o' translit marks
function makeCorrections(translitSound, originalWord, replaceFrom) {
	var replaceWith = '';
			
	// if item to replace is 'ə' sound additional analysis are needed, 
	// because 'ə' may express 'ʌ' and 'ɜː' sounds as well
	if (translitSound == 'ə') {
		replaceWith = 'ə'; // general case

		// but if 'ə' express 'u' letter in stressed syllable
		if (originalWord.length > replaceFrom + 1 && 
			(originalWord[replaceFrom] == 'u' || 
			 originalWord[replaceFrom - 1] == 'u')
		   )
		{
			replaceWith = 'ʌ';
		}

		// and if 'ə' express 'ʌ' sound in the exception syllable 'come'
		if (originalWord.includes('come'))
		{
			replaceWith = 'ʌ';
		}
	} 

	// if item to replace is 'ä' sound additional analysis are needed, 
	// because 'ä' may express 'ɒ' and 'ɑ:' sounds
	if (translitSound == 'ä') {
		replaceWith = 'ɑ:'; // general case

		// but if 'ä' express 'o' letter in stressed syllable
		if (originalWord.length > replaceFrom + 1 && 
			(originalWord[replaceFrom] == 'o' ||
			 originalWord[replaceFrom - 1] == 'o') 
		   )
		{
			replaceWith = 'ɒ';
		}
	} 

	// if item to replace is 'o͝o' sound additional analysis are needed, 
	// because 'o͝o' may express 'ʊ' and 'ʊə' sounds
	if (translitSound == 'o͝o') {
		replaceWith = 'ʊə'; // general case

		// but if 'o͝o' express 'oo' letters in stressed syllable
		if (originalWord.length > replaceFrom + 2 &&
			(originalWord[replaceFrom] == 'o' && 
			 originalWord[replaceFrom + 1] == 'o' && 
			 originalWord[replaceFrom + 2] != 'r') ||
			(originalWord[replaceFrom - 1] == 'o' && 
			 originalWord[replaceFrom] == 'o' && 
			 originalWord[replaceFrom + 1] != 'r')
		   )
		{
			replaceWith = 'ʊ';
		}

		// and if 'o͝o' express 'ʊ' sound in the exception syllable 'put'
		if (originalWord.includes('put'))
		{
			replaceWith = 'ʊ';
		}
	}

	return replaceWith;
}
