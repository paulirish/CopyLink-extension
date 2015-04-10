"use strict"

class CreateLink {
    constructor() {
        this.formats = {
            'Plain text': '%text% %url%',
            'HTML': '<a href="%url%">%htmlEscapedText%</a>'
        };

        this.addEventListeners();

        this.hiddenInput = document.getElementById('clipboard_object');
        this.toClipboard = {};

    }

    addEventListeners() {
        // grab the copy event and hijack it.
        document.addEventListener('copy', this.handleCopyEvent.bind(this), true);

        // Handle that button click, babe.
        chrome.browserAction.onClicked.addListener(this.handleBrowserAction);
    }

    handleBrowserAction(tab) {
        var opts = {
            format: 'HTML',
            text: tab.title,
            url: tab.url,
            tab: tab
        };
        CL.generateClipboardValues(opts).copyTextToClipboard();
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
        this.toClipboard.html = this.formatLinkText(opts);

        // handle the text fallback.
        opts.format = 'Plain text';
        this.toClipboard.text = this.formatLinkText(opts);
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

    focusHiddenArea() {
        // In order to ensure that the browser will fire clipboard events, we always need to have something selected
        this.hiddenInput.value = '';
        this.hiddenInput.focus();
        this.hiddenInput.select();
    };

    copyTextToClipboard() {
        this.focusHiddenArea();
        this.hiddenInput.value = this.toClipboard.html;
        this.hiddenInput.select();
        document.execCommand('copy');
    }

    handleCopyEvent (e){
        e.clipboardData.setData('text/plain', this.toClipboard.text);
        e.clipboardData.setData('text/html', this.toClipboard.html);
        this.focusHiddenArea();
        e.preventDefault();
    }
}



var CL = new CreateLink();




