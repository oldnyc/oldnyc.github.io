/**
 * Common code for recording user feedback.
 * This is shared between the OldNYC site and the OCR feedback tool.
 */

var COOKIE_ID = 'oldnycid';

var firebaseRef: Firebase | null = null;
// e.g. if we're offline and the firebase script can't load.
if (typeof(Firebase) !== 'undefined') {
  firebaseRef = new Firebase('https://brilliant-heat-1088.firebaseio.com/');
}

interface IpInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
}

export interface UserLocation {
  ip: string;
  location: string;
}

let userLocation: UserLocation | null = null;
$.get('//ipinfo.io', function(response: IpInfo) {
  userLocation = {
    ip: response.ip,
    location: response.country + '-' + response.region + '-' + response.city
  };
}, 'jsonp');

let lastReviewedOcrMsPromise = $.get('/timestamps.json').then(function(data) {
  return data.ocr_ms as number;
});

export function deleteCookie(name: string) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function setCookie(name: string, value: string) {
  document.cookie = name + "=" + value + "; path=/";
}

export function getCookie(name: string) {
  const b = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}

// Assign each user a unique ID for tracking repeat feedback.
let COOKIE = getCookie(COOKIE_ID);
if (!COOKIE) {
  COOKIE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  setCookie(COOKIE_ID, COOKIE);
}

// TODO: this depends on FeedbackType
export interface PhotoFeedback {
  text?: string;
  notext?: boolean;
  rotate?: number;
  original?: number;
  'rotate-backing'?: number;
}
interface FeedbackMetadata {
  timestamp: number;
  user_agent: string;
  user_ip: string;
  location: string;
  cookie: string;
}
/** Feedback type (matches tags in index.html, ocr.html) */
export type FeedbackType = 'rotate' | 'rotate-backing' | 'cut-in-half' | 'large-border' | 'multiples' | 'wrong-location' | 'date' | 'text' | 'notext';

// Record one piece of feedback. Returns a jQuery deferred object.
export function sendFeedback(
  photo_id: string,
  feedback_type: FeedbackType,
  feedback_obj: PhotoFeedback,
) {
  ga('send', 'event', 'link', 'feedback', { 'page': '/#' + photo_id });

  const feedbackWithMetadata = {
    ...feedback_obj,
    metadata: {
      timestamp: Firebase.ServerValue.TIMESTAMP,
      user_agent: navigator.userAgent,
      user_ip: userLocation ? userLocation.ip : '',
      location: userLocation ? userLocation.location : '',
      cookie: COOKIE
    } satisfies FeedbackMetadata
  };
  var path = '/feedback/' + photo_id + '/' + feedback_type;

  var feedbackRef = firebaseRef.child(path);
  var deferred = $.Deferred();
  feedbackRef.push(feedbackWithMetadata, function(error) {
    if (error) {
      console.error('Error pushing', error);
      deferred.reject(error);
    } else {
      deferred.resolve();
    }
  });

  return deferred;
}

export interface FeedbackText {
  text: string;
  metadata: FeedbackMetadata;
}

// Retrieve the most-recent OCR for a backing image.
// Returns a Deferred object which resolves to
// { text: string, metadata: { timestamp: number, ... }
// Resolves with null if there is no OCR text available.
export function getFeedbackText(back_id: string) {
  var deferred = $.Deferred<null | FeedbackText>();

  lastReviewedOcrMsPromise.then(function(lastReviewedOcrMs) {
    firebaseRef.child('/feedback/' + back_id + '/text')
      .orderByKey()
      // TODO: start with a key corresponding to lastReviewedOcrMs
      // .limitToLast(1)
      .once('value', function(feedback) {
        let chosen: null | FeedbackText = null;
        feedback.forEach(function(row) {
          var v = row.val() as FeedbackText;
          if (v.metadata.timestamp > lastReviewedOcrMs) {
            chosen = v;  // take the most-recent one
          }
        });
        // if none are chosen then ther's no text or the static site is up-to-date.
        deferred.resolve(chosen);
      });
  });

  return deferred;
}
