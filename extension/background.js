var hiddenInput = document.getElementById('clipboard_object');
var textToCopy;

var focusHiddenArea = function() {
    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    hiddenInput.value = ''
    hiddenInput.focus();
    hiddenInput.select();
};

function CreateLink() {
  this.formats = {
    // {label: "Plain text", format: '%text% %url%' },
    "HTML" : '<a href="%url%">%htmlEscapedText%</a>' 
    // {label: "markdown", format: '[%text%](%url%)' },
    // {label: "mediaWiki", format: '[%url% %text%]' },
  };
}

CreateLink.prototype.copyTextToClipboard = function () {
  focusHiddenArea();
  hiddenInput.value = textToCopy;
  hiddenInput.select();
  document.execCommand("copy");
};


CreateLink.prototype.escapeHTML = function(text) {

  function convertHTMLChar(c) { 
    var charMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;'
    };
    return charMap[c]; 
  }
  return text ? text.replace(/[&<>'"]/g, convertHTMLChar) : text;
}


CreateLink.prototype.formatLinkText = function (opts) {
 
  var template = this.formats[opts.format];
  var data = template.
    replace(/%url%/g, opts.url).
    replace(/%htmlEscapedText%/g, this.escapeHTML(opts.text)).
    replace(/\\t/g, '\t').
    replace(/\\n/g, '\n');

  textToCopy = data;
  return this;
}



// Handle that button click, babe.
chrome.browserAction.onClicked.addListener(function(tab){
  
  var opts = {
    format  : 'HTML',
    text    : tab.title,
    url     : tab.url,
    tab     : tab
  };

  new CreateLink().formatLinkText(opts).copyTextToClipboard();

});


// For every broswer except IE, we can easily get and set data on the clipboard
var standardClipboardEvent = function(event) {
    var clipboardData = event.clipboardData;
    //clipboardData.setData('text/plain', textToCopy);
    clipboardData.setData('text/html', textToCopy);
};


// set up so text is copied properly as html
window.addEventListener('load', function () {
  
  document.addEventListener('copy', function (e) {

    standardClipboardEvent(e);
    focusHiddenArea();
    e.preventDefault();
    
  }, true);
}, false);