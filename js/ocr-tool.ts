/**
 * JavaScript for the OCR correction tool. See ocr.html
 */

import {libraryUrlForPhotoId, loadInfoForLatLon, backId, infoForPhotoId, backOfCardUrlForPhotoId, findLatLonForPhoto} from './photo-info';
import {FeedbackText, FeedbackType, PhotoFeedback, getFeedbackText, sendFeedback} from './feedback';

if (window.location.search.indexOf('thanks') >= 0) {
  $('#thanks').show();
}

const id = window.location.hash.slice(1);
$('[name="photo_id"]').val(id);
$('#back-link').attr('href', '/#' + id);
$('#hi-res').attr('href', libraryUrlForPhotoId(id));

let other_photo_ids: string[] | undefined;
findLatLonForPhoto(id, function(lat_lon) {
  var infoDef = loadInfoForLatLon(lat_lon),
      ocrDef = getFeedbackText(backId(id));
  // TODO: update to Promise.all; $.when isn't very well-typed.
  $.when<any>(infoDef, ocrDef).done(function(photo_ids: string[], ocr_obj: FeedbackText) {
    console.log(photo_ids, ocr_obj);
    var info = infoForPhotoId(id);
    other_photo_ids = photo_ids;
    $('img.back').attr('src', backOfCardUrlForPhotoId(id));
    var text = ocr_obj ? ocr_obj.text : info.text;
    if (text) {
      $('#text').text(text);
    }
    $('#submit').click(function() {
      submit('text', {text: $('#text').val()});
    });
    $('#notext').click(function() {
      submit('notext', {notext: true});
    });
    $('.rotate-image-button').click(rotate90);
  });
});

interface NoTextJson {
  photo_ids: string[];
}

// A list of photo IDs without text, for use as next images to show.
var noTextIdsDef = $.getJSON('/notext.json');

function submit(type: FeedbackType, feedback_obj: PhotoFeedback) {
  sendFeedback(backId(id), type, feedback_obj)
    .then(function() {
      // Go to another image at the same location.
      return next_image(id);
    })
    .then(function(next_id) {
      var url = location.protocol + '//' + location.host + location.pathname +
                '?thanks&id=' + next_id + '#' + next_id;
      ga('send', 'event', 'link', 'ocr-success', { 'page': '/#' + id });
      window.location.href = url;
    });
}

// Find the next image from a different card.
function next_image(id: string) {
  var def = $.Deferred<string>();

  if (Math.random() < 0.5) {
    // Pick another image from the same location.
    var idx = other_photo_ids.indexOf(id);
    for (var i = 0; i < other_photo_ids.length; i++) {
      var other_id = other_photo_ids[(i + idx) % other_photo_ids.length];

      if (!other_id.match(/[0-9]f/)) {
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
  noTextIdsDef.done(function(data: NoTextJson) {
    var ids = data.photo_ids;
    console.log('Picking at random from ' + ids.length + ' untranscribed photos.');
    def.resolve(ids[Math.floor(Math.random() * ids.length)]);
  });

  return def;
}

function rotate90() {
  var $img = $('img.back');
  var currentRotation = $img.data('rotate') || 0;
  currentRotation += 90;
  $img
    .css('transform', 'rotate(' + currentRotation + 'deg)')
    .data('rotate', currentRotation);
  sendFeedback(backId(id), 'rotate-backing', {'rotate-backing': currentRotation});
}
