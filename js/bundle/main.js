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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _viewer = __webpack_require__(1);

	__webpack_require__(8);

	__webpack_require__(10);

	$(function () {
	  (0, _viewer.fillPopularImagesPanel)();
	  (0, _viewer.initialize_map)();
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.mapPromise = exports.map = exports.lat_lon_to_marker = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

	var _urlState = __webpack_require__(7);

	var _underscore = __webpack_require__(11);

	var _ = _interopRequireWildcard(_underscore);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var markers = [];
	var marker_icons = [];
	var lat_lon_to_marker = exports.lat_lon_to_marker = {};
	var selected_marker_icons = [];
	var selected_marker, selected_icon;
	var year_range = [1800, 2000];

	var map = exports.map = undefined;
	var mapPromise = exports.mapPromise = $.Deferred();

	// TODO: inline image source into popular-photos.js and get rid of this.
	function expandedImageUrl(photo_id) {
	  return 'http://oldnyc-assets.nypl.org/600px/' + photo_id + '.jpg';
	}

	// lat_lon is a "lat,lon" string.
	function makeStaticMapsUrl(lat_lon) {
	  return 'http://maps.googleapis.com/maps/api/staticmap?center=' + lat_lon + '&zoom=15&size=150x150&maptype=roadmap&markers=color:red%7C' + lat_lon + '&style=' + _mapStyles.STATIC_MAP_STYLE;
	}

	function isFullTimeRange(yearRange) {
	  return yearRange[0] === 1800 && yearRange[1] === 2000;
	}

	function countPhotos(yearToCounts) {
	  if (isFullTimeRange(year_range)) {
	    // This includes undated photos.
	    return _.reduce(yearToCounts, function (a, b) {
	      return a + b;
	    });
	  } else {
	    var _ret = function () {
	      var _year_range = year_range;

	      var _year_range2 = _slicedToArray(_year_range, 2);

	      var first = _year_range2[0];
	      var last = _year_range2[1];

	      return {
	        v: _.reduce(_.filter(yearToCounts, function (c, y) {
	          return y > first && y <= last;
	        }), function (a, b) {
	          return a + b;
	        })
	      };
	    }();

	    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	  }
	}

	// Make the given marker the currently selected marker.
	// This is purely UI code, it doesn't touch anything other than the marker.
	function selectMarker(marker, yearToCounts) {
	  var numPhotos = countPhotos(yearToCounts, year_range);
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
	  _.forEach(lat_lon_to_marker, function (marker, lat_lon) {
	    var count = countPhotos(lat_lons[lat_lon], year_range);
	    if (count) {
	      marker.setIcon(marker_icons[Math.min(count, 100)]);
	      marker.setVisible(true);
	    } else {
	      marker.setVisible(false);
	    }
	  });
	  $('#time-range-labels').text(isFullTimeRange(year_range) ? 'All photos' : 'Showing photos from ' + firstYear + ' - ' + lastYear);
	}

	// The callback gets fired when the info for all lat/lons at this location
	// become available (i.e. after the /info RPC returns).
	function displayInfoForLatLon(lat_lon, marker, opt_selectCallback) {
	  selectMarker(marker, lat_lons[lat_lon]);

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
	  var count = countPhotos(lat_lons[lat_lon], year_range);
	  if (!count) return;
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
	  var images = $.map(photo_ids, function (photo_id) {
	    var info = (0, _photoInfo.infoForPhotoId)(photo_id);
	    return $.extend({
	      id: photo_id,
	      largesrc: info.image_url,
	      src: info.thumb_url,
	      width: 600, // these are fallbacks
	      height: 400
	    }, info);
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
	    twttr.widgets.createShareButton(document.location.href, $pane.find('.tweet').get(0), {
	      count: 'none',
	      text: (info.original_title || info.title) + ' - ' + info.date,
	      via: 'Old_NYC @NYPL'
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
	  var lat_lon = (0, _urlState.findLatLonForPhoto)(photo_id);
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
	      var _ui$values = _slicedToArray(ui.values, 2);

	      var a = _ui$values[0];
	      var b = _ui$values[1];

	      updateYears(a, b);
	    }
	  });
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

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

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
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

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getCanonicalUrlForPhoto = getCanonicalUrlForPhoto;
	exports.getCommentCount = getCommentCount;
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

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.deleteCookie = deleteCookie;
	exports.setCookie = setCookie;
	exports.getCookie = getCookie;
	exports.sendFeedback = sendFeedback;
	exports.getFeedbackText = getFeedbackText;
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

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var popular_photos = exports.popular_photos = [{ "date": "1910", "loc": "42nd & 5th ave", "height": 249, "id": "708760f-a", "desc": "Street scene" }, { "date": "1936", "loc": "42nd & 5th ave", "height": 145, "id": "1508783-a", "desc": "Directing traffic and trolley" }, { "date": "1912", "loc": "42nd & 5th ave", "height": 157, "id": "708795f-a", "desc": "Ground level view of street" }, { "date": "1913", "loc": "42nd & 5th ave", "height": 159, "id": "712987f-a", "desc": "Street scene" }, { "date": "1928", "loc": "42nd & 6th Avenue", "height": 246, "id": "713050f-a", "desc": "Street scene" }, { "date": "1933", "loc": "42nd & 6th Avenue", "height": 130, "id": "713043f", "desc": "Under the elevated" }, { "date": "1939", "loc": "42nd & 6th Avenue", "height": 159, "id": "709480f-a", "desc": "Elevated train demolition" }, { "date": "1930s", "loc": "42nd & 6th Avenue", "height": 198, "id": "1558013", "desc": "Street scene" }, { "date": "1936", "loc": "Central Park", "height": 160, "id": "730166f-a", "desc": "Aerial view" }, { "date": "1933", "loc": "Central Park", "height": 133, "id": "718268f-b", "desc": "Roller skating" }, { "date": "1938", "loc": "Central Park", "height": 229, "id": "718346f-a", "desc": "Feeding birds" }, { "date": "", "loc": "Central Park", "height": 298, "id": "718282f-a", "desc": "On the lake" }, { "date": "", "loc": "Central Park", "height": 160, "id": "718194f-a", "desc": "Riding under an arch" }, { "date": "1905", "loc": "Central Park", "height": 154, "id": "718242f-b", "desc": "Ice skaters" }, { "date": "", "loc": "Central Park", "height": 143, "id": "718333f-a", "desc": "Playing croquet" }, { "date": "", "loc": "Central Park", "height": 132, "id": "718280f-a", "desc": "Quiet corner" }, { "date": "1892", "loc": "Central Park", "height": 158, "id": "718272f-a", "desc": "Strolling" }, { "date": "1933", "loc": "Central Park", "height": 133, "id": "718179f-b", "desc": "Aerial View" }, { "date": "1913", "loc": "Central Park", "height": 130, "id": "718284f", "desc": "Schoolboys drilling" }, { "date": "1926", "loc": "Prospect Park", "height": 172, "id": "706346f-a", "desc": "Prospect Park Plaza" }, { "date": "1880", "loc": "Prospect Park", "height": 116, "id": "706348f-b", "desc": "Lake view" }, { "date": "1864", "loc": "Central Park", "height": 168, "id": "718385f-a", "desc": "Rustic arbor" }, { "date": "1892", "loc": "Central Park", "height": 164, "id": "718262f-a", "desc": "Fountain" }, { "date": "1933", "loc": "Roosevelt Island", "height": 158, "id": "732193f-a", "desc": "Welfare (Roosevelt) Island" }, { "date": "1934", "loc": "Brooklyn Bridge", "height": 134, "id": "730718f-c", "desc": "Aerial View" }, { "date": "1932", "loc": "86th & 3rd", "height": 130, "id": "714705f-a", "desc": "Storefronts" }, { "date": "1926", "loc": "Colonial & Nassau", "height": 154, "id": "726358f-c", "desc": "Family on porch" }, { "date": "1939", "loc": "Duane & West", "height": 136, "id": "719363f-a", "desc": "Horse-drawn cart" }, { "date": "1929", "loc": "Weehawken & Christopher", "height": 134, "id": "724321f-b", "desc": "Coca-Cola ad" }, { "date": "", "loc": "George Washington Bridge", "height": 156, "id": "1558509", "desc": "" }, { "date": "1906", "loc": "Bayard & Chrystie", "height": 159, "id": "716608f-a", "desc": "Street scene" }, { "date": "1931", "loc": "5th & 46th", "height": 159, "id": "708851f-a", "desc": "Street scene" }, { "date": "1933", "loc": "Columbus Circle", "height": 155, "id": "719145f-a", "desc": "Tribute to Columbus" }, { "date": "1910", "loc": "Pelham Parkway", "height": 146, "id": "701498f-b", "desc": "At the racetrack" }, { "date": "1936", "loc": "9th & 40th", "height": 129, "id": "732438f-b", "desc": "Food vendors" }, { "date": "1911", "loc": "Poppy Joe Island Beach", "height": 160, "id": "730622f-a", "desc": "Local muskrat hunters" }, { "date": "1890", "loc": "Wallabout Bay", "height": 102, "id": "734085f-a", "desc": "Ship in port" }, { "date": "1933", "loc": "Greenwich Village", "height": 299, "id": "730568f-a", "desc": "Art Exhibit" }, { "date": "1936", "loc": "Battery Park", "height": 134, "id": "716520f-c", "desc": "Aerial view" }, { "date": "1921", "loc": "New Chambers & Madison", "height": 141, "id": "721912f-b", "desc": "Cobblestone" }, { "date": "1918", "loc": "5th & 25th", "height": 242, "id": "731285f-a", "desc": "Victory Arch" }, { "date": "1925", "loc": "Minetta & MacDougal", "height": 168, "id": "721650f-a", "desc": "Alley" }, { "date": "1932", "loc": "Canal & Chrystie", "height": 169, "id": "718806f-a", "desc": "Construction of Sarah Delano Roosevelt Park" }, { "date": "1933", "loc": "Hudson Street", "height": 299, "id": "733360f-c", "desc": "Thanksgiving ragamuffins" }, { "date": "1917", "loc": "Queensborough Bridge", "height": 157, "id": "730942f-a", "desc": "Construction" }, { "date": "1903", "loc": "Williamsburg Bridge", "height": 129, "id": "731081f", "desc": "Under construction" }, { "date": "1890", "loc": "Mott & Park", "height": 177, "id": "721756f-a", "desc": "Street scene" }, { "date": "1900", "loc": "Broad St & Wall St", "height": 159, "id": "716841f-a", "desc": "Street scene" }, { "date": "1873", "loc": "Brooklyn Bridge", "height": 153, "id": "730663f-a", "desc": "Under construction; view of Manhattan" }, { "date": "1879", "loc": "Brooklyn Bridge", "height": 254, "id": "730665f-a", "desc": "Under construction; view of Manhattan" }, { "date": "1939", "loc": "Coney Island", "height": 129, "id": "731939f", "desc": "Beach scene" }, { "date": "1922", "loc": "Queens", "height": 152, "id": "725900f-a", "desc": "Country house (now JFK airport)" }, { "date": "1901", "loc": "Broadway & 34th", "height": 156, "id": "717404f-a", "desc": "Street scene with muddy road" }, { "date": "1921", "loc": "Broadway & 34th", "height": 158, "id": "1558433", "desc": "View of street scene from elevated tracks" }];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getCurrentStateObject = getCurrentStateObject;
	exports.hashToStateObject = hashToStateObject;
	exports.stateObjectToHash = stateObjectToHash;
	exports.transitionToStateObject = transitionToStateObject;
	exports.findLatLonForPhoto = findLatLonForPhoto;

	var _viewer = __webpack_require__(1);

	var _photoInfo = __webpack_require__(2);

	// Returns {photo_id:string, g:string}
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
	    findLatLonForPhoto(photo_id, function (g) {
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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _history = __webpack_require__(9);

	var _history2 = _interopRequireDefault(_history);

	var _urlState = __webpack_require__(7);

	var _viewer = __webpack_require__(1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// This should go in the $(function()) block below.
	// It's exposed to facilitate debugging.
	var h = new _history2.default(function (hash, cb) {
	  (0, _urlState.hashToStateObject)(hash.substr(1), cb);
	});

	// Ping Google Analytics with the current URL (e.g. after history.pushState).
	// See http://stackoverflow.com/a/4813223/388951
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

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// History management service.
	// Consider using this instead: https://github.com/browserstate/history.js
	var History = function History(hashToStateAdapter) {
	  this.states = [];
	  this.hashToStateAdapter = hashToStateAdapter;
	};

	History.prototype.initialize = function () {
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
	};

	History.prototype.makeState = function (obj) {
	  var currentStateId = null;
	  if (history.state && 'id' in history.state) {
	    currentStateId = history.state.id;
	  }
	  return $.extend({
	    length: history.length,
	    previousStateId: currentStateId,
	    id: Date.now() + '' + Math.floor(Math.random() * 100000000)
	  }, obj);
	};

	History.prototype.simplifyState = function (obj) {
	  var state = $.extend({}, obj);
	  delete state['id'];
	  // delete state['length'];
	  delete state['previousStateId'];
	  return state;
	};

	History.prototype.handlePopState = function (state) {
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
	};

	// Just like history.pushState.
	History.prototype.pushState = function (stateObj, title, url) {
	  var state = this.makeState(stateObj);
	  this.states.push(state);
	  history.pushState(state, title, url);
	  document.title = title;
	};

	// Just like history.replaceState.
	History.prototype.replaceState = function (stateObj, title, url) {
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
	};

	History.prototype.getCurrentState = function () {
	  return history.state;
	};

	History.prototype.getStateIndexById = function (stateId) {
	  for (var i = 0; i < this.states.length; i++) {
	    if (this.states[i].id == stateId) return i;
	  }
	  return null;
	};

	// Get the state object one prior to the given one.
	History.prototype.getPreviousState = function (state) {
	  if (!('previousStateId' in state)) return null;
	  var id = state['previousStateId'];
	  if (id == null) return id;

	  var idx = this.getStateIndexById(id);
	  if (idx !== null) {
	    return this.states[idx];
	  }
	  throw "State out of whack!";
	};

	/**
	 * Go back in history until the predicate is true.
	 * If predicate is a string, go back until it's a key in the state object.
	 * This will not result in a setStateInResponseToUser event firing.
	 * Returns the number of steps back in the history that it went (possibly 0 if
	 * the current state matches the predicate).
	 * If no matching history state is found, the history stack will be cleared and
	 * alternativeState will be pushed on.
	 */
	History.prototype.goBackUntil = function (predicate, alternativeState) {
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
	};

	// Debugging method -- prints the history stack.
	History.prototype.logStack = function () {
	  var state = this.getCurrentState();
	  var i = 0;
	  while (state) {
	    console.log((i > 0 ? '-' : ' ') + i, this.simplifyState(state));
	    state = this.getPreviousState(state);
	    i++;
	  }
	};

	exports.default = History;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _viewer = __webpack_require__(1);

	var locationMarker = null; /**
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
	      var _position$coords = position.coords;
	      var latitude = _position$coords.latitude;
	      var longitude = _position$coords.longitude;

	      setLocation({ lat: latitude, lng: longitude }, 'Current Location');
	      ga('send', 'event', 'link', 'current-location');
	    }, function (e) {
	      console.error(e);
	      ga('send', 'event', 'link', 'current-location-error');
	    });
	  });
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ }
/******/ ]);