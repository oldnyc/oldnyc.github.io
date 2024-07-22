import {nameForLatLon, backId, descriptionForPhotoId, infoForPhotoId, loadInfoForLatLon, findLatLonForPhoto, LightPhotoInfo, PhotoInfo, libraryUrl} from './photo-info';
import {MAP_STYLE, STATIC_MAP_STYLE} from './map-styles';
import {getCanonicalUrlForPhoto} from './social';
import {getFeedbackText, sendFeedback, deleteCookie, setCookie, FeedbackType} from './feedback';
import {popular_photos} from './popular-photos';

const markers: google.maps.Marker[] = [];
const marker_icons: google.maps.Icon[] = [];
export var lat_lon_to_marker: {[latLng: string]: google.maps.Marker} = {};

let selected_marker_icons: google.maps.Icon[] = [];
let selected_marker: google.maps.Marker | undefined;
let selected_icon: google.maps.Icon | google.maps.Symbol | string | undefined;
let year_range: [number, number] = [1800, 2000];

export let map: google.maps.Map | undefined;
export let mapPromise = $.Deferred<google.maps.Map>();

type PopularPhoto = (typeof popular_photos)[number];

interface YearToCount {
  [year: string]: number;
}

// TODO: inline image source into popular-photos.js and get rid of this.
function expandedImageUrl(photo_id: string) {
  return 'http://oldnyc-assets.nypl.org/600px/' + photo_id + '.jpg';
}

// lat_lon is a "lat,lon" string.
function makeStaticMapsUrl(lat_lon: string) {
  return 'http://maps.googleapis.com/maps/api/staticmap?center=' + lat_lon + '&zoom=15&size=150x150&key=AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA&maptype=roadmap&markers=color:red%7C' + lat_lon + '&style=' + STATIC_MAP_STYLE;
}

function isFullTimeRange(yearRange: [number, number]) {
  return (yearRange[0] === 1800 && yearRange[1] === 2000);
}

// A photo is in the date range if any dates mentioned in it are in the range.
// For example, "1927; 1933; 1940" is in the range [1920, 1930].
function isPhotoInDateRange(info: PhotoInfo, yearRange: [number, number]) {
  if (isFullTimeRange(yearRange)) return true;

  const [first, last] = yearRange;
  for (let i = 0; i < info.years.length; i++) {
    const year = info.years[i];  // could be empty string
    if (year && Number(year) >= first && Number(year) <= last) return true;
  }
  return false;
}

export function countPhotos(yearToCounts: YearToCount) {
  if (isFullTimeRange(year_range)) {
    // This includes undated photos.
    return Object.values(yearToCounts || {}).reduce((a, b) => a + b, 0);
  } else {
    const [first, last] = year_range;
    return Object.entries(yearToCounts || {})
        .filter(([y]) => (Number(y) > first && Number(y) <= last))
        .map(([, c]) => c)
        .reduce((a, b) => a + b, 0);
  }
}

// Make the given marker the currently selected marker.
// This is purely UI code, it doesn't touch anything other than the marker.
export function selectMarker(marker: google.maps.Marker, yearToCounts: YearToCount) {
  const numPhotos = countPhotos(yearToCounts);
  var zIndex = 0;
  if (selected_marker) {
    zIndex = selected_marker.getZIndex();
    selected_marker.setIcon(selected_icon);
  }

  if (marker) {
    selected_marker = marker;
    selected_icon = marker.getIcon();
    marker.setIcon(selected_marker_icons[numPhotos > 100 ? 100 : numPhotos]);
    marker.setZIndex(100000 + zIndex);
  }
}

export function updateYears(firstYear: number, lastYear: number) {
  year_range = [firstYear, lastYear];
  for (const [lat_lon, marker] of Object.entries(lat_lon_to_marker)) {
    const count = countPhotos(lat_lons[lat_lon]);
    if (count) {
      marker.setIcon(marker_icons[Math.min(count, 100)]);
      marker.setVisible(true);
    } else {
      marker.setVisible(false);
    }
  }
  addNewlyVisibleMarkers();
  $('#time-range-labels').text(`${firstYear}–${lastYear}`);
}

// The callback gets fired when the info for all lat/lons at this location
// become available (i.e. after the /info RPC returns).
function displayInfoForLatLon(lat_lon: string, marker?: google.maps.Marker, opt_selectCallback?: (photo_id: string) => void) {
  if (marker) selectMarker(marker, lat_lons[lat_lon]);

  loadInfoForLatLon(lat_lon).done(function(photoIds) {
    var selectedId = null;
    if (photoIds.length <= 10) {
      selectedId = photoIds[0];
    }
    showExpanded(lat_lon, photoIds, selectedId);
    if (opt_selectCallback && selectedId) {
      opt_selectCallback(selectedId);
    }
  }).fail(function() {
  });
}

