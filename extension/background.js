"use strict"

var hiddenInput = document.getElementById('clipboard_object');
var textToCopy;
var htmlToCopy;
var focusHiddenArea = function () {
    // In order to ensure that the browser will fire clipboard events, we always need to have something selected
    hiddenInput.value = '';
    hiddenInput.focus();
    hiddenInput.select();
};



class CreateLink {
    constructor() {
        this.formats = {
            'Plain text': '%text% %url%',
            'HTML': '<a href="%url%">%htmlEscapedText%</a>'
            // {label: "markdown", format: '[%text%](%url%)' },
            // {label: "mediaWiki", format: '[%url% %text%]' },
        };
    }
    escapeHTML(text) {
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
    stripTitleSuffixes(title) {
          // these are pretty selfish and represent my own needs more than other peoples'
          return title
          .replace(' - Google Docs', '')
          .replace('- An open-source project to help move the web forward. - Google Project Hosting', '');
      }
      generateClipboardValues(opts) {

          // handle the default case
          htmlToCopy = this.formatLinkText(opts);

          // handle the text fallback.
          opts.format = 'Plain text';
          textToCopy = this.formatLinkText(opts);
          return this;
      }
      formatLinkText(opts) {
        var text = this.stripTitleSuffixes(opts.text).trim();
        var template = this.formats[opts.format];
        var data = template
                    .replace(/%url%/g, opts.url)
                    .replace(/%text%/g, text)
                    .replace(/%htmlEscapedText%/g, this.escapeHTML(text))
                    .replace(/\\t/g, '\t')
                    .replace(/\\n/g, '\n');
        return data;
    }
    copyTextToClipboard() {
        focusHiddenArea();
        hiddenInput.value = htmlToCopy;
        hiddenInput.select();
        document.execCommand('copy');
    }
}

// For every broswer except IE, we can easily get and set data on the clipboard
var standardClipboardEvent = function (event) {
    var clipboardData = event.clipboardData;
    clipboardData.setData('text/plain', textToCopy);
    clipboardData.setData('text/html', htmlToCopy);
};

// Handle that button click, babe.
chrome.browserAction.onClicked.addListener(function(tab) {
    var opts = {
        format: 'HTML',
        text: tab.title,
        url: tab.url,
        tab: tab
    };
    new CreateLink().generateClipboardValues(opts).copyTextToClipboard();
});

// grab the copy event and hijack it.
window.addEventListener('load', function() {
    document.addEventListener('copy', function(e){
        standardClipboardEvent(e);
        focusHiddenArea();
        e.preventDefault();
    }, true);
}, false);