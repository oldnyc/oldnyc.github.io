/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _viewer = __webpack_require__(1);

	__webpack_require__(7);

	__webpack_require__(10);

	$(function () {
	  (0, _viewer.fillPopularImagesPanel)();
	  (0, _viewer.initialize_map)();
	});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.mapPromise = exports.map = exports.lat_lon_to_marker = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // @ts-check


	exports.countPhotos = countPhotos;
	exports.selectMarker = selectMarker;
	exports.updateYears = updateYears;
	exports.initialize_map = initialize_map;
	exports.parseLatLon = parseLatLon;
	exports.createMarker = createMarker;
	exports.showExpanded = showExpanded;
	exports.hideExpanded = hideExpanded;
	exports.getPopularPhotoIds = getPopularPhotoIds;
	exports.fillPopularImagesPanel = fillPopularImagesPanel;
	exports.showAbout = showAbout;
	exports.hideAbout = hideAbout;

	var _photoInfo = __webpack_require__(2);

	var _mapStyles = __webpack_require__(3);

	var _social = __webpack_require__(4);

	var _feedback = __webpack_require__(5);

	var _popularPhotos = __webpack_require__(6);

	var markers = [];
	var marker_icons = [];
	var lat_lon_to_marker = exports.lat_lon_to_marker = {};
	var selected_marker_icons = [];
	var selected_marker, selected_icon;
	var year_range = [1800, 2000];

	/** @type google.maps.Map | undefined */
	var map = exports.map = void 0;
	var mapPromise = exports.mapPromise = $.Deferred();

	// TODO: inline image source into popular-photos.js and get rid of this.
	function expandedImageUrl(photo_id) {
	  return 'http://oldnyc-assets.nypl.org/600px/' + photo_id + '.jpg';
	}

	// lat_lon is a "lat,lon" string.
	function makeStaticMapsUrl(lat_lon) {
	  return 'http://maps.googleapis.com/maps/api/staticmap?center=' + lat_lon + '&zoom=15&size=150x150&key=AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA&maptype=roadmap&markers=color:red%7C' + lat_lon + '&style=' + _mapStyles.STATIC_MAP_STYLE;
	}

	function isFullTimeRange(yearRange) {
	  return yearRange[0] === 1800 && yearRange[1] === 2000;
	}

	// A photo is in the date range if any dates mentioned in it are in the range.
	// For example, "1927; 1933; 1940" is in the range [1920, 1930].
	function isPhotoInDateRange(info, yearRange) {
	  if (isFullTimeRange(yearRange)) return true;

	  var _yearRange = _slicedToArray(yearRange, 2),
	      first = _yearRange[0],
	      last = _yearRange[1];

	  for (var i = 0; i < info.years.length; i++) {
	    var year = info.years[i];
	    if (year && year >= first && year <= last) return true;
	  }
	  return false;
	}

	/** @param {{[year: string]: number}} yearToCounts */
	function countPhotos(yearToCounts) {
	  if (isFullTimeRange(year_range)) {
	    // This includes undated photos.
	    return Object.values(yearToCounts || {}).reduce(function (a, b) {
	      return a + b;
	    }, 0);
	  } else {
	    var _year_range = year_range,
	        _year_range2 = _slicedToArray(_year_range, 2),
	        first = _year_range2[0],
	        last = _year_range2[1];

	    return Object.entries(yearToCounts || {}).filter(function (_ref) {
	      var _ref2 = _slicedToArray(_ref, 1),
	          y = _ref2[0];

	      return y > first && y <= last;
	    }).map(function (_ref3) {
	      var _ref4 = _slicedToArray(_ref3, 2),
	          c = _ref4[1];

	      return c;
	    }).reduce(function (a, b) {
	      return a + b;
	    }, 0);
	  }
	}

	// Make the given marker the currently selected marker.
	// This is purely UI code, it doesn't touch anything other than the marker.
	function selectMarker(marker, yearToCounts) {
	  var numPhotos = countPhotos(yearToCounts);
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

	function updateYears(firstYear, lastYear) {
	  year_range = [firstYear, lastYear];
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = Object.entries(lat_lon_to_marker)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var _step$value = _slicedToArray(_step.value, 2),
	          lat_lon = _step$value[0],
	          marker = _step$value[1];

	      var count = countPhotos(lat_lons[lat_lon]);
	      if (count) {
	        marker.setIcon(marker_icons[Math.min(count, 100)]);
	        marker.setVisible(true);
	      } else {
	        marker.setVisible(false);
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  addNewlyVisibleMarkers();
	  $('#time-range-labels').text(firstYear + '\u2013' + lastYear);
	}

	// The callback gets fired when the info for all lat/lons at this location
	// become available (i.e. after the /info RPC returns).
	function displayInfoForLatLon(lat_lon, marker, opt_selectCallback) {
	  if (marker) selectMarker(marker, lat_lons[lat_lon]);

	  (0, _photoInfo.loadInfoForLatLon)(lat_lon).done(function (photoIds) {
	    var selectedId = null;
	    if (photoIds.length <= 10) {
	      selectedId = photoIds[0];
	    }
	    showExpanded(lat_lon, photoIds, selectedId);
	    if (opt_selectCallback && selectedId) {
	      opt_selectCallback(selectedId);
	    }
	  }).fail(function () {});
	}

	function handleClick(e) {
	  var lat_lon = e.latLng.lat().toFixed(6) + ',' + e.latLng.lng().toFixed(6);
	  var marker = lat_lon_to_marker[lat_lon];
	  displayInfoForLatLon(lat_lon, marker, function (photo_id) {
	    $(window).trigger('openPreviewPanel');
	    $(window).trigger('showPhotoPreview', photo_id);
	  });
	  $(window).trigger('showGrid', lat_lon);
	}

	function initialize_map() {
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
	    styles: _mapStyles.MAP_STYLE
	  };

	  exports.map = map = new google.maps.Map($('#map').get(0), opts);

	  // This shoves the navigation bits down by a CSS-specified amount
	  // (see the .spacer rule). This is surprisingly hard to do.
	  var map_spacer = $('<div/>').append($('<div/>').addClass('spacer')).get(0);
	  map_spacer.index = -1;
	  map.controls[google.maps.ControlPosition.TOP_LEFT].push(map_spacer);

	  // The OldSF UI just gets in the way of Street View.
	  // Even worse, it blocks the "exit" button!
	  var streetView = map.getStreetView();
	  google.maps.event.addListener(streetView, 'visible_changed', function () {
	    $('.streetview-hide').toggle(!streetView.getVisible());
	  });

	  // Create marker icons for each number.
	  marker_icons.push(null); // it's easier to be 1-based.
	  selected_marker_icons.push(null);
	  for (var i = 0; i < 100; i++) {
	    var num = i + 1;
	    var size = num == 1 ? 9 : 13;
	    var selectedSize = num == 1 ? 15 : 21;
	    marker_icons.push(new google.maps.MarkerImage('images/sprite-2014-08-29.png', new google.maps.Size(size, size), new google.maps.Point(i % 10 * 39, Math.floor(i / 10) * 39), new google.maps.Point((size - 1) / 2, (size - 1) / 2)));
	    selected_marker_icons.push(new google.maps.MarkerImage('images/selected-2014-08-29.png', new google.maps.Size(selectedSize, selectedSize), new google.maps.Point(i % 10 * 39, Math.floor(i / 10) * 39), new google.maps.Point((selectedSize - 1) / 2, (selectedSize - 1) / 2)));
	  }

	  // Adding markers is expensive -- it's important to defer this when possible.
	  var idleListener = google.maps.event.addListener(map, 'idle', function () {
	    google.maps.event.removeListener(idleListener);
	    addNewlyVisibleMarkers();
	    mapPromise.resolve(map);
	  });

	  google.maps.event.addListener(map, 'bounds_changed', function () {
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

	function parseLatLon(lat_lon) {
	  var ll = lat_lon.split(",");
	  return new google.maps.LatLng(parseFloat(ll[0]), parseFloat(ll[1]));
	}

	function createMarker(lat_lon, latLng) {
	  var count = countPhotos(lat_lons[lat_lon]);
	  if (!count) {
	    return;
	  }
	  var marker = new google.maps.Marker({
	    position: latLng,
	    map: map,
	    flat: true,
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
	function showExpanded(key, photo_ids, opt_selected_id) {
	  hideAbout();
	  map.set('keyboardShortcuts', false);
	  $('#expanded').show().data('grid-key', key);
	  $('.location').text((0, _photoInfo.nameForLatLon)(key));
	  if (isFullTimeRange(year_range)) {
	    $('#filtered-slideshow').hide();
	  } else {
	    var _year_range3 = year_range,
	        _year_range4 = _slicedToArray(_year_range3, 2),
	        first = _year_range4[0],
	        last = _year_range4[1];

	    $('#filtered-slideshow').show();
	    $('#slideshow-filter-first').text(first);
	    $('#slideshow-filter-last').text(last);
	  }
	  var images = $.map(photo_ids, function (photo_id) {
	    var info = (0, _photoInfo.infoForPhotoId)(photo_id);
	    if (!isPhotoInDateRange(info, year_range)) return null;
	    return $.extend({
	      id: photo_id,
	      largesrc: info.image_url,
	      src: info.thumb_url,
	      width: 600, // these are fallbacks
	      height: 400
	    }, info);
	  });
	  images = images.filter(function (image) {
	    return image !== null;
	  });
	  $('#preview-map').attr('src', makeStaticMapsUrl(key));
	  $('#grid-container').expandableGrid({
	    rowHeight: 200,
	    speed: 200 /* ms for transitions */
	  }, images);
	  if (opt_selected_id) {
	    $('#grid-container').expandableGrid('select', opt_selected_id);
	  }
	}

	function hideExpanded() {
	  $('#expanded').hide();
	  $(document).unbind('keyup');
	  map.set('keyboardShortcuts', true);
	}

	// This fills out details for either a thumbnail or the expanded image pane.
	function fillPhotoPane(photo_id, $pane) {
	  // $pane is div.og-details
	  // This could be either a thumbnail on the right-hand side or an expanded
	  // image, front and center.
	  $('.description', $pane).html((0, _photoInfo.descriptionForPhotoId)(photo_id));

	  var info = (0, _photoInfo.infoForPhotoId)(photo_id);
	  var library_url = (0, _photoInfo.libraryUrlForPhotoId)(photo_id);

	  // this one is actually on the left panel, not $pane.
	  $pane.parent().find('.nypl-link a').attr('href', library_url);
	  $('.nypl-logo a').attr('href', library_url);

	  var canonicalUrl = (0, _social.getCanonicalUrlForPhoto)(photo_id);

	  // OCR'd text
	  (0, _feedback.getFeedbackText)((0, _photoInfo.backId)(photo_id)).done(function (ocr) {
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
	  });

	  if (typeof FB != 'undefined') {
	    var $comments = $pane.find('.comments');
	    var width = $comments.parent().width();
	    $comments.empty().append($('<fb:comments data-numposts="5" data-colorscheme="light"/>').attr('data-width', width).attr('data-href', canonicalUrl).attr('data-version', 'v2.3'));
	    FB.XFBML.parse($comments.get(0));
	    console.log(canonicalUrl);
	  }

	  // Social links
	  var client = new ZeroClipboard($pane.find('.copy-link'));
	  client.on('ready', function () {
	    client.on('copy', function (event) {
	      var clipboard = event.clipboardData;
	      clipboard.setData('text/plain', window.location.href);
	    });
	    client.on('aftercopy', function (event) {
	      var $btn = $(event.target);
	      $btn.css({ width: $btn.get(0).offsetWidth }).addClass('clicked').text('Copied!');
	    });
	  });

	  // Some browser plugins block twitter
	  if (typeof twttr != 'undefined') {
	    twttr.ready(function (_ref5) {
	      var widgets = _ref5.widgets;

	      widgets.createShareButton(document.location.href, $pane.find('.tweet').get(0), {
	        count: 'none',
	        text: (info.original_title || info.title) + ' - ' + info.date,
	        via: 'Old_NYC @NYPL'
	      });
	    });
	  }

	  if (typeof FB != 'undefined') {
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
	  $pane.off("mousewheel").on("mousewheel", function (event) {
	    var height = $pane.height(),
	        scrollHeight = $pane.get(0).scrollHeight;
	    var blockScrolling = this.scrollTop === scrollHeight - height && event.deltaY < 0 || this.scrollTop === 0 && event.deltaY > 0;
	    return !blockScrolling;
	  });
	}

	function photoIdFromATag(a) {
	  return $(a).attr('href').replace('/#', '');
	}

	function getPopularPhotoIds() {
	  return $('.popular-photo:visible a').map(function (_, a) {
	    return photoIdFromATag(a);
	  }).toArray();
	}

	// User selected a photo in the "popular" grid. Update the static map.
	function updateStaticMapsUrl(photo_id) {
	  var key = 'New York City';
	  var lat_lon = (0, _photoInfo.findLatLonForPhoto)(photo_id);
	  if (lat_lon) key = lat_lon;
	  $('#preview-map').attr('src', makeStaticMapsUrl(key));
	}

	function fillPopularImagesPanel() {
	  // Rotate the images daily.
	  var elapsedMs = new Date().getTime() - new Date('2015/12/15').getTime(),
	      elapsedDays = Math.floor(elapsedMs / 86400 / 1000),
	      shift = elapsedDays % _popularPhotos.popular_photos.length;
	  var shownPhotos = _popularPhotos.popular_photos.slice(shift).concat(_popularPhotos.popular_photos.slice(0, shift));

	  var makePanel = function makePanel(row) {
	    var $panel = $('#popular-photo-template').clone().removeAttr('id');
	    $panel.find('a').attr('href', '#' + row.id);
	    $panel.find('img').attr('border', '0') // For IE8
	    .attr('data-src', expandedImageUrl(row.id)).attr('height', row.height);
	    $panel.find('.desc').text(row.desc);
	    $panel.find('.loc').text(row.loc);
	    if (row.date) $panel.find('.date').text(' (' + row.date + ')');
	    return $panel.get(0);
	  };

	  var popularPhotos = $.map(shownPhotos, makePanel);
	  $('#popular').append($(popularPhotos).show());
	  $(popularPhotos).appear({ force_process: true });
	  $('#popular').on('appear', '.popular-photo', function () {
	    var $img = $(this).find('img[data-src]');
	    loadDeferredImage($img.get(0));
	  });
	}

	function loadDeferredImage(img) {
	  var $img = $(img);
	  if ($img.attr('src')) return;
	  $(img).attr('src', $(img).attr('data-src')).removeAttr('data-src');
	}

	function hidePopular() {
	  $('#popular').hide();
	  $('.popular-link').show();
	}
	function showPopular() {
	  $('#popular').show();
	  $('.popular-link').hide();
	  $('#popular').appear({ force_process: true });
	}

	function showAbout() {
	  hideExpanded();
	  $('#about-page').show();
	  // Hack! There's probably a way to do this with CSS
	  var $container = $('#about-page .container');
	  var w = $container.width();
	  var mw = parseInt($container.css('max-width'), 0);
	  if (w < mw) {
	    $container.css('margin-left', '-' + w / 2 + 'px');
	  }
	}
	function hideAbout() {
	  $('#about-page').hide();
	}

	// See http://stackoverflow.com/a/30112044/388951
	$.fn.scrollGuard = function () {
	  return this.on('mousewheel', function () {
	    var scrollHeight = this.scrollHeight,
	        height = $(this).height();
	    var blockScrolling = this.scrollTop === scrollHeight - height && event.deltaY < 0 || this.scrollTop === 0 && event.deltaY > 0;
	    return !blockScrolling;
	  });
	};

	$(function () {
	  // Clicks on the background or "exit" button should leave the slideshow.
	  $(document).on('click', '#expanded .curtains, #expanded .exit', function () {
	    hideExpanded();
	    $(window).trigger('hideGrid');
	  });
	  $('#grid-container, #expanded .header').on('click', function (e) {
	    if (e.target == this || $(e.target).is('.og-grid')) {
	      hideExpanded();
	      $(window).trigger('hideGrid');
	    }
	  });

	  // Fill in the expanded preview pane.
	  $('#grid-container').on('og-fill', 'li', function (e, div) {
	    var id = $(this).data('image-id');
	    $(div).empty().append($('#image-details-template').clone().removeAttr('id').show());
	    $(div).parent().find('.og-details-left').empty().append($('#image-details-left-template').clone().removeAttr('id').show());
	    fillPhotoPane(id, $(div));

	    var g = $('#expanded').data('grid-key');
	    if (g == 'pop') {
	      updateStaticMapsUrl(id);
	    }
	  }).on('click', '.og-fullimg > img', function () {
	    var photo_id = $('#grid-container').expandableGrid('selectedId');
	    window.open((0, _photoInfo.libraryUrlForPhotoId)(photo_id), '_blank');
	  });

	  $('#grid-container').on('click', '.rotate-image-button', function (e) {
	    e.preventDefault();
	    var $img = $(this).closest('li').find('.og-fullimg > img');
	    var currentRotation = $img.data('rotate') || 0;
	    currentRotation += 90;
	    $img.css('transform', 'rotate(' + currentRotation + 'deg)').data('rotate', currentRotation);

	    var photo_id = $('#grid-container').expandableGrid('selectedId');
	    ga('send', 'event', 'link', 'rotate', {
	      'page': '/#' + photo_id + '(' + currentRotation + ')'
	    });
	    (0, _feedback.sendFeedback)(photo_id, 'rotate', {
	      'rotate': currentRotation,
	      'original': (0, _photoInfo.infoForPhotoId)(photo_id).rotation || null
	    });
	  }).on('click', '.feedback-button', function (e) {
	    e.preventDefault();
	    $('#grid-container .details').fadeOut();
	    $('#grid-container .feedback').fadeIn();
	  }).on('click', 'a.back', function (e) {
	    e.preventDefault();
	    $('#grid-container .feedback').fadeOut();
	    $('#grid-container .details').fadeIn();
	  });
	  $(document).on('keyup', 'input, textarea', function (e) {
	    e.stopPropagation();
	  });

	  $('.popular-photo').on('click', 'a', function (e) {
	    e.preventDefault();
	    var selectedPhotoId = photoIdFromATag(this);

	    (0, _photoInfo.loadInfoForLatLon)('pop').done(function (photoIds) {
	      showExpanded('pop', photoIds, selectedPhotoId);
	      $(window).trigger('showGrid', 'pop');
	      $(window).trigger('openPreviewPanel');
	      $(window).trigger('showPhotoPreview', selectedPhotoId);
	    }).fail(function () {});
	  });

	  // ... it's annoying that we have to do this. jquery.appear.js should work!
	  $('#popular').on('scroll', function () {
	    $(this).appear({ force_process: true });
	  });

	  // Show/hide popular images
	  $('#popular .close').on('click', function () {
	    (0, _feedback.setCookie)('nopop', '1');
	    hidePopular();
	  });
	  $('.popular-link a').on('click', function (e) {
	    showPopular();
	    (0, _feedback.deleteCookie)('nopop');
	    e.preventDefault();
	  });
	  if (document.cookie.indexOf('nopop=') >= 0) {
	    hidePopular();
	  }

	  // Display the about page on top of the map.
	  $('#about a').on('click', function (e) {
	    e.preventDefault();
	    showAbout();
	  });
	  $('#about-page .curtains, #about-page .exit').on('click', hideAbout);

	  // Record feedback on images. Can have a parameter or not.
	  var thanks = function thanks(button) {
	    return function () {
	      $(button).text('Thanks!');
	    };
	  };
	  $('#grid-container').on('click', '.feedback button[feedback]', function () {
	    var $button = $(this);
	    var value = true;
	    if ($button.attr('feedback-param')) {
	      var $input = $button.siblings('input, textarea');
	      value = $input.val();
	      if (value == '') return;
	      $input.prop('disabled', true);
	    }
	    $button.prop('disabled', true);
	    var photo_id = $('#grid-container').expandableGrid('selectedId');
	    var type = $button.attr('feedback');
	    var obj = {};obj[type] = value;
	    (0, _feedback.sendFeedback)(photo_id, type, obj).then(thanks($button.get(0)));
	  });

	  $('#grid-container').on('og-select', 'li', function () {
	    var photo_id = $(this).data('image-id');
	    $(window).trigger('showPhotoPreview', photo_id);
	  }).on('og-deselect', function () {
	    $(window).trigger('closePreviewPanel');
	  }).on('og-openpreview', function () {
	    $(window).trigger('openPreviewPanel');
	  });

	  $('#time-slider').slider({
	    range: true,
	    min: 1800,
	    max: 2000,
	    values: year_range,
	    slide: function slide(event, ui) {
	      var _ui$values = _slicedToArray(ui.values, 2),
	          a = _ui$values[0],
	          b = _ui$values[1];

	      updateYears(a, b);
	    },
	    stop: function stop(event, ui) {
	      var _ui$values2 = _slicedToArray(ui.values, 2),
	          a = _ui$values2[0],
	          b = _ui$values2[1];

	      ga('send', 'event', 'link', 'time-slider', {
	        'page': '/#' + a + '\u2013' + b
	      });
	    }
	  });

	  $('#time-range-summary').on('click', function () {
	    $('#time-range').toggle();
	  });

	  $('#slideshow-all').on('click', function () {
	    updateYears(1800, 2000);
	    $('#time-slider').slider({
	      values: year_range
	    });
	    var lat_lon = $('#expanded').data('grid-key');
	    ga('send', 'event', 'link', 'time-slider-clear');
	    hideExpanded();
	    displayInfoForLatLon(lat_lon);
	  });
	});

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.loadInfoForLatLon = loadInfoForLatLon;
	exports.infoForPhotoId = infoForPhotoId;
	exports.descriptionForPhotoId = descriptionForPhotoId;
	exports.libraryUrlForPhotoId = libraryUrlForPhotoId;
	exports.backId = backId;
	exports.backOfCardUrlForPhotoId = backOfCardUrlForPhotoId;
	exports.nameForLatLon = nameForLatLon;
	exports.findLatLonForPhoto = findLatLonForPhoto;
	// @ts-check
	// This file manages all the photo information.
	// Some of this comes in via lat-lons.js.
	// Some is requested via XHR.

	// Maps photo_id -> { title: ..., date: ..., library_url: ... }
	var photo_id_to_info = {};

	var SITE = '';
	var JSON_BASE = SITE + '/by-location';

	// The callback is called with the photo_ids that were just loaded, after the
	// UI updates.  The callback may assume that infoForPhotoId() will return data
	// for all the newly-available photo_ids.
	function loadInfoForLatLon(lat_lon) {
	  var url;
	  if (lat_lon == 'pop') {
	    url = SITE + '/popular.json';
	  } else {
	    url = JSON_BASE + '/' + lat_lon.replace(',', '') + '.json';
	  }

	  return $.getJSON(url).then(function (response_data) {
	    // Add these values to the cache.
	    $.extend(photo_id_to_info, response_data);
	    var photo_ids = [];
	    for (var k in response_data) {
	      photo_ids.push(k);
	    }
	    if (lat_lon != 'pop') {
	      lat_lon_to_name[lat_lon] = extractName(response_data);
	    }
	    return photo_ids;
	  });
	}

	// Returns a {title: ..., date: ..., library_url: ...} object.
	// If there's no information about the photo yet, then the values are all set
	// to the empty string.
	function infoForPhotoId(photo_id) {
	  return photo_id_to_info[photo_id] || { title: '', date: '', library_url: '' };
	}

	// Would it make more sense to incorporate these into infoForPhotoId?
	function descriptionForPhotoId(photo_id) {
	  var info = infoForPhotoId(photo_id);
	  var desc = info.title;
	  if (desc) desc += ' ';
	  var date = info.date.replace(/n\.d\.?/, 'No Date');
	  if (!date) date = 'No Date';
	  desc += date;
	  return desc;
	}

	function libraryUrlForPhotoId(photo_id) {
	  return 'http://digitalcollections.nypl.org/items/image_id/' + photo_id.replace(/-[a-z]$/, '');
	}

	function backId(photo_id) {
	  return photo_id.replace('f', 'b').replace(/-[a-z]$/, '');
	}

	function backOfCardUrlForPhotoId(photo_id) {
	  return 'http://images.nypl.org/?id=' + backId(photo_id) + '&t=w';
	}

	var lat_lon_to_name = {};

	// Does this lat_lon have a name, e.g. "Manhattan: 14th Street - 8th Avenue"?
	function nameForLatLon(lat_lon) {
	  var v = lat_lon_to_name[lat_lon] || '';
	  return v.replace(/: | - | & /g, '\n');
	}

	function extractName(lat_lon_json) {
	  // if any entries have an original_title, it's got to be a pure location.
	  for (var k in lat_lon_json) {
	    var v = lat_lon_json[k];
	    if (v.original_title) return v.original_title;
	  }
	}

	function findLatLonForPhoto(photo_id, cb) {
	  var id4 = photo_id.slice(0, 4);
	  $.ajax({
	    dataType: "json",
	    url: '/id4-to-location/' + id4 + '.json',
	    success: function success(id_to_latlon) {
	      cb(id_to_latlon[photo_id]);
	    }
	  });
	}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// @ts-check

	// Styles for Google Maps. These de-emphasize features on the map.
	var MAP_STYLE = exports.MAP_STYLE = [
	// to remove buildings
	{ "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "poi", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "transit", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "administrative", "stylers": [{ "visibility": "simplified" }] },
	// end remove buildings
	{
	    "featureType": "administrative",
	    "elementType": "labels",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "administrative.country",
	    "elementType": "geometry.stroke",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "administrative.province",
	    "elementType": "geometry.stroke",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "landscape",
	    "elementType": "geometry",
	    "stylers": [{
	        "visibility": "on"
	    }, {
	        "color": "#e3e3e3"
	    }]
	}, {
	    "featureType": "landscape.natural",
	    "elementType": "labels",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "poi",
	    "elementType": "all",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}, {
	    "featureType": "road",
	    "elementType": "all",
	    "stylers": [{
	        "color": "#cccccc"
	    }]
	}, {
	    "featureType": "water",
	    "elementType": "geometry",
	    "stylers": [{
	        "color": "#FFFFFF"
	    }]
	}, {
	    "featureType": "road",
	    "elementType": "labels",
	    "stylers": [{
	        "color": "#94989C"
	    }, {
	        "visibility": "simplified"
	    }]
	}, {
	    "featureType": "water",
	    "elementType": "labels",
	    "stylers": [{
	        "visibility": "off"
	    }]
	}];

	function buildStaticStyle(styleStruct) {
	    var style = "";
	    for (var i = 0; i < styleStruct.length; i++) {
	        var s = styleStruct[i];
	        var strs = [];
	        if (s.featureType != null) strs.push("feature:" + s.featureType);
	        if (s.elementType != null) strs.push("element:" + s.elementType);
	        if (s.stylers != null) {
	            for (var j = 0; j < s.stylers.length; j++) {
	                for (var key in s.stylers[j]) {
	                    strs.push(key + ":" + s.stylers[j][key].replace(/#/, '0x'));
	                }
	            }
	        }
	        var str = "&style=" + strs.join("%7C");
	        style += str;
	    }
	    return style;
	}

	var STATIC_MAP_STYLE = exports.STATIC_MAP_STYLE = buildStaticStyle(MAP_STYLE);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getCanonicalUrlForPhoto = getCanonicalUrlForPhoto;
	exports.getCommentCount = getCommentCount;
	// @ts-check
	function getCanonicalUrlForPhoto(photo_id) {
	  return 'http://www.oldnyc.org/#' + photo_id;
	}

	function getCommentCount(photo_ids) {
	  // There is a batch API:
	  // https://developers.facebook.com/docs/graph-api/making-multiple-requests/
	  return $.get('https://graph.facebook.com/', {
	    'ids': $.map(photo_ids, function (id) {
	      return getCanonicalUrlForPhoto(id);
	    }).join(',')
	  }).then(function (obj) {
	    // obj is something like {url: {'id', 'shares', 'comments'}}
	    // convert it to {id: comments}
	    var newObj = {};
	    $.each(obj, function (url, data) {
	      newObj[url.replace(/.*#/, '')] = data['comments'] || 0;
	    });
	    return newObj;
	  });
	}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.deleteCookie = deleteCookie;
	exports.setCookie = setCookie;
	exports.getCookie = getCookie;
	exports.sendFeedback = sendFeedback;
	exports.getFeedbackText = getFeedbackText;
	// @ts-check
	/**
	 * Common code for recording user feedback.
	 * This is shared between the OldNYC site and the OCR feedback tool.
	 */

	var COOKIE_ID = 'oldnycid';

	var firebaseRef = null;
	// e.g. if we're offline and the firebase script can't load.
	if (typeof Firebase !== 'undefined') {
	  firebaseRef = new Firebase('https://brilliant-heat-1088.firebaseio.com/');
	}

	var userLocation = null;
	$.get('//ipinfo.io', function (response) {
	  userLocation = {
	    ip: response.ip,
	    location: response.country + '-' + response.region + '-' + response.city
	  };
	}, 'jsonp');

	var lastReviewedOcrMsPromise = $.get('/timestamps.json').then(function (data) {
	  return data.ocr_ms;
	});

	function deleteCookie(name) {
	  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	function setCookie(name, value) {
	  document.cookie = name + "=" + value + "; path=/";
	}

	function getCookie(name) {
	  var b;
	  b = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
	  return b ? b.pop() : '';
	}

	// Assign each user a unique ID for tracking repeat feedback.
	var COOKIE = getCookie(COOKIE_ID);
	if (!COOKIE) {
	  COOKIE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0,
	        v = c == 'x' ? r : r & 0x3 | 0x8;
	    return v.toString(16);
	  });
	  setCookie(COOKIE_ID, COOKIE);
	}

	// Record one piece of feedback. Returns a jQuery deferred object.
	function sendFeedback(photo_id, feedback_type, feedback_obj) {
	  ga('send', 'event', 'link', 'feedback', { 'page': '/#' + photo_id });

	  feedback_obj.metadata = {
	    timestamp: Firebase.ServerValue.TIMESTAMP,
	    user_agent: navigator.userAgent,
	    user_ip: userLocation ? userLocation.ip : '',
	    location: userLocation ? userLocation.location : '',
	    cookie: COOKIE
	  };

	  var path = '/feedback/' + photo_id + '/' + feedback_type;

	  var feedbackRef = firebaseRef.child(path);
	  var deferred = $.Deferred();
	  feedbackRef.push(feedback_obj, function (error) {
	    if (error) {
	      console.error('Error pushing', error);
	      deferred.reject(error);
	    } else {
	      deferred.resolve();
	    }
	  });

	  return deferred;
	}

	// Retrieve the most-recent OCR for a backing image.
	// Returns a Deferred object which resolves to
	// { text: string, metadata: { timestamp: number, ... }
	// Resolves with null if there is no OCR text available.
	function getFeedbackText(back_id) {
	  var deferred = $.Deferred();

	  lastReviewedOcrMsPromise.then(function (lastReviewedOcrMs) {
	    firebaseRef.child('/feedback/' + back_id + '/text').orderByKey()
	    // TODO: start with a key corresponding to lastReviewedOcrMs
	    // .limitToLast(1)
	    .once('value', function (feedback) {
	      var chosen = null;
	      feedback.forEach(function (row) {
	        var v = row.val();
	        if (v.metadata.timestamp > lastReviewedOcrMs) {
	          chosen = v; // take the most-recent one
	        }
	      });
	      // if none are chosen then ther's no text or the static site is up-to-date.
	      deferred.resolve(chosen);
	    });
	  });

	  return deferred;
	}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var popular_photos = exports.popular_photos = [{ "date": "1910", "loc": "42nd & 5th ave", "height": 249, "id": "708760f-a", "desc": "Street scene" }, { "date": "1936", "loc": "42nd & 5th ave", "height": 145, "id": "1508783-a", "desc": "Directing traffic and trolley" }, { "date": "1912", "loc": "42nd & 5th ave", "height": 157, "id": "708795f-a", "desc": "Ground level view of street" }, { "date": "1913", "loc": "42nd & 5th ave", "height": 159, "id": "712987f-a", "desc": "Street scene" }, { "date": "1928", "loc": "42nd & 6th Avenue", "height": 246, "id": "713050f-a", "desc": "Street scene" }, { "date": "1933", "loc": "42nd & 6th Avenue", "height": 130, "id": "713043f", "desc": "Under the elevated" }, { "date": "1939", "loc": "42nd & 6th Avenue", "height": 159, "id": "709480f-a", "desc": "Elevated train demolition" }, { "date": "1930s", "loc": "42nd & 6th Avenue", "height": 198, "id": "1558013", "desc": "Street scene" }, { "date": "1936", "loc": "Central Park", "height": 160, "id": "730166f-a", "desc": "Aerial view" }, { "date": "1933", "loc": "Central Park", "height": 133, "id": "718268f-b", "desc": "Roller skating" }, { "date": "1938", "loc": "Central Park", "height": 229, "id": "718346f-a", "desc": "Feeding birds" }, { "date": "", "loc": "Central Park", "height": 298, "id": "718282f-a", "desc": "On the lake" }, { "date": "", "loc": "Central Park", "height": 160, "id": "718194f-a", "desc": "Riding under an arch" }, { "date": "1905", "loc": "Central Park", "height": 154, "id": "718242f-b", "desc": "Ice skaters" }, { "date": "", "loc": "Central Park", "height": 143, "id": "718333f-a", "desc": "Playing croquet" }, { "date": "", "loc": "Central Park", "height": 132, "id": "718280f-a", "desc": "Quiet corner" }, { "date": "1892", "loc": "Central Park", "height": 158, "id": "718272f-a", "desc": "Strolling" }, { "date": "1933", "loc": "Central Park", "height": 133, "id": "718179f-b", "desc": "Aerial View" }, { "date": "1913", "loc": "Central Park", "height": 130, "id": "718284f", "desc": "Schoolboys drilling" }, { "date": "1926", "loc": "Prospect Park", "height": 172, "id": "706346f-a", "desc": "Prospect Park Plaza" }, { "date": "1880", "loc": "Prospect Park", "height": 116, "id": "706348f-b", "desc": "Lake view" }, { "date": "1864", "loc": "Central Park", "height": 168, "id": "718385f-a", "desc": "Rustic arbor" }, { "date": "1892", "loc": "Central Park", "height": 164, "id": "718262f-a", "desc": "Fountain" }, { "date": "1933", "loc": "Roosevelt Island", "height": 158, "id": "732193f-a", "desc": "Welfare (Roosevelt) Island" }, { "date": "1934", "loc": "Brooklyn Bridge", "height": 134, "id": "730718f-c", "desc": "Aerial View" }, { "date": "1932", "loc": "86th & 3rd", "height": 130, "id": "714705f-a", "desc": "Storefronts" }, { "date": "1926", "loc": "Colonial & Nassau", "height": 154, "id": "726358f-c", "desc": "Family on porch" }, { "date": "1939", "loc": "Duane & West", "height": 136, "id": "719363f-a", "desc": "Horse-drawn cart" }, { "date": "1929", "loc": "Weehawken & Christopher", "height": 134, "id": "724321f-b", "desc": "Coca-Cola ad" }, { "date": "", "loc": "George Washington Bridge", "height": 156, "id": "1558509", "desc": "" }, { "date": "1906", "loc": "Bayard & Chrystie", "height": 159, "id": "716608f-a", "desc": "Street scene" }, { "date": "1931", "loc": "5th & 46th", "height": 159, "id": "708851f-a", "desc": "Street scene" }, { "date": "1933", "loc": "Columbus Circle", "height": 155, "id": "719145f-a", "desc": "Tribute to Columbus" }, { "date": "1910", "loc": "Pelham Parkway", "height": 146, "id": "701498f-b", "desc": "At the racetrack" }, { "date": "1936", "loc": "9th & 40th", "height": 129, "id": "732438f-b", "desc": "Food vendors" }, { "date": "1911", "loc": "Poppy Joe Island Beach", "height": 160, "id": "730622f-a", "desc": "Local muskrat hunters" }, { "date": "1890", "loc": "Wallabout Bay", "height": 102, "id": "734085f-a", "desc": "Ship in port" }, { "date": "1933", "loc": "Greenwich Village", "height": 299, "id": "730568f-a", "desc": "Art Exhibit" }, { "date": "1936", "loc": "Battery Park", "height": 134, "id": "716520f-c", "desc": "Aerial view" }, { "date": "1921", "loc": "New Chambers & Madison", "height": 141, "id": "721912f-b", "desc": "Cobblestone" }, { "date": "1918", "loc": "5th & 25th", "height": 242, "id": "731285f-a", "desc": "Victory Arch" }, { "date": "1925", "loc": "Minetta & MacDougal", "height": 168, "id": "721650f-a", "desc": "Alley" }, { "date": "1932", "loc": "Canal & Chrystie", "height": 169, "id": "718806f-a", "desc": "Construction of Sarah Delano Roosevelt Park" }, { "date": "1933", "loc": "Hudson Street", "height": 299, "id": "733360f-c", "desc": "Thanksgiving ragamuffins" }, { "date": "1917", "loc": "Queensborough Bridge", "height": 157, "id": "730942f-a", "desc": "Construction" }, { "date": "1903", "loc": "Williamsburg Bridge", "height": 129, "id": "731081f", "desc": "Under construction" }, { "date": "1890", "loc": "Mott & Park", "height": 177, "id": "721756f-a", "desc": "Street scene" }, { "date": "1900", "loc": "Broad St & Wall St", "height": 159, "id": "716841f-a", "desc": "Street scene" }, { "date": "1873", "loc": "Brooklyn Bridge", "height": 153, "id": "730663f-a", "desc": "Under construction; view of Manhattan" }, { "date": "1879", "loc": "Brooklyn Bridge", "height": 254, "id": "730665f-a", "desc": "Under construction; view of Manhattan" }, { "date": "1939", "loc": "Coney Island", "height": 129, "id": "731939f", "desc": "Beach scene" }, { "date": "1922", "loc": "Queens", "height": 152, "id": "725900f-a", "desc": "Country house (now JFK airport)" }, { "date": "1901", "loc": "Broadway & 34th", "height": 156, "id": "717404f-a", "desc": "Street scene with muddy road" }, { "date": "1921", "loc": "Broadway & 34th", "height": 158, "id": "1558433", "desc": "View of street scene from elevated tracks" }];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _history = __webpack_require__(8);

	var _history2 = _interopRequireDefault(_history);

	var _urlState = __webpack_require__(9);

	var _viewer = __webpack_require__(1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// This should go in the $(function()) block below.
	// It's exposed to facilitate debugging.
	var h = new _history2.default(function (hash, cb) {
	  (0, _urlState.hashToStateObject)(hash.substr(1), cb);
	});

	// Ping Google Analytics with the current URL (e.g. after history.pushState).
	// See http://stackoverflow.com/a/4813223/388951
	// @ts-check

	function trackAnalyticsPageView() {
	  var url = location.pathname + location.search + location.hash;
	  ga('send', 'pageview', { 'page': url });
	}

	var LOG_HISTORY_EVENTS = false;
	// var LOG_HISTORY_EVENTS = true;

	$(function () {
	  // Relevant UI methods:
	  // - transitionToStateObject(obj)
	  //
	  // State/URL manipulation:
	  // - stateObjectToHash()
	  // - hashToStateObject()
	  //
	  // State objects look like:
	  // {photo_id:string, g:string}

	  // Returns URL fragments like '/#g:123'.
	  var fragment = function fragment(state) {
	    return '/#' + (0, _urlState.stateObjectToHash)(state);
	  };

	  var title = function title(state) {
	    var old_nyc = 'Old NYC';
	    if ('photo_id' in state) {
	      return old_nyc + ' - Photo ' + state.photo_id;
	    } else if ('g' in state) {
	      // TODO: include cross-streets in the title
	      return old_nyc + ' - Grid';
	    } else {
	      return old_nyc;
	    }
	  };

	  $(window).on('showGrid', function (e, pos) {
	    var state = { g: pos };
	    h.pushState(state, title(state), fragment(state));
	    trackAnalyticsPageView();
	  }).on('hideGrid', function () {
	    var state = { initial: true };
	    h.goBackUntil('initial', [state, title(state), fragment(state)]);
	  }).on('openPreviewPanel', function () {
	    // This is a transient state -- it should immediately be replaced.
	    var state = { photo_id: true };
	    h.pushState(state, title(state), fragment(state));
	  }).on('showPhotoPreview', function (e, photo_id) {
	    var g = $('#expanded').data('grid-key');
	    var state = { photo_id: photo_id };
	    if (g == 'pop') state.g = 'pop';
	    h.replaceState(state, title(state), fragment(state));
	    trackAnalyticsPageView();
	  }).on('closePreviewPanel', function () {
	    var g = $('#expanded').data('grid-key');
	    var state = { g: g };
	    h.goBackUntil('g', [state, title(state), fragment(state)]);
	  });

	  // Update the UI in response to hitting the back/forward button,
	  // a hash fragment on initial page load or the user editing the URL.
	  $(h).on('setStateInResponseToUser setStateInResponseToPageLoad', function (e, state) {
	    // It's important that these methods only configure the UI.
	    // They must not trigger events, or they could cause a loop!
	    (0, _urlState.transitionToStateObject)(state);
	  });

	  $(h).on('setStateInResponseToPageLoad', function () {
	    trackAnalyticsPageView(); // hopefully this helps track social shares
	  });

	  if (LOG_HISTORY_EVENTS) {
	    $(window).on('showGrid', function (e, pos) {
	      console.log('showGrid', pos);
	    }).on('hideGrid', function () {
	      console.log('hideGrid');
	    }).on('showPhotoPreview', function (e, photo_id) {
	      console.log('showPhotoPreview', photo_id);
	    }).on('closePreviewPanel', function () {
	      console.log('closePreviewPanel');
	    }).on('openPreviewPanel', function () {
	      console.log('openPreviewPanel');
	    });
	    $(h).on('setStateInResponseToUser', function (e, state) {
	      console.log('setStateInResponseToUser', state);
	    }).on('setStateInResponseToPageLoad', function (e, state) {
	      console.log('setStateInResponseToPageLoad', state);
	    });
	  }

	  // To load from a URL fragment, the map object must be ready.
	  _viewer.mapPromise.done(function () {
	    h.initialize();
	  });
	});

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// @ts-check

	// History management service.
	// Consider using this instead: https://github.com/browserstate/history.js
	var History = function () {
	  function History(hashToStateAdapter) {
	    _classCallCheck(this, History);

	    this.states = [];
	    this.hashToStateAdapter = hashToStateAdapter;
	  }

	  _createClass(History, [{
	    key: 'initialize',
	    value: function initialize() {
	      var that = this;
	      $(window).on('popstate', function (e) {
	        that.handlePopState(e.originalEvent.state);
	      });

	      // Create an artificial initial state
	      var state = { initial: true };
	      var didSetState = false;

	      var rest = function () {
	        // Blow away the current state -- it's only going to cause trouble.
	        history.replaceState({}, '', document.location.href);
	        this.replaceState(state, document.title, document.location.href);

	        if (didSetState) {
	          $(this).trigger('setStateInResponseToPageLoad', state);
	        }
	      }.bind(this);

	      if (this.hashToStateAdapter && document.location.hash) {
	        didSetState = true;
	        // Need to honor any hash fragments that the user navigated to.
	        this.hashToStateAdapter(document.location.hash, function (newState) {
	          state = newState;
	          rest();
	        });
	      } else {
	        rest();
	      }
	    }
	  }, {
	    key: 'makeState',
	    value: function makeState(obj) {
	      var currentStateId = null;
	      if (history.state && 'id' in history.state) {
	        currentStateId = history.state.id;
	      }
	      return $.extend({
	        length: history.length,
	        previousStateId: currentStateId,
	        id: Date.now() + '' + Math.floor(Math.random() * 100000000)
	      }, obj);
	    }
	  }, {
	    key: 'simplifyState',
	    value: function simplifyState(obj) {
	      var state = $.extend({}, obj);
	      delete state['id'];
	      // delete state['length'];
	      delete state['previousStateId'];
	      return state;
	    }
	  }, {
	    key: 'handlePopState',
	    value: function handlePopState(state) {
	      // note: we don't remove entries from this.state here, since the user could
	      // still go forward to them.
	      if (state && 'id' in state) {
	        var stateObj = this.states[this.getStateIndexById(state.id)];
	        if (stateObj && stateObj.expectingBack) {
	          // This is happening as a result of a call on the History object.
	          delete stateObj.expectingBack;
	          return;
	        }
	      }

	      var trigger = function () {
	        $(this).trigger('setStateInResponseToUser', state);
	      }.bind(this);
	      if (!state && this.hashToStateAdapter) {
	        this.hashToStateAdapter(document.location.hash, function (newState) {
	          state = newState;
	          trigger();
	        });
	      } else {
	        trigger();
	      }
	    }
	    // Just like history.pushState.

	  }, {
	    key: 'pushState',
	    value: function pushState(stateObj, title, url) {
	      var state = this.makeState(stateObj);
	      this.states.push(state);
	      history.pushState(state, title, url);
	      document.title = title;
	    }
	    // Just like history.replaceState.

	  }, {
	    key: 'replaceState',
	    value: function replaceState(stateObj, title, url) {
	      var curState = this.getCurrentState();
	      var replaceIdx = null;
	      var previousId = null;
	      if (curState) {
	        if ('id' in curState) {
	          replaceIdx = this.getStateIndexById(curState.id);
	        }
	        if ('previousStateId' in curState) {
	          // in replacing the current state, we inherit its parent state.
	          previousId = curState.previousStateId;
	        }
	      }

	      var state = this.makeState(stateObj);
	      if (previousId !== null) {
	        state.previousStateId = previousId;
	      }
	      if (replaceIdx !== null) {
	        this.states[replaceIdx] = state;
	      } else {
	        this.states.push(state);
	      }
	      history.replaceState(state, title, url);
	      document.title = title;
	    }
	  }, {
	    key: 'getCurrentState',
	    value: function getCurrentState() {
	      return history.state;
	    }
	  }, {
	    key: 'getStateIndexById',
	    value: function getStateIndexById(stateId) {
	      for (var i = 0; i < this.states.length; i++) {
	        if (this.states[i].id == stateId) return i;
	      }
	      return null;
	    }
	    // Get the state object one prior to the given one.

	  }, {
	    key: 'getPreviousState',
	    value: function getPreviousState(state) {
	      if (!('previousStateId' in state)) return null;
	      var id = state['previousStateId'];
	      if (id == null) return id;

	      var idx = this.getStateIndexById(id);
	      if (idx !== null) {
	        return this.states[idx];
	      }
	      throw "State out of whack!";
	    }
	    /**
	     * Go back in history until the predicate is true.
	     * If predicate is a string, go back until it's a key in the state object.
	     * This will not result in a setStateInResponseToUser event firing.
	     * Returns the number of steps back in the history that it went (possibly 0 if
	     * the current state matches the predicate).
	     * If no matching history state is found, the history stack will be cleared and
	     * alternativeState will be pushed on.
	     */

	  }, {
	    key: 'goBackUntil',
	    value: function goBackUntil(predicate, alternativeState) {
	      // Convenience for common case of checking if history state has a key.
	      if (typeof predicate == "string") {
	        return this.goBackUntil(function (state) {
	          return predicate in state;
	        }, alternativeState);
	      }

	      var state = this.getCurrentState();
	      var numBack = 0;

	      var lastState = null;
	      while (state && !predicate(state)) {
	        lastState = state;
	        state = this.getPreviousState(state);
	        numBack += 1;
	      }
	      if (state && numBack) {
	        state.expectingBack = true;
	        history.go(-numBack);
	        return numBack;
	      }
	      if (numBack == 0) {
	        return 0; // current state fulfilled predicate
	      } else {
	        // no state fulfilled predicate. Clear the stack to just one state and
	        // replace it with alternativeState.
	        var stackLen = numBack;
	        if (stackLen != 1) {
	          lastState.expectingBack = true;
	          history.go(-(stackLen - 1));
	        }
	        this.replaceState(alternativeState[0], alternativeState[1], alternativeState[2]);
	      }
	    }
	    // Debugging method -- prints the history stack.

	  }, {
	    key: 'logStack',
	    value: function logStack() {
	      var state = this.getCurrentState();
	      var i = 0;
	      while (state) {
	        console.log((i > 0 ? '-' : ' ') + i, this.simplifyState(state));
	        state = this.getPreviousState(state);
	        i++;
	      }
	    }
	  }]);

	  return History;
	}();

	exports.default = History;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getCurrentStateObject = getCurrentStateObject;
	exports.hashToStateObject = hashToStateObject;
	exports.stateObjectToHash = stateObjectToHash;
	exports.transitionToStateObject = transitionToStateObject;

	var _viewer = __webpack_require__(1);

	var _photoInfo = __webpack_require__(2);

	// Returns {photo_id:string, g:string}
	// @ts-check
	// The URL looks like one of these:
	// /
	// /#photo_id
	// /#g:lat,lon
	// /#photo_id,g:lat,lon

	function getCurrentStateObject() {
	  if (!$('#expanded').is(':visible')) {
	    return {};
	  }
	  var g = $('#expanded').data('grid-key');
	  var selectedId = $('#grid-container').expandableGrid('selectedId');

	  return selectedId ? { photo_id: selectedId, g: g } : { g: g };
	}

	// Converts the string after '#' in a URL into a state object,
	// {photo_id:string, g:string}
	// This is asynchronous because it may need to fetch ID->lat/lon info.
	function hashToStateObject(hash, cb) {
	  var m = hash.match(/(.*),g:(.*)/);
	  if (m) {
	    cb({ photo_id: m[1], g: m[2] });
	  } else if (hash.substr(0, 2) == 'g:') {
	    cb({ g: hash.substr(2) });
	  } else if (hash.length > 0) {
	    var photo_id = hash;
	    (0, _photoInfo.findLatLonForPhoto)(photo_id, function (g) {
	      cb({ photo_id: hash, g: g });
	    });
	  } else {
	    cb({});
	  }
	}

	function stateObjectToHash(state) {
	  if (state.photo_id) {
	    if (state.g == 'pop') {
	      return state.photo_id + ',g:pop';
	    } else {
	      return state.photo_id;
	    }
	  }

	  if (state.g) {
	    return 'g:' + state.g;
	  }
	  return '';
	}

	// Change whatever is currently displayed to reflect the state in obj.
	// This change may happen asynchronously.
	// This won't affect the URL hash.
	function transitionToStateObject(targetState) {
	  var currentState = getCurrentStateObject();

	  // This normalizes the state, i.e. adds a 'g' field to if it's implied.
	  // (it also strips out extraneous fields)
	  hashToStateObject(stateObjectToHash(targetState), function (state) {
	    if (JSON.stringify(currentState) == JSON.stringify(state)) {
	      return; // nothing to do.
	    }

	    // Reset to map view.
	    if (JSON.stringify(state) == '{}') {
	      (0, _viewer.hideAbout)();
	      (0, _viewer.hideExpanded)();
	    }

	    // Show a different grid?
	    if (currentState.g != state.g) {
	      var lat_lon = state.g;
	      var count = (0, _viewer.countPhotos)(lat_lons[lat_lon]);
	      if (state.g == 'pop') {
	        count = (0, _viewer.getPopularPhotoIds)().length;
	      } else {
	        // Highlight the marker, creating it if necessary.
	        var marker = _viewer.lat_lon_to_marker[lat_lon];
	        var latLng = (0, _viewer.parseLatLon)(lat_lon);
	        if (!marker) {
	          marker = (0, _viewer.createMarker)(lat_lon, latLng);
	        }
	        if (marker) {
	          (0, _viewer.selectMarker)(marker, count);
	          if (!_viewer.map.getBounds().contains(latLng)) {
	            _viewer.map.panTo(latLng);
	          }
	        }
	      }
	      (0, _photoInfo.loadInfoForLatLon)(lat_lon).done(function (photo_ids) {
	        (0, _viewer.showExpanded)(state.g, photo_ids, state.photo_id);
	      });
	      return;
	    }

	    if (currentState.photo_id && !state.photo_id) {
	      // Hide the selected photo
	      $('#grid-container').expandableGrid('deselect');
	    } else {
	      // Show a different photo
	      $('#grid-container').expandableGrid('select', state.photo_id);
	    }
	  });
	}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _viewer = __webpack_require__(1);

	var locationMarker = null; // @ts-check
	/**
	 * This module supports address search and the current location button.
	 */

	function setLocation(latLng, title) {
	  _viewer.map.panTo(latLng);
	  _viewer.map.setZoom(17);

	  if (locationMarker) {
	    locationMarker.setMap(null);
	  }
	  locationMarker = new google.maps.Marker({
	    position: latLng,
	    map: _viewer.map,
	    title: title
	  });
	}

	$(function () {
	  $('#location-search').on('keypress', function (e) {
	    if (e.which !== 13) return;

	    var address = $(this).val();
	    $.getJSON('https://maps.googleapis.com/maps/api/geocode/json', {
	      address: address,
	      key: 'AIzaSyClCA1LViYi4KLQfgMlfr3PS0tyxwqzYjA',
	      bounds: '40.490856,-74.260895|41.030091,-73.578699'
	    }).done(function (response) {
	      var latLng = response.results[0].geometry.location;
	      setLocation(latLng, address);
	      ga('send', 'event', 'link', 'address-search');
	    }).fail(function (e) {
	      console.error(e);
	      ga('send', 'event', 'link', 'address-search-fail');
	    });
	  });

	  $('#current-location').on('click', function () {
	    navigator.geolocation.getCurrentPosition(function (position) {
	      var _position$coords = position.coords,
	          latitude = _position$coords.latitude,
	          longitude = _position$coords.longitude;

	      setLocation({ lat: latitude, lng: longitude }, 'Current Location');
	      ga('send', 'event', 'link', 'current-location');
	    }, function (e) {
	      console.error(e);
	      ga('send', 'event', 'link', 'current-location-error');
	    });
	  });
	});

/***/ })
/******/ ]);