function handleClick(e: google.maps.Data.MouseEvent) {
  var lat_lon = e.latLng.lat().toFixed(6) + ',' + e.latLng.lng().toFixed(6)
  var marker = lat_lon_to_marker[lat_lon];
  displayInfoForLatLon(lat_lon, marker, function(photo_id) {
    $(window).trigger('openPreviewPanel');
    $(window).trigger('showPhotoPreview', photo_id);
  });
  $(window).trigger('showGrid', lat_lon);
}

export function initialize_map() {
  var latlng = new google.maps.LatLng(40.74421, -73.97370);
  var opts = {
    zoom: 15,
    maxZoom: 18,
    minZoom: 10,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: true,
    panControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    },
    styles: MAP_STYLE
  };

  map = new google.maps.Map($('#map').get(0), opts);

  // This shoves the navigation bits down by a CSS-specified amount
  // (see the .spacer rule). This is surprisingly hard to do.
  var map_spacer = $('<div/>').append($('<div/>').addClass('spacer')).get(0);
  // map_spacer.index = -1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(map_spacer);

  // The OldSF UI just gets in the way of Street View.
  // Even worse, it blocks the "exit" button!
  var streetView = map.getStreetView();
  google.maps.event.addListener(streetView, 'visible_changed',
      function() {
        $('.streetview-hide').toggle(!streetView.getVisible());
      });

  // Create marker icons for each number.
  marker_icons.push(null);  // it's easier to be 1-based.
  selected_marker_icons.push(null);
  for (var i = 0; i < 100; i++) {
    var num = i + 1;
    var size = (num == 1 ? 9 : 13);
    var selectedSize = (num == 1 ? 15 : 21);
    marker_icons.push(
      {
        url: 'images/sprite-2014-08-29.png',
        size: new google.maps.Size(size, size),
        origin: new google.maps.Point((i%10)*39, Math.floor(i/10)*39),
        anchor: new google.maps.Point((size - 1) / 2, (size - 1)/2)
      }
    );
    selected_marker_icons.push({
      url: 'images/selected-2014-08-29.png',
      size: new google.maps.Size(selectedSize, selectedSize),
      origin: new google.maps.Point((i%10)*39, Math.floor(i/10)*39),
      anchor: new google.maps.Point((selectedSize - 1) / 2, (selectedSize - 1)/2)
  });
  }

  // Adding markers is expensive -- it's important to defer this when possible.
  var idleListener = google.maps.event.addListener(map, 'idle', function() {
    google.maps.event.removeListener(idleListener);
    addNewlyVisibleMarkers();
    mapPromise.resolve(map);
  });

  google.maps.event.addListener(map, 'bounds_changed', function() {
    addNewlyVisibleMarkers();
  });
}

function addNewlyVisibleMarkers() {
  var bounds = map.getBounds();

  for (var lat_lon in lat_lons) {
    if (lat_lon in lat_lon_to_marker) continue;

    var pos = parseLatLon(lat_lon);
    if (!bounds.contains(pos)) continue;

    createMarker(lat_lon, pos);
  }
}

export function parseLatLon(lat_lon: string) {
  var ll = lat_lon.split(",");
  return new google.maps.LatLng(parseFloat(ll[0]), parseFloat(ll[1]));
}

export function createMarker(lat_lon: string, latLng: google.maps.LatLng) {
  const count = countPhotos(lat_lons[lat_lon]);
  if (!count) {
    return;
  }
  const marker = new google.maps.Marker({
    position: latLng,
    map: map,
    visible: true,
    icon: marker_icons[Math.min(count, 100)],
    title: lat_lon
  });
  markers.push(marker);
  lat_lon_to_marker[lat_lon] = marker;
  google.maps.event.addListener(marker, 'click', handleClick);
  return marker;
}


