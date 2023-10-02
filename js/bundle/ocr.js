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

	var _photoInfo = __webpack_require__(2);

	var _feedback = __webpack_require__(5);

	// @ts-check
	/**
	 * JavaScript for the OCR correction tool. See ocr.html
	 */

	if (window.location.search.indexOf('thanks') >= 0) {
	  $('#thanks').show();
	}

	var id = window.location.hash.slice(1);
	$('[name="photo_id"]').val(id);
	$('#back-link').attr('href', '/#' + id);
	$('#hi-res').attr('href', (0, _photoInfo.libraryUrlForPhotoId)(id));
	var other_photo_ids;
	(0, _photoInfo.findLatLonForPhoto)(id, function (lat_lon) {
	  var infoDef = (0, _photoInfo.loadInfoForLatLon)(lat_lon),
	      ocrDef = (0, _feedback.getFeedbackText)((0, _photoInfo.backId)(id));
	  $.when(infoDef, ocrDef).done(function (photo_ids, ocr_obj) {
	    console.log(photo_ids, ocr_obj);
	    var info = (0, _photoInfo.infoForPhotoId)(id);
	    other_photo_ids = photo_ids;
	    $('img.back').attr('src', (0, _photoInfo.backOfCardUrlForPhotoId)(id));
	    var text = ocr_obj ? ocr_obj.text : info.text;
	    if (text) {
	      $('#text').text(text);
	    }
	    $('#submit').click(function () {
	      submit('text', { text: $('#text').val() });
	    });
	    $('#notext').click(function () {
	      submit('notext', { notext: true });
	    });
	    $('.rotate-image-button').click(rotate90);
	  });
	});

	// A list of photo IDs without text, for use as next images to show.
	var noTextIdsDef = $.getJSON('/notext.json');

	function submit(type, feedback_obj) {
	  (0, _feedback.sendFeedback)((0, _photoInfo.backId)(id), type, feedback_obj).then(function () {
	    // Go to another image at the same location.
	    return next_image(id);
	  }).then(function (next_id) {
	    var url = location.protocol + '//' + location.host + location.pathname + '?thanks&id=' + next_id + '#' + next_id;
	    ga('send', 'event', 'link', 'ocr-success', { 'page': '/#' + id });
	    window.location = url;
	  });
	}

	// Find the next image from a different card.
	function next_image(id) {
	  var def = $.Deferred();

	  if (Math.random() < 0.5) {
	    // Pick another image from the same location.
	    var idx = other_photo_ids.indexOf(id);
	    for (var i = 0; i < other_photo_ids.length; i++) {
	      var other_id = other_photo_ids[(i + idx) % other_photo_ids.length];

	      if (!other_id.match(/[0-9]f/)) {
	        // no back of card for this photo
	        continue;
	      }

	      if ((0, _photoInfo.backOfCardUrlForPhotoId)(other_id) != (0, _photoInfo.backOfCardUrlForPhotoId)(id)) {
	        def.resolve(other_id);
	        return def;
	      }
	    }
	    // ... fall through
	  }

	  // Pick an image with no transcription (these are the most valuable to get
	  // user-generated data for).
	  noTextIdsDef.done(function (data) {
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
	  $img.css('transform', 'rotate(' + currentRotation + 'deg)').data('rotate', currentRotation);
	  (0, _feedback.sendFeedback)((0, _photoInfo.backId)(id), { 'rotate-backing': currentRotation });
	}

/***/ }),
/* 1 */,
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
/* 3 */,
/* 4 */,
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

/***/ })
/******/ ]);