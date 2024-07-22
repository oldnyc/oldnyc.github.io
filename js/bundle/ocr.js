/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/feedback.ts":
/*!************************!*\
  !*** ./js/feedback.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\n/**\n * Common code for recording user feedback.\n * This is shared between the OldNYC site and the OCR feedback tool.\n */\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getFeedbackText = exports.sendFeedback = exports.getCookie = exports.setCookie = exports.deleteCookie = void 0;\nconst API = 'https://danvk-bronzeswift.web.val.run/api/v0';\nvar COOKIE_ID = 'oldnycid';\nlet lastReviewedOcrMsPromise = $.get('/timestamps.json').then(function (data) {\n    return data.ocr_ms;\n});\nfunction deleteCookie(name) {\n    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';\n}\nexports.deleteCookie = deleteCookie;\nfunction setCookie(name, value) {\n    document.cookie = name + \"=\" + value + \"; path=/\";\n}\nexports.setCookie = setCookie;\nfunction getCookie(name) {\n    const b = document.cookie.match('(^|;)\\\\s*' + name + '\\\\s*=\\\\s*([^;]+)');\n    return b ? b.pop() : '';\n}\nexports.getCookie = getCookie;\n// Assign each user a unique ID for tracking repeat feedback.\nlet COOKIE = getCookie(COOKIE_ID);\nif (!COOKIE) {\n    COOKIE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {\n        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);\n        return v.toString(16);\n    });\n    setCookie(COOKIE_ID, COOKIE);\n}\nconsole.log('Cookie', COOKIE);\n// Record one piece of feedback. Returns a jQuery deferred object.\nfunction sendFeedback(photo_id, feedback_type, feedback_obj) {\n    return __awaiter(this, void 0, void 0, function* () {\n        ga('send', 'event', 'link', 'feedback', { 'page': '/#' + photo_id });\n        const feedbackRequest = Object.assign(Object.assign({}, feedback_obj), { metadata: {\n                // TODO: move into request headers?\n                cookie: COOKIE\n            } });\n        const path = `${API}/${photo_id}/${feedback_type}`;\n        const response = yield fetch(path, {\n            method: 'POST',\n            body: JSON.stringify(feedbackRequest),\n        });\n        if (!response.ok) {\n            throw new Error(response.statusText);\n        }\n        return response.json();\n    });\n}\nexports.sendFeedback = sendFeedback;\n// Retrieve the most-recent OCR for a backing image.\n// Resolves with null if there is no OCR text available.\nfunction getFeedbackText(back_id) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const lastReviewedOcrMs = yield lastReviewedOcrMsPromise;\n        const path = `${API}/${back_id}/text`;\n        const response = yield fetch(path);\n        if (!response.ok) {\n            throw new Error(response.statusText);\n        }\n        const feedback = yield response.json();\n        if (feedback.timestamp > lastReviewedOcrMs) {\n            return feedback;\n        }\n        return null;\n    });\n}\nexports.getFeedbackText = getFeedbackText;\n\n\n//# sourceURL=webpack://oldnyc/./js/feedback.ts?");

/***/ }),

/***/ "./js/ocr-tool.ts":
/*!************************!*\
  !*** ./js/ocr-tool.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * JavaScript for the OCR correction tool. See ocr.html\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst photo_info_1 = __webpack_require__(/*! ./photo-info */ \"./js/photo-info.ts\");\nconst feedback_1 = __webpack_require__(/*! ./feedback */ \"./js/feedback.ts\");\nif (window.location.search.indexOf('thanks') >= 0) {\n    $('#thanks').show();\n}\nconst id = window.location.hash.slice(1);\n$('[name=\"photo_id\"]').val(id);\n$('#back-link').attr('href', '/#' + id);\nlet other_photo_ids;\n(0, photo_info_1.findLatLonForPhoto)(id, function (lat_lon) {\n    var infoDef = (0, photo_info_1.loadInfoForLatLon)(lat_lon), ocrDef = (0, feedback_1.getFeedbackText)((0, photo_info_1.backId)(id));\n    // TODO: update to Promise.all; $.when isn't very well-typed.\n    $.when(infoDef, ocrDef).done(function (photo_ids, ocr_obj) {\n        console.log(photo_ids, ocr_obj);\n        var info = (0, photo_info_1.infoForPhotoId)(id);\n        $('#hi-res').attr('href', (0, photo_info_1.libraryUrl)(id, info.nypl_url));\n        other_photo_ids = photo_ids;\n        $('img.back').attr('src', (0, photo_info_1.backOfCardUrlForPhotoId)(id));\n        var text = ocr_obj ? ocr_obj.text : info.text;\n        if (text) {\n            $('#text').text(text);\n        }\n        $('#submit').click(function () {\n            submit('text', { text: $('#text').val() });\n        });\n        $('#notext').click(function () {\n            submit('notext', { notext: true });\n        });\n        $('.rotate-image-button').click(rotate90);\n    });\n});\n// A list of photo IDs without text, for use as next images to show.\nvar noTextIdsDef = $.getJSON('/notext.json');\nfunction submit(type, feedback_obj) {\n    (0, feedback_1.sendFeedback)((0, photo_info_1.backId)(id), type, feedback_obj)\n        .then(function () {\n        // Go to another image at the same location.\n        return next_image(id);\n    })\n        .then(function (next_id) {\n        var url = location.protocol + '//' + location.host + location.pathname +\n            '?thanks&id=' + next_id + '#' + next_id;\n        ga('send', 'event', 'link', 'ocr-success', { 'page': '/#' + id });\n        window.location.href = url;\n    });\n}\n// Find the next image from a different card.\nfunction next_image(id) {\n    var def = $.Deferred();\n    if (Math.random() < 0.5) {\n        // Pick another image from the same location.\n        var idx = other_photo_ids.indexOf(id);\n        for (var i = 0; i < other_photo_ids.length; i++) {\n            var other_id = other_photo_ids[(i + idx) % other_photo_ids.length];\n            if (!other_id.match(/[0-9]f/)) {\n                // no back of card for this photo\n                continue;\n            }\n            if ((0, photo_info_1.backOfCardUrlForPhotoId)(other_id) != (0, photo_info_1.backOfCardUrlForPhotoId)(id)) {\n                def.resolve(other_id);\n                return def;\n            }\n        }\n        // ... fall through\n    }\n    // Pick an image with no transcription (these are the most valuable to get\n    // user-generated data for).\n    noTextIdsDef.done(function (data) {\n        var ids = data.photo_ids;\n        console.log('Picking at random from ' + ids.length + ' untranscribed photos.');\n        def.resolve(ids[Math.floor(Math.random() * ids.length)]);\n    });\n    return def;\n}\nfunction rotate90() {\n    var $img = $('img.back');\n    var currentRotation = $img.data('rotate') || 0;\n    currentRotation += 90;\n    $img\n        .css('transform', 'rotate(' + currentRotation + 'deg)')\n        .data('rotate', currentRotation);\n    (0, feedback_1.sendFeedback)((0, photo_info_1.backId)(id), 'rotate-backing', { 'rotate-backing': currentRotation });\n}\n\n\n//# sourceURL=webpack://oldnyc/./js/ocr-tool.ts?");