// NOTE: This can only be called when the info for all photo_ids at the current
// position have been loaded (in particular the image widths).
// key is used to construct URL fragments.
export function showExpanded(key: string, photo_ids: string[], opt_selected_id?: string) {
  hideAbout();
  map.set('keyboardShortcuts', false);
  $('#expanded').show().data('grid-key', key);
  $('.location').text(nameForLatLon(key));
  if (isFullTimeRange(year_range)) {
    $('#filtered-slideshow').hide();
  } else {
    const [first, last] = year_range;
    $('#filtered-slideshow').show();
    $('#slideshow-filter-first').text(first);
    $('#slideshow-filter-last').text(last);
  }
  var images = $.map(photo_ids, function(photo_id) {
    var info = infoForPhotoId(photo_id);
    if (!isPhotoInDateRange(info, year_range)) return null;
    return $.extend({
      id: photo_id,
      largesrc: info.image_url,
      src: info.thumb_url,
      width: 600,   // these are fallbacks
      height: 400
    }, info);
  });
  images = images.filter(image => image !== null);
  $('#preview-map').attr('src', makeStaticMapsUrl(key));
  $('#grid-container').expandableGrid({
    rowHeight: 200,
    speed: 200 /* ms for transitions */
  }, images);
  if (opt_selected_id) {
    $('#grid-container').expandableGrid('select', opt_selected_id);
  }
}

export function hideExpanded() {
  $('#expanded').hide();
  $(document).unbind('keyup');
  map.set('keyboardShortcuts', true);
}

// This fills out details for either a thumbnail or the expanded image pane.
function fillPhotoPane(photo_id: string, $pane: JQuery) {
  // $pane is div.og-details
  // This could be either a thumbnail on the right-hand side or an expanded
  // image, front and center.
  $('.description', $pane).html(descriptionForPhotoId(photo_id));

  var info = infoForPhotoId(photo_id);
  var library_url = libraryUrl(photo_id, info['nypl_url']);

  // this one is actually on the left panel, not $pane.
  $pane.parent().find('.nypl-link a').attr('href', library_url);
  $('.nypl-logo a').attr('href', library_url);

  var canonicalUrl = getCanonicalUrlForPhoto(photo_id);

  (async () => {
    const ocr = await getFeedbackText(backId(photo_id));
    var text = ocr ? ocr.text : info.text;
    var ocr_url = '/ocr.html#' + photo_id,
        hasBack = photo_id.match('[0-9]f');

    if (text) {
      var $text = $pane.find('.text');
      $text.text(text.replace(/\n*$/, ''));
      $text.append($('<i>&nbsp; &nbsp; Typos? Help <a target=_blank href>fix them</a>.</i>'));
      $text.find('a').attr('href', ocr_url);
    } else if (hasBack) {
      var $more = $pane.find('.more-on-back');
      $more.find('a.ocr-tool').attr('href', ocr_url);
      $more.find('a.nypl').attr('href', library_url);
      $more.show();
    }
  })().catch(e => {
    console.error(e);
  });

  if (typeof(FB) != 'undefined') {
    var $comments = $pane.find('.comments');
    var width = $comments.parent().width();
    $comments.empty().append(
        $('<fb:comments data-numposts="5" data-colorscheme="light"/>')
            .attr('data-width', width)
            .attr('data-href', canonicalUrl)
            .attr('data-version', 'v2.3'))
    FB.XFBML.parse($comments.get(0));
  }

  // Social links
  var client = new ZeroClipboard($pane.find('.copy-link'));
  client.on('ready', function() {
    client.on('copy', function(event) {
      var clipboard = event.clipboardData;
      clipboard.setData('text/plain', window.location.href);
    });
    client.on( 'aftercopy', function( event ) {
      var $btn = $(event.target);
      $btn.css({width: $btn.get(0).offsetWidth}).addClass('clicked').text('Copied!');
    });
  });

  // Some browser plugins block twitter
  if (typeof(twttr) != 'undefined') {
    twttr.ready(({widgets}) => {
      widgets.createShareButton(
        document.location.href,
        $pane.find('.tweet').get(0), {
          count: 'none',
          text: (info.original_title || info.title) + ' - ' + info.date,
          via: 'Old_NYC @NYPL'
        });
    });
  }

  if (typeof(FB) != 'undefined') {
    var $fb_holder = $pane.find('.facebook-holder');
    $fb_holder.empty().append($('<fb:like>').attr({
        'href': canonicalUrl,
        'layout': 'button',
        'action': 'like',
        'show_faces': 'false',
        'share': 'true'
      }));
    FB.XFBML.parse($fb_holder.get(0));
  }

  // Scrolling the panel shouldn't scroll the whole grid.
  // See http://stackoverflow.com/a/10514680/388951
  $pane.off("mousewheel").on("mousewheel", function(event) {
    var height = $pane.height(),
        scrollHeight = $pane.get(0).scrollHeight;
    var blockScrolling = this.scrollTop === scrollHeight - height &&
                         event.deltaY < 0 || this.scrollTop === 0 &&
                         event.deltaY > 0;
    return !blockScrolling;
  });
}

function photoIdFromATag(a: Element) {
  return $(a).attr('href').replace('/#', '');
}

export function getPopularPhotoIds() {
  return $('.popular-photo:visible a').map(function(_, a) {
    return photoIdFromATag(a);
  }).toArray();
}

// User selected a photo in the "popular" grid. Update the static map.
function updateStaticMapsUrl(photo_id: string) {
  findLatLonForPhoto(photo_id, (lat_lon) => {
    let key = 'New York City';
    if (lat_lon) key = lat_lon;
    $('#preview-map').attr('src', makeStaticMapsUrl(key));
  });
}

export function fillPopularImagesPanel() {
  // Rotate the images daily.
  var elapsedMs = new Date().getTime() - new Date('2015/12/15').getTime(),
      elapsedDays = Math.floor(elapsedMs / 86400 / 1000),
      shift = elapsedDays % popular_photos.length;
  var shownPhotos = popular_photos.slice(shift).concat(popular_photos.slice(0, shift));

  var makePanel = function(row: PopularPhoto) {
    var $panel = $('#popular-photo-template').clone().removeAttr('id');
    $panel.find('a').attr('href', '#' + row.id);
    $panel.find('img')
        .attr('border', '0')  // For IE8
        .attr('data-src', expandedImageUrl(row.id))
        .attr('height', row.height);
    $panel.find('.desc').text(row.desc);
    $panel.find('.loc').text(row.loc);
    if (row.date) $panel.find('.date').text(' (' + row.date + ')');
    return $panel.get(0);
  };

  var popularPhotos = $.map(shownPhotos, makePanel);
  $('#popular').append($(popularPhotos).show());
  $(popularPhotos).appear({force_process:true});
  $('#popular').on('appear', '.popular-photo', function() {
    var $img = $(this).find('img[data-src]');
    loadDeferredImage($img.get(0));
  });
}

function loadDeferredImage(img: HTMLElement) {
  var $img = $(img);
  if ($img.attr('src')) return;
  $(img)
    .attr('src', $(img).attr('data-src'))
    .removeAttr('data-src');
}

function hidePopular() {
  $('#popular').hide();
  $('.popular-link').show();
}

function showPopular() {
  $('#popular').show();
  $('.popular-link').hide();
  $('#popular').appear({force_process: true});
}

export function showAbout() {
  hideExpanded();
  $('#about-page').show();
  // Hack! There's probably a way to do this with CSS
  var $container = $('#about-page .container');
  var w = $container.width();
  var mw = parseInt($container.css('max-width'), 0);
  if (w < mw) {
    $container.css('margin-left', '-' + (w / 2) + 'px');
  }
}

export function hideAbout() {
  $('#about-page').hide();
}

/*
// See http://stackoverflow.com/a/30112044/388951
$.fn.scrollGuard = function() {
  return this.on('mousewheel', function() {
    var scrollHeight = this.scrollHeight,
        height = $(this).height();
    var blockScrolling = this.scrollTop === scrollHeight - height && event.deltaY < 0 || this.scrollTop === 0 && event.deltaY > 0;
    return !blockScrolling;
  });
};
*/

