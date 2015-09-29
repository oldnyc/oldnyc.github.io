/**
 * JavaScript for the OCR correction tool. See ocr.html
 */

if (window.location.search.indexOf('thanks') >= 0) {
  $('#thanks').show();
}

var id = window.location.hash.slice(1);
$('[name="photo_id"]').val(id);
$('#back-link').attr('href', '/#' + id);
$('#hi-res').attr('href', libraryUrlForPhotoId(id));
var this_lat_lon, other_photo_ids;
findLatLonForPhoto(id, function(lat_lon) {
  this_lat_lon = lat_lon;
  loadInfoForLatLon(lat_lon).then(function(photo_ids) {
    var info = infoForPhotoId(id);
    other_photo_ids = photo_ids;
    $('img.back').attr('src', backOfCardUrlForPhotoId(id));
    var text = info['text'];
    if (text) {
      $('#text').text(info['text']);
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

function submit(type, feedback_obj) {
  sendFeedback(backId(id), type, feedback_obj)
    .done(function() {
      // Go to another image at the same location.
      var next_id = next_image(id);
      var url = location.protocol + '//' + location.host + location.pathname +
                '?thanks&id=' + next_id + '#' + next_id;
      ga('send', 'event', 'link', 'ocr-success', { 'page': '/#' + id });
      window.location = url;
    });
}

// Find the next image from a different card.
function next_image(id) {
  var idx = other_photo_ids.indexOf(id);
  for (var i = 0; i < other_photo_ids.length; i++) {
    var other_id = other_photo_ids[(i + idx) % other_photo_ids.length];

    if (!other_id.match(/[0-9]f/)) {
      // no back of card for this photo
      continue;
    }

    if (backOfCardUrlForPhotoId(other_id) != backOfCardUrlForPhotoId(id)) {
      return other_id;
    }
  }
  return id;
}

function rotate90() {
  var $img = $('img.back');
  var currentRotation = $img.data('rotate') || 0;
  currentRotation += 90;
  $img
    .css('transform', 'rotate(' + currentRotation + 'deg)')
    .data('rotate', currentRotation);
  sendFeedback(backId(id), {'rotate-backing': currentRotation});
}
