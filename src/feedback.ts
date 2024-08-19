/**
 * Common code for recording user feedback.
 * This is shared between the OldNYC site and the OCR feedback tool.
 */

const API = 'https://danvk-bronzeswift.web.val.run/api/v0';
var COOKIE_ID = 'oldnycid';

export function deleteCookie(name: string) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function setCookie(name: string, value: string) {
  document.cookie = name + '=' + value + '; path=/';
}

export function getCookie(name: string) {
  const b = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return b ? b.pop()! : '';
}

// Assign each user a unique ID for tracking repeat feedback.
let COOKIE = getCookie(COOKIE_ID);
if (!COOKIE) {
  COOKIE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  );
  setCookie(COOKIE_ID, COOKIE);
}
// TODO: this depends on FeedbackType
export interface PhotoFeedback {
  text?: string;
  notext?: boolean;
  rotate?: number;
  original?: number | null;
  'rotate-backing'?: number;
  date?: string;
}
interface FeedbackMetadata {
  cookie: string;
}

interface FeedbackRequest extends PhotoFeedback {
  metadata: FeedbackMetadata;
}

/** Feedback type (matches tags in index.html, ocr.html) */
export type FeedbackType =
  | 'rotate'
  | 'rotate-backing'
  | 'cut-in-half'
  | 'large-border'
  | 'multiples'
  | 'wrong-location'
  | 'date'
  | 'text'
  | 'notext';

// Record one piece of feedback. Returns a jQuery deferred object.
export async function sendFeedback(
  photo_id: string,
  feedback_type: FeedbackType,
  feedback_obj: PhotoFeedback,
) {
  ga('send', 'event', 'link', 'feedback', { page: '/#' + photo_id });

  const feedbackRequest: FeedbackRequest = {
    ...feedback_obj,
    metadata: {
      // TODO: move into request headers?
      cookie: COOKIE,
    },
  };
  const path = `${API}/${photo_id}/${feedback_type}`;

  const response = await fetch(path, {
    method: 'POST',
    body: JSON.stringify(feedbackRequest),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

export interface FeedbackText {
  text: string;
  timestamp: number;
}

// Retrieve the most-recent OCR for a backing image.
// Resolves with null if there is no OCR text available.
export async function getFeedbackText(back_id: string) {
  const path = `${API}/${back_id}/text`;
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const feedback = (await response.json()) as FeedbackText;
  if (feedback.timestamp > timestamps.ocr_ms) {
    return feedback;
  }
  return null;
}