$(function() {
  // Clicks on the background or "exit" button should leave the slideshow.
  $(document).on('click', '#expanded .curtains, #expanded .exit', function() {
    hideExpanded();
    $(window).trigger('hideGrid');
  });
  $('#grid-container, #expanded .header').on('click', function(e) {
    if (e.target == this || $(e.target).is('.og-grid')) {
      hideExpanded();
      $(window).trigger('hideGrid');
    }
  });

  // Fill in the expanded preview pane.
  $('#grid-container').on('og-fill', 'li', function(e, div) {
    var id = $(this).data('image-id');
    $(div).empty().append(
        $('#image-details-template').clone().removeAttr('id').show());
    $(div).parent().find('.og-details-left').empty().append(
        $('#image-details-left-template').clone().removeAttr('id').show());
    fillPhotoPane(id, $(div));

    var g = $('#expanded').data('grid-key');
    if (g == 'pop') {
      updateStaticMapsUrl(id);
    }
  })
  .on('click', '.og-fullimg > img', function() {
    var photo_id = $('#grid-container').expandableGrid('selectedId');
    const info = infoForPhotoId(photo_id);
    const url = libraryUrl(photo_id, info.nypl_url);
    window.open(url, '_blank');
  });

  $('#grid-container').on('click', '.rotate-image-button', function(e) {
    e.preventDefault();
    var $img = $(this).closest('li').find('.og-fullimg > img');
    var currentRotation = $img.data('rotate') || 0;
    currentRotation += 90;
    $img
      .css('transform', 'rotate(' + currentRotation + 'deg)')
      .data('rotate', currentRotation);

    var photo_id = $('#grid-container').expandableGrid('selectedId');
    ga('send', 'event', 'link', 'rotate', {
      'page': '/#' + photo_id + '(' + currentRotation + ')'
    });
    sendFeedback(photo_id, 'rotate', {
      'rotate': currentRotation,
      'original': infoForPhotoId(photo_id).rotation || null
    });
  }).on('click', '.feedback-button', function(e) {
    e.preventDefault();
    $('#grid-container .details').fadeOut();
    $('#grid-container .feedback').fadeIn();
  }).on('click', 'a.back', function(e) {
    e.preventDefault();
    $('#grid-container .feedback').fadeOut();
    $('#grid-container .details').fadeIn();
  });
  $(document).on('keyup', 'input, textarea', function(e) { e.stopPropagation(); });

  $('.popular-photo').on('click', 'a', function(e) {
    e.preventDefault();
    var selectedPhotoId = photoIdFromATag(this);

    loadInfoForLatLon('pop').done(function(photoIds) {
      showExpanded('pop', photoIds, selectedPhotoId);
      $(window).trigger('showGrid', 'pop');
      $(window).trigger('openPreviewPanel');
      $(window).trigger('showPhotoPreview', selectedPhotoId);
    }).fail(function() {
    });
  });

  // ... it's annoying that we have to do this. jquery.appear.js should work!
  $('#popular').on('scroll', function() {
    $(this).appear({force_process: true});
  });

  // Show/hide popular images
  $('#popular .close').on('click', function() {
    setCookie('nopop', '1');
    hidePopular();
  });
  $('.popular-link a').on('click', function(e) {
    showPopular();
    deleteCookie('nopop');
    e.preventDefault();
  });
  if (document.cookie.indexOf('nopop=') >= 0) {
    hidePopular();
  }

  // Display the about page on top of the map.
  $('#about a').on('click', function(e) {
    e.preventDefault();
    showAbout();
  });
  $('#about-page .curtains, #about-page .exit').on('click', hideAbout);

  // Record feedback on images. Can have a parameter or not.
  const thanks = function(button: HTMLElement) {
    return function() { $(button).text('Thanks!'); };
  };
  $('#grid-container').on('click', '.feedback button[feedback]', function() {
    const $button = $(this);
    let value: boolean | string = true;
    if ($button.attr('feedback-param')) {
      var $input = $button.siblings('input, textarea');
      value = $input.val();
      if (value == '') return;
      $input.prop('disabled', true);
    }
    $button.prop('disabled', true);
    const photo_id = $('#grid-container').expandableGrid('selectedId');
    const type = $button.attr('feedback') as FeedbackType;
    const obj = {
      [type]: value,
    };
    sendFeedback(photo_id, type, obj).then(thanks($button.get(0)));
  });

  $('#grid-container').on('og-select', 'li', function() {
    var photo_id = $(this).data('image-id')
    $(window).trigger('showPhotoPreview', photo_id);
  }).on('og-deselect', function() {
    $(window).trigger('closePreviewPanel');
  }).on('og-openpreview', function() {
    $(window).trigger('openPreviewPanel');
  });

  $('#time-slider').slider({
    range: true,
    min: 1800,
    max: 2000,
    values: year_range,
    slide: (event, ui) => {
      const [a, b] = ui.values;
      updateYears(a, b);
    },
    stop: (event, ui) => {
      const [a, b] = ui.values;
      ga('send', 'event', 'link', 'time-slider', {
        'page': `/#${a}–${b}`
      });
    }
  });

  $('#time-range-summary').on('click', () => {
    $('#time-range').toggle();
  });

  $('#slideshow-all').on('click', () => {
    updateYears(1800, 2000);
    $('#time-slider').slider({
      values: year_range
    });
    const lat_lon = $('#expanded').data('grid-key');
    ga('send', 'event', 'link', 'time-slider-clear');
    hideExpanded();
    displayInfoForLatLon(lat_lon);
  });
});
