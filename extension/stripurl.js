// thx to https://github.com/mihaip/utm-stripper/blob/master/extension/background.js

function getStrippedUrl(url) {
  // Strip UTM parameters
  if (url.indexOf('utm_') > url.indexOf('?')) {
    url = url.replace(
        /([\?\&]utm_(reader|source|medium|campaign|content|term|cid)=[^&#]*)/ig,
        '');
  }

  // Strip MailChimp parameters
  if (url.indexOf('mc_eid') > url.indexOf('?') || url.indexOf('mc_cid') > url.indexOf('?')) {
    url = url.replace(
        /([\?\&](mc_cid|mc_eid)=[^&#]+)/ig,
        '');
  }

  // Strip YouTube parameters
  if (url.indexOf('http://www.youtube.com/watch') === 0 ||
      url.indexOf('https://www.youtube.com/watch') === 0) {
    url = url.replace(/([\?\&](feature|app|ac|src_vid|annotation_id)=[^&#]*)/ig, '');
  }

  // Strip Yandex openstat parameters
  if (url.indexOf('_openstat') > url.indexOf('?')) {
    url = url.replace(/([\?\&]_openstat=[^&#]+)/ig, '');
  }

  // Strip HubSpot parameters
  if (url.indexOf('_hsenc') > url.indexOf('?') || url.indexOf('_hsmi') > url.indexOf('?')) {
    url = url.replace(
        /([\?\&](_hsenc|_hsmi)=[^&#]+)/ig,
        '');
  }

  // If there were other query parameters, and the stripped ones were first,
  // then we need to convert the first ampersand to a ? to still have a valid
  // URL.
  if (url.indexOf('&') != -1 && url.indexOf('?') == -1) {
    url = url.replace('&', '?');
  }

  return url;
}
