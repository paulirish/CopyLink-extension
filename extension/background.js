
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
  var self = this;
  this.__defineGetter__( "formats", function () {
    return self.readFormats();
  } );
}
CreateLink.default_formats = [
    // {label: "Plain text", format: '%text% %url%' },
    {label: "HTML", format: '<a href="%url%">%htmlEscapedText%</a>' },
    // {label: "markdown", format: '[%text%](%url%)' },
    // {label: "mediaWiki", format: '[%url% %text%]' },
];

CreateLink.prototype.copyToClipboard = function (text) {
  var proxy = document.getElementById('clipboard_object');
  proxy.value = text;
  proxy.select();
  document.execCommand("copy");
}

CreateLink.prototype.readFormats = function () {
  return CreateLink.default_formats;;
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

CreateLink.prototype.format = function (formatId) {
  return this.formats[formatId];
}
CreateLink.prototype.formatLinkText = function (formatId, url, text, title, tabId) {
  var d;

  var def = this.format(formatId);
  var data = def.format.
    replace(/%url%/g, url).
    replace(/%text%/g, text.replace(/\n/g, ' ')).
    replace(/%text_n%/g, text).
    replace(/%text_br%/g, text.replace(/\n/g, '<br />\n')).
    replace(/%title%/g, title).
    replace(/%newline%/g, '\n').
    replace(/%htmlEscapedText%/g, escapeHTML(text)).
    replace(/\\t/g, '\t').
    replace(/\\n/g, '\n');
  
  var m = data.match(/%input%/g);
  d = _.Deferred().resolve(data);

  d.pipe(function (data) {
    if (def.filter) {
      var m = def.filter.match(/^s\/(.+?)\/(.*?)\/(\w*)$/);
      if (m) {
        data = data.replace(m[1], m[2]);
      }
    }
    return data;
  });

  return d;
}

function instance() {
	if ( !window.__instance ) {
		window.__instance = new CreateLink();
	}
	return window.__instance;
}
