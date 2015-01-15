
function CreateLink() {
  this.formats = {
    // {label: "Plain text", format: '%text% %url%' },
    "HTML" : '<a href="%url%">%htmlEscapedText%</a>' 
    // {label: "markdown", format: '[%text%](%url%)' },
    // {label: "mediaWiki", format: '[%url% %text%]' },
  };
}

CreateLink.prototype.copyTextToClipboard = function () {
  var proxy = document.getElementById('clipboard_object');
  proxy.value = this.textToCopy;
  proxy.select();
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

  this.textToCopy = data;
  return this;
}




chrome.browserAction.onClicked.addListener(function(tab){
  var opts = {
    format  : 'HTML',
    text    : tab.title,
    url     : tab.url,
    tab     : tab
  }

  new CreateLink().formatLinkText(opts).copyTextToClipboard();
});


