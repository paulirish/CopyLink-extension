// from the "inspect-canonical" chrome extension. https://chrome.google.com/webstore/detail/inspect-canonical/glkngfenfpegejlggjfcmdobodjlfann?hl=en-US
// https://robwu.nl/crxviewer/?crx=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Finspect-canonical%2Fglkngfenfpegejlggjfcmdobodjlfann%3Fhl%3Den-US

var url = new URL(window.location.href);

//URL minus any hash (#) fragment
var trueURL = url.protocol + '//' + url.hostname + url.pathname + url.search
var canonicalHead = document.querySelectorAll('head link[rel=canonical]');
var canonicalTotal = document.querySelectorAll('link[rel=canonical]');
var robotsMeta = document.querySelectorAll('meta[name=robots]');
var noindex = false;
var openURL;

robotsMeta.forEach(function(el) {
	if(el.content.includes('noindex')) {
		noindex = true;	
	}
});

//page contains noindex robots meta
if(noindex) {
	chrome.runtime.sendMessage({"status": "red", "text": "Page contains robots 'noindex' tag.\nCanonical tags are ignored.\nClick to view source\n", });
	openURL = 'view-source:' + trueURL;

//no canonical in head but there is one elsewhere
} else if(canonicalHead.length == 0 && canonicalTotal.length > 0) {
	chrome.runtime.sendMessage({"status": "red", "text": "Canonical tag exists but not in <head>.\nClick to view source\n"});
	openURL = 'view-source:' + trueURL;

//no canonical tag all
} else if(canonicalHead.length == 0) {
	chrome.runtime.sendMessage({"status": "red", "text": "Page has no canonical tag.\nClick to view source\n"});
	openURL = 'view-source:' + trueURL;

//more than one canonical tag on page
} else if(canonicalHead.length > 1) {
	chrome.runtime.sendMessage({"status": "red", "text": "Multiple (" + canonicalTotal.length + ") canonical tags found.\nClick to view source\n"});
	openURL = 'view-source:' + trueURL;

//canonical tag but no href attribute
} else if(canonicalHead[0].hasAttribute('href') == false) {
	chrome.runtime.sendMessage({"status": "red", "text": "Canonical tag is missing 'href' attribute.\nClick to view source\n"});
	openURL = 'view-source:' + trueURL;

//canonical present but differs to current URL
} else if(canonicalHead[0].href !== trueURL) {
	chrome.runtime.sendMessage({"status": "amber", "text": "Canonical tag points to another URL.\nClick to visit URL:\n" + canonicalHead[0].href + "\n"});
	openURL = canonicalHead[0].href;

//canonical is present and correct
} else {
	chrome.runtime.sendMessage({"status": "green", "text": "Canonical tag points to current URL\nClick to view source\n"});
	openURL = 'view-source:' + trueURL;
}

//listen for messages from background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	sendResponse({'url': openURL});
});