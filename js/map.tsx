/** OldNYC Google Map */

import React from 'react';
import { MAP_STYLE } from './map-styles';

const markers: google.maps.Marker[] = [];
const marker_icons: google.maps.Icon[] = [];
const selected_marker_icons: google.maps.Icon[] = [];
export var lat_lon_to_marker: {[latLng: string]: google.maps.Marker} = {};

export type YearRange = [firstYear: number, lastYear: number];
let year_range: YearRange = [1800, 2000];

export let map: google.maps.Map | undefined;

interface YearToCount {
  [year: string]: number;
}

export function initialize_map(el: HTMLElement) {
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

  map = new google.maps.Map(el, opts);

  // This shoves the navigation bits down by a CSS-specified amount
  // (see the .spacer rule). This is surprisingly hard to do.
  // var map_spacer = $('<div/>').append($('<div/>').addClass('spacer')).get(0);
  // map_spacer.index = -1;
  const mapSpacer = document.createElement('div');
  mapSpacer.innerHTML = '<div class="spacer"></div>';
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapSpacer);

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
    // mapPromise.resolve(map);
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

function isFullTimeRange(yearRange: [number, number]) {
  return (yearRange[0] === 1800 && yearRange[1] === 2000);
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
  // google.maps.event.addListener(marker, 'click', handleClick);
  return marker;
}

export interface MapProps {
  yearRange: YearRange;
}

export function Map(props: MapProps) {
  const ref = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    if (ref.current) {
      initialize_map(ref.current);
    }
  }, [ref]);

  return <div id="map" ref={ref}></div>
}
