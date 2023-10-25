'use strict';

import {getStrippedUrl} from './stripurl.js';

class CreateLink {
  constructor() {
    this.formats = {
      'Plain text': '%url% "%text%"',
      'HTML': '<a href="%url%">%htmlEscapedText%</a>',
      'Markdown': '[%htmlEscapedText%](%url%)'
    };

    this.addEventListeners();
    this.lastTime = 0;
    this.doubleClickThreshold = 520;
    this.markdown = false;

    this.toClipboard = {};

  }

  addEventListeners() {
    // Handle that button click, babe.
    chrome.action.onClicked.addListener(this.handleaction.bind(this));
  }

  handleaction( tab) {
    this.markdown = !!(Date.now() - this.lastTime < this.doubleClickThreshold);
    this.lastTime = Date.now();

    this.title = tab.title;
    this.url = this.shortenURL(this.cleanURL(tab.url));
    this.tab = tab;
    CL.generateClipboardValues().copyTextToClipboard();
  }

  cleanURL(url){
    const strippedURL = new URL(getStrippedUrl(url));
    // nuke the hash stuff from google docs & slides
    strippedURL.hash = strippedURL.hash
        .replace(/(heading|slide)=[^&#]*/ig,'')
        .replace(/^#$/,'')
    return strippedURL.toString();
  }

  shortenURL(url){
    return url
      // https://chromium-review.googlesource.com/c/devtools/devtools-frontend/+/4975855
      // https://crrev.com/c/4975855
      .replace(/chromium-review.googlesource.com\/c\/.*?\/.*?\/\+/, 'crrev.com/c')
      // https://bugs.chromium.org/p/chromium/issues/detail?id=1263871&q=self%20profiling&can=2 "Monorail"
      // https://crbug.com/1263871
      .replace('bugs.chromium.org/p/chromium/issues/detail?id=', 'crbug.com/')
      // drop extra params
      .replace(/\?.*/,'')
      .replace(/&.*/,'')
  }



  escapeHTML( text) {
    function convertHTMLChar (c) {
      var charMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' };
      return charMap[c];
    }
    return text ? text.replace(/[&<>'"]/g, convertHTMLChar) : text;
  }

  stripTitleSuffixes( title) {
    // these are pretty selfish and represent my own needs more than other peoples'
    return title
      .replace(' - Google Docs', '')
      .replace('- An open-source project to help move the web forward.', '')
      .replace(' - Google Project Hosting','')
      .replace(' - Chromium - ',' - ')
      .replace(' - Monorail',' - ')
      .replace(' · Gerrit Code Review',' · ')
      .replace(' · GoogleChrome/lighthouse','')
      .replace('Pull Request #','#')
      .replace('Issue #','#')
      .replace(/ - \S+@\S+ - ((\S+ M)|Gm)ail$/,'')
      .replace(/ - ?$/,'')
      .replace(/ · ?$/,'')
  }

  generateClipboardValues() {
    // handle the default case
    this.toClipboard.html = this.formatLinkText('HTML');

    // handle the text fallback.
    this.toClipboard.text = this.formatLinkText(this.markdown ? 'Markdown' : 'Plain text');
    return this;
  }

  formatLinkText( format) {
    var text = this.stripTitleSuffixes(this.title).trim();
    var template = this.formats[format];
    var data = template
      .replace(/%url%/g, this.url)
      .replace(/%text%/g, text)
      .replace(/%htmlEscapedText%/g, this.escapeHTML(text))
      .replace(/\\t/g, '\t')
      .replace(/\\n/g, '\n');
    return data;
  }


  // copy it from within the page! https://stackoverflow.com/a/75293710
  copyTextToClipboard() {
    const p = chrome.scripting.executeScript({
      target: { tabId: this.tab.id },
      func: copyToClipboard_pagefn,
      args: [this.toClipboard.text, this.toClipboard.html],
    });
    p.then(_ => this.triggerNotification())
      .catch(console.error);
  }


  triggerNotification() {
    chrome.action.setBadgeBackgroundColor({color: '#5CC77D'});
    chrome.action.setBadgeText({text: this.markdown ? 'MkDn' : 'OK'});
    setTimeout(function () {
      chrome.action.setBadgeText({text: ''});
    }, 1000);
  }
}


function copyToClipboard_pagefn(text, html) {
    const textBlob = new Blob([text], { type: 'text/plain' });
    const htmlBlob = new Blob([html], { type: 'text/html' });
    // text/markdown not supported. (for several reasons)
    // …one being https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/clipboard/clipboard_writer.cc;l=307-318;drc=717a5ba32f0aba300c860d5bff7c87bbcff44afc
    // const mdBlob = new Blob([markdown], { type: "text/markdown" });
    const cpItem = new ClipboardItem({
      [textBlob.type]: textBlob,
      [htmlBlob.type]: htmlBlob,
    });
    return navigator.clipboard.write([cpItem]);
}

var CL = new CreateLink();

