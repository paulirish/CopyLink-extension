
chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if ( request.command == 'setClipboard' ) {
      copyToClipboard(request.data);
    } else if ( request.command == 'updateContextMenus' ) {
      updateContextMenus();
    }
  }
);


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
}


function escapeHTML(text) {
  return text ? text.replace(/[&<>'"]/g, convertHTMLChar) : text;
}

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





CreateLink.prototype.formatLinkText = function (formatId, url, text, title, tabId) {

  var template = this.formats[formatId];;
  var data = template.
    replace(/%url%/g, url).
    replace(/%htmlEscapedText%/g, escapeHTML(text)).
    replace(/\\t/g, '\t').
    replace(/\\n/g, '\n');

  this.textToCopy = data;
  return this;
}





chrome.browserAction.onClicked.addListener(function(tab){
  var text = tab.title;
  var title = tab.title;
  var url = tab.url

  new CreateLink().formatLinkText('HTML', url, text, title, tab.id).copyTextToClipboard();
});


