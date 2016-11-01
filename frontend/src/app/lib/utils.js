import querystring from 'querystring';

import { experimentL10nId, l10nId, l10nIdFormat, lookup } from '../../../tasks/util';


export function formatDate(date) {
  let out = '';
  const d = new Date(date);
  if (isNaN(d)) {
    out = null;
  } else {
    // safari is the new IE :(
    try {
      out = d.toLocaleDateString();
    } catch (e) {
      out = `${d.getMonth() + 1} / ${d.getDate()} / ${d.getFullYear()}`;
    }
  }
  return out;
}

export function buildSurveyURL(ref, title, installed, clientUUID, survey_url) {
  const queryParams = querystring.stringify({
    ref,
    experiment: title,
    cid: clientUUID,
    installed: installed ? Object.keys(installed) : []
  });
  return `${survey_url}?${queryParams}`;
}

export function createMarkup(content) {
  return { __html: content };
}

export function isMinFirefoxVersion(isFirefox, ua, minVersion) {
  if (!isFirefox) return false;
  return parseInt(ua.split('/').pop(), 10) >= minVersion;
}


// Passed a string, returns a verison of that string sanitized by stripping all
// non-alphanumeric characters, lowercasing the entire string, then capitalizing
// the first character.
//
// > l10nIdFormat('Activity Stream');
// Activitystream
export { l10nIdFormat };


// Passed an array of pieces, returns a formatted l10n ID comprised of those
// pieces, sanitized and camel-cased.
//
// > l10nId(['Activity Stream', 'Contributor', 'Title', 'Bryan Bell']);
// 'activitystreamContributorTitleBryanbell'
export { l10nId };


// Passed three pieces of information, generates and returns an appropriate l10n
// ID.
//
// Params:
// - experiment - the JavaScript object representing the experiment.
// - pieces - an array of segments used for two purposes:
//            1) to construct the generated l10n ID
//            2) to search for an _l10n suffix for the field.
//            If a string is passed, it's converted to a single-item array.
export { experimentL10nId };


// Passed an object and a period.delimited string indicating a path, returns the
// value at that path if it exists, or null if it doesn't.
//
// >> lookup({ foo: [ { bar: 'baz' } ] }, 'foo.0.bar');
// 'baz'
//
// >> lookup({}, 'foo');
// null
export { lookup };
