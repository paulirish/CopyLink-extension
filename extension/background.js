
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
  this.formats = [
    // {label: "Plain text", format: '%text% %url%' },
    {label: "HTML", format: '<a href="%url%">%htmlEscapedText%</a>' },
    // {label: "markdown", format: '[%text%](%url%)' },
    // {label: "mediaWiki", format: '[%url% %text%]' },
  ];
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
function convertHTMLChar(c) { return charMap[c]; }
var charMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&apos;',
  '"': '&quot;'
};



function sendMessageToTab(tabId, message) {
  return _.Deferred(function (d) {
    chrome.tabs.sendMessage(tabId, message, function (res) {
      d.resolve(res);
    });
  });
}


CreateLink.prototype.formatLinkText = function (formatId, url, text, title, tabId) {

  var def = this.formats[formatId];;
  var data = def.format.
    replace(/%url%/g, url).
    replace(/%htmlEscapedText%/g, escapeHTML(text)).
    replace(/\\t/g, '\t').
    replace(/\\n/g, '\n');

  this.textToCopy = data;
  return this;
}

function instance() {
	if ( !window.__instance ) {
		window.__instance = new CreateLink();
	}
	return window.__instance;
}



function onMenuItemClick(contextMenuIdList, info, tab) {
  var url;
  if (info.mediaType === 'image') {
    url = info.srcUrl;
  } else {
    url = info.linkUrl ||  info.pageUrl;
  }
  var text = info.selectionText || tab.title;
  var title = tab.title;

  var formatId = contextMenuIdList[info.menuItemId];
  instance().formatLinkText(formatId, url, text, title, tab.id).copyTextToClipboard();

}