/***/ }),

/***/ "./js/photo-info.ts":
/*!**************************!*\
  !*** ./js/photo-info.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n// This file manages all the photo information.\n// Some of this comes in via lat-lons.js.\n// Some is requested via XHR.\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.libraryUrl = exports.findLatLonForPhoto = exports.nameForLatLon = exports.backOfCardUrlForPhotoId = exports.backId = exports.descriptionForPhotoId = exports.infoForPhotoId = exports.loadInfoForLatLon = void 0;\n// Maps photo_id -> { title: ..., date: ..., library_url: ... }\nconst photo_id_to_info = {};\nconst SITE = '';\nconst JSON_BASE = SITE + '/by-location';\n// The callback is called with the photo_ids that were just loaded, after the\n// UI updates.  The callback may assume that infoForPhotoId() will return data\n// for all the newly-available photo_ids.\nfunction loadInfoForLatLon(lat_lon) {\n    let url;\n    if (lat_lon == 'pop') {\n        url = SITE + '/popular.json';\n    }\n    else {\n        url = JSON_BASE + '/' + lat_lon.replace(',', '') + '.json';\n    }\n    return $.getJSON(url).then(function (response_data) {\n        // Add these values to the cache.\n        $.extend(photo_id_to_info, response_data);\n        var photo_ids = [];\n        for (var k in response_data) {\n            photo_ids.push(k);\n        }\n        if (lat_lon != 'pop') {\n            lat_lon_to_name[lat_lon] = extractName(response_data);\n        }\n        return photo_ids;\n    });\n}\nexports.loadInfoForLatLon = loadInfoForLatLon;\n// Returns a {title: ..., date: ...} object.\n// If there's no information about the photo yet, then the values are all set\n// to the empty string.\nfunction infoForPhotoId(photo_id) {\n    return photo_id_to_info[photo_id] ||\n        { title: '', date: '' };\n}\nexports.infoForPhotoId = infoForPhotoId;\n// Would it make more sense to incorporate these into infoForPhotoId?\nfunction descriptionForPhotoId(photo_id) {\n    var info = infoForPhotoId(photo_id);\n    var desc = info.title;\n    if (desc)\n        desc += ' ';\n    var date = info.date.replace(/n\\.d\\.?/, 'No Date');\n    if (!date)\n        date = 'No Date';\n    desc += date;\n    return desc;\n}\nexports.descriptionForPhotoId = descriptionForPhotoId;\nfunction backId(photo_id) {\n    return photo_id.replace('f', 'b').replace(/-[a-z]$/, '');\n}\nexports.backId = backId;\nfunction backOfCardUrlForPhotoId(photo_id) {\n    return 'http://images.nypl.org/?id=' + backId(photo_id) + '&t=w';\n}\nexports.backOfCardUrlForPhotoId = backOfCardUrlForPhotoId;\nconst lat_lon_to_name = {};\n// Does this lat_lon have a name, e.g. \"Manhattan: 14th Street - 8th Avenue\"?\nfunction nameForLatLon(lat_lon) {\n    var v = lat_lon_to_name[lat_lon] || '';\n    return v.replace(/: | - | & /g, '\\n');\n}\nexports.nameForLatLon = nameForLatLon;\nfunction extractName(lat_lon_json) {\n    // if any entries have an original_title, it's got to be a pure location.\n    for (var k in lat_lon_json) {\n        var v = lat_lon_json[k];\n        if (v.original_title)\n            return v.original_title;\n    }\n}\nfunction findLatLonForPhoto(photo_id, cb) {\n    var id4 = photo_id.slice(0, 4);\n    $.ajax({\n        dataType: \"json\",\n        url: '/id4-to-location/' + id4 + '.json',\n        success: function (id_to_latlon) {\n            cb(id_to_latlon[photo_id]);\n        }\n    });\n}\nexports.findLatLonForPhoto = findLatLonForPhoto;\nfunction libraryUrl(photo_id, url) {\n    return url !== null && url !== void 0 ? url : `https://digitalcollections.nypl.org/search/index?keywords=${photo_id}`;\n}\nexports.libraryUrl = libraryUrl;\n\n\n//# sourceURL=webpack://oldnyc/./js/photo-info.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./js/ocr-tool.ts");
/******/ 	
/******/ })()
;