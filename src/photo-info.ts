// This file manages all the photo information.
// Some of this comes in via lat-lons.js.
// Some is requested via XHR.

// Maps photo_id -> { title: ..., date: ..., library_url: ... }
const photo_id_to_info: { [photoId: string]: PhotoInfo } = {};

const SITE = '';
const JSON_BASE = SITE + '/by-location';

/** Value type for popular.json, by-location/*.json */
export interface PhotoInfo {
  id: string;
  width: number;
  thumb_url: string;
  image_url: string;
  title: string;
  date: string;
  text: string | null;
  folder: string;
  height: number;
  years: string[];
  original_title?: string;
  rotation?: number;
  nypl_url?: string;
}

// After this resolves, code may assume that infoForPhotoId() will return data
// for all the newly-available photo_ids.
export async function loadInfoForLatLon(lat_lon: string): Promise<string[]> {
  let url: string;
  if (lat_lon == 'pop') {
    url = SITE + '/popular.json';
  } else {
    url = JSON_BASE + '/' + lat_lon.replace(',', '') + '.json';
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const response_data = (await response.json()) as PhotoInfo[];
  // Add these values to the cache.
  for (const photo of response_data) {
    photo_id_to_info[photo.id] = photo;
  }
  if (lat_lon != 'pop') {
    lat_lon_to_name[lat_lon] = extractName(response_data);
  }
  const photo_ids = response_data.map((r) => r.id);
  return photo_ids;
}

// Returns a {title: ..., date: ...} object.
// If there's no information about the photo yet, then the values are all set
// to the empty string.
export function infoForPhotoId(photo_id: string): PhotoInfo {
  return (
    photo_id_to_info[photo_id] ?? {
      // XXX surprising that this type checks with missing fields!
      title: '',
      date: '',
      width: 600, // these are fallbacks
      height: 400,
      years: [''],
    }
  );
}

// Would it make more sense to incorporate these into infoForPhotoId?
export function descriptionForPhotoId(photo_id: string) {
  const info = infoForPhotoId(photo_id);
  let desc = info.title;
  if (desc) desc += ' ';
  let date = info.date.replace(/n\.d\.?/, 'No Date');
  if (!date) date = 'No Date';
  desc += date;
  return desc;
}

export function backId(photo_id: string) {
  return photo_id.replace('f', 'b').replace(/-[a-z]$/, '');
}

export function backOfCardUrlForPhotoId(photo_id: string) {
  return 'http://images.nypl.org/?id=' + backId(photo_id) + '&t=w';
}

const lat_lon_to_name: { [latLng: string]: string | undefined } = {};

// Does this lat_lon have a name, e.g. "Manhattan: 14th Street - 8th Avenue"?
export function nameForLatLon(lat_lon: string) {
  const v = lat_lon_to_name[lat_lon] ?? '';
  return v.replace(/: | - | & /g, '\n');
}

function extractName(lat_lon_json: PhotoInfo[]) {
  // if any entries have an original_title, it's got to be a pure location.
  for (const v of lat_lon_json) {
    if (v.original_title) return v.original_title;
  }
}

export function findLatLonForPhoto(
  photo_id: string,
  cb: (lat_lon: string) => void,
) {
  const id4 = photo_id.slice(0, 4);
  $.ajax({
    dataType: 'json',
    url: '/id4-to-location/' + id4 + '.json',
    success: function (id_to_latlon: { [id: string]: string }) {
      cb(id_to_latlon[photo_id]);
    },
  });
}

export function getLibraryUrl(photo_id: string, url: string | undefined) {
  if (url) {
    return url;
  }
  // e.g. 123456-a -> 123456
  photo_id = photo_id.replace(/-.*/, '');
  return (
    url ??
    `https://digitalcollections.nypl.org/search/index?keywords=${photo_id}`
  );
}

export function getCanonicalUrlForPhoto(photo_id: string) {
  return 'http://www.oldnyc.org/#' + photo_id;
}
