// This file manages all the photo information.
// Some of this comes in via lat-lons.js.
// Some is requested via XHR.

// Maps photo_id -> { title: ..., date: ..., library_url: ... }
const photo_id_to_info: {[photoId: string]: PhotoInfo} = {};

const SITE = '';
const JSON_BASE = SITE + '/by-location';

export interface LightPhotoInfo {
  title: string;
  date: string;
}

/** Value type for popular.json, by-location/*.json */
export interface PhotoInfo {
  width: number;
  thumb_url: string;
  image_url: string;
  title: string;
  date: string;
  text: string | null;
  folder: string;
  height: number;
  years?: string[];
  original_title?: string;
  rotation?: number;
}

// The callback is called with the photo_ids that were just loaded, after the
// UI updates.  The callback may assume that infoForPhotoId() will return data
// for all the newly-available photo_ids.
export function loadInfoForLatLon(lat_lon: string) {
  let url;
  if (lat_lon == 'pop') {
    url = SITE + '/popular.json';
  } else {
    url = JSON_BASE + '/' + lat_lon.replace(',', '') + '.json';
  }

  return $.getJSON(url).then(function(response_data: {[photoId: string]: PhotoInfo}) {
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
export function infoForPhotoId(photo_id: string): LightPhotoInfo {
  return photo_id_to_info[photo_id] ||
      { title: '', date: '' };
}

// Would it make more sense to incorporate these into infoForPhotoId?
export function descriptionForPhotoId(photo_id: string) {
  var info = infoForPhotoId(photo_id);
  var desc = info.title;
  if (desc) desc += ' ';
  var date = info.date.replace(/n\.d\.?/, 'No Date');
  if (!date) date = 'No Date';
  desc += date;
  return desc;
}

export function libraryUrlForPhotoId(photo_id: string) {
  return 'http://digitalcollections.nypl.org/items/image_id/' + photo_id.replace(/-[a-z]$/, '');
}

export function backId(photo_id: string) {
  return photo_id.replace('f', 'b').replace(/-[a-z]$/, '');
}

export function backOfCardUrlForPhotoId(photo_id: string) {
  return 'http://images.nypl.org/?id=' + backId(photo_id) + '&t=w';
}


const lat_lon_to_name: {[latLng: string]: string} = {};

// Does this lat_lon have a name, e.g. "Manhattan: 14th Street - 8th Avenue"?
export function nameForLatLon(lat_lon: string) {
  var v = lat_lon_to_name[lat_lon] || '';
  return v.replace(/: | - | & /g, '\n');
}

function extractName(lat_lon_json: {[latLng: string]: PhotoInfo}) {
  // if any entries have an original_title, it's got to be a pure location.
  for (var k in lat_lon_json) {
    var v = lat_lon_json[k];
    if (v.original_title) return v.original_title;
  }
}

export function findLatLonForPhoto(photo_id: string, cb:  (lat_lon: string) => void) {
  var id4 = photo_id.slice(0, 4);
  $.ajax({
    dataType: "json",
    url: '/id4-to-location/' + id4 + '.json',
    success: function (id_to_latlon: {[id: string]: string}) {
      cb(id_to_latlon[photo_id]);
    }
  });
}
