/**
 * JavaScript for the OCR correction tool. See ocr.html
 */

import {
  loadInfoForLatLon,
  backId,
  infoForPhotoId,
  backOfCardUrlForPhotoId,
  findLatLonForPhoto,
  getLibraryUrl,
} from './photo-info';
import {
  FeedbackType,
  PhotoFeedback,
  getFeedbackText,
  sendFeedback,
} from './feedback';

if (window.location.search.includes('thanks')) {
  $('#thanks').show();
}

const id = window.location.hash.slice(1);
$('[name="photo_id"]').val(id);
$('#back-link').attr('href', '/#' + id);

let other_photo_ids: string[] | undefined;
findLatLonForPhoto(id, function (lat_lon) {
  const infoP = loadInfoForLatLon(lat_lon);
  const ocrP = getFeedbackText(backId(id));

  (async () => {
    const [photo_ids, ocr_obj] = await Promise.all([infoP, ocrP]);
    console.log(photo_ids, ocr_obj);
    const info = infoForPhotoId(id);
    $('#hi-res').attr('href', getLibraryUrl(id, info.nypl_url));
    other_photo_ids = photo_ids;
    $('img.back').attr('src', backOfCardUrlForPhotoId(id));
    const text = ocr_obj ? ocr_obj.text : info.text;
    if (text) {
      $('#text').text(text);
    }
    $('#submit').click(function () {
      void submit('text', { text: $('#text').val() as string });
    });
    $('#notext').click(function () {
      void submit('notext', { notext: true });
    });
    $('.rotate-image-button').click(rotate90);
  })().catch((e) => {
    console.error(e);
  });
});

interface NoTextJson {
  photo_ids: string[];
}

// A list of photo IDs without text, for use as next images to show.
const noTextIdsDef = $.getJSON('/static/notext.json');

async function submit(type: FeedbackType, feedback_obj: PhotoFeedback) {
  await sendFeedback(backId(id), type, feedback_obj);
  // Go to another image at the same location.
  const nextId = await next_image(id);
  const url =
    location.protocol +
    '//' +
    location.host +
    location.pathname +
    '?thanks&id=' +
    nextId +
    '#' +
    nextId;
  ga('send', 'event', 'link', 'ocr-success', { page: '/#' + id });
  window.location.href = url;
}

// Find the next image from a different card.
function next_image(id: string) {
  const def = $.Deferred<string>();

  const otherPhotoIds = other_photo_ids!;

  if (Math.random() < 0.5) {
    // Pick another image from the same location.
    const idx = otherPhotoIds.indexOf(id);
    for (let i = 0; i < otherPhotoIds.length; i++) {
      const other_id = otherPhotoIds[(i + idx) % otherPhotoIds.length];

      if (!/[0-9]f/.exec(other_id)) {
        // no back of card for this photo
        continue;
      }

      if (backOfCardUrlForPhotoId(other_id) != backOfCardUrlForPhotoId(id)) {
        def.resolve(other_id);
        return def;
      }
    }
    // ... fall through
  }

  // Pick an image with no transcription (these are the most valuable to get
  // user-generated data for).
  noTextIdsDef.done(function (data: NoTextJson) {
    const ids = data.photo_ids;
    console.log(
      'Picking at random from ' + ids.length + ' untranscribed photos.',
    );
    def.resolve(ids[Math.floor(Math.random() * ids.length)]);
  });
  return def;
}

function rotate90() {
  const $img = $('img.back');
  let currentRotation = ($img.data('rotate') as number) || 0;
  currentRotation += 90;
  $img
    .css('transform', 'rotate(' + currentRotation + 'deg)')
    .data('rotate', currentRotation);
  void sendFeedback(backId(id), 'rotate-backing', {
    'rotate-backing': currentRotation,
  });
}
