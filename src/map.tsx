/** OldNYC Google Map */

import React from 'react';
import { MAP_STYLE } from './map-styles';
import { DEFAULT_YEARS, YearRange, isFullTimeRange } from './TimeSlider';

const markers: google.maps.Marker[] = [];
const marker_icons: google.maps.Icon[] = [];
const selected_marker_icons: google.maps.Icon[] = [];
export const lat_lon_to_marker: { [latLng: string]: google.maps.Marker } = {};

// TODO: remove this global
let year_range: YearRange = DEFAULT_YEARS;

export type BoundsChangeFn = (bounds: google.maps.LatLngBounds) => void;
let boundsChangeFn: BoundsChangeFn | undefined;

export type MarkerClickFn = (latLon: string) => void;
let markerClickFn: MarkerClickFn | undefined;

/** Used to set a marker as selected when it's created */
let passiveSelectedLatLon: string | undefined;
let selected_marker: google.maps.Marker | undefined;
/** The icon that the selected marker had before it was selected */
let selected_icon:
  | google.maps.Icon
  | google.maps.Symbol
  | string
  | null
  | undefined;

export let map: google.maps.Map | undefined;

interface YearToCount {
  [year: string]: number;
}

export function initialize_map(el: HTMLElement) {
  const latlng = new google.maps.LatLng(40.74421, -73.9737);
  const opts = {
    zoom: 15,
    maxZoom: 18,
    minZoom: 10,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: true,
    panControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP,
    },
    styles: MAP_STYLE,
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
  const streetView = map.getStreetView();
  google.maps.event.addListener(streetView, 'visible_changed', function () {
    $('.streetview-hide').toggle(!streetView.getVisible());
  });

  // Create marker icons for each number.
  marker_icons.push(null!); // it's easier to be 1-based.
  selected_marker_icons.push(null!);
  for (let i = 0; i < 100; i++) {
    const num = i + 1;
    const size = num == 1 ? 9 : 13;
    const selectedSize = num == 1 ? 15 : 21;
    marker_icons.push({
      url: 'images/sprite-2014-08-29.png',
      size: new google.maps.Size(size, size),
      origin: new google.maps.Point((i % 10) * 39, Math.floor(i / 10) * 39),
      anchor: new google.maps.Point((size - 1) / 2, (size - 1) / 2),
    });
    selected_marker_icons.push({
      url: 'images/selected-2014-08-29.png',
      size: new google.maps.Size(selectedSize, selectedSize),
      origin: new google.maps.Point((i % 10) * 39, Math.floor(i / 10) * 39),
      anchor: new google.maps.Point(
        (selectedSize - 1) / 2,
        (selectedSize - 1) / 2,
      ),
    });
  }

  // Adding markers is expensive -- it's important to defer this when possible.
  const idleListener = google.maps.event.addListener(map, 'idle', function () {
    google.maps.event.removeListener(idleListener);
    addNewlyVisibleMarkers();
  });

  google.maps.event.addListener(map, 'bounds_changed', function () {
    addNewlyVisibleMarkers();
  });

  google.maps.event.addListener(map, 'bounds_changed', function () {
    if (!boundsChangeFn) return;
    boundsChangeFn(map!.getBounds()!);
  });
}

function addNewlyVisibleMarkers() {
  const bounds = map!.getBounds();
  if (!bounds) return;

  for (const lat_lon in lat_lons) {
    if (lat_lon in lat_lon_to_marker) continue;

    const pos = parseLatLon(lat_lon);
    if (!bounds.contains(pos)) continue;

    createMarker(lat_lon, pos);
  }
}

export function parseLatLon(lat_lon: string) {
  const ll = lat_lon.split(',');
  return new google.maps.LatLng(parseFloat(ll[0]), parseFloat(ll[1]));
}

export function countPhotos(yearToCounts: YearToCount) {
  if (isFullTimeRange(year_range)) {
    // This includes undated photos.
    return Object.values(yearToCounts || {}).reduce((a, b) => a + b, 0);
  } else {
    const [first, last] = year_range;
    return Object.entries(yearToCounts || {})
      .filter(([y]) => Number(y) > first && Number(y) <= last)
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
    title: lat_lon,
  });
  markers.push(marker);
  lat_lon_to_marker[lat_lon] = marker;
  google.maps.event.addListener(marker, 'click', () => {
    if (!markerClickFn) return;
    markerClickFn(lat_lon);
  });
  if (passiveSelectedLatLon === lat_lon) {
    selectMarker(marker, lat_lons[lat_lon]);
  }
  return marker;
}

// Make the given marker the currently selected marker.
// This is purely UI code, it doesn't touch anything other than the marker.
export function selectMarker(
  marker: google.maps.Marker,
  yearToCounts: YearToCount,
) {
  const numPhotos = countPhotos(yearToCounts);
  let zIndex = 0;
  if (selected_marker) {
    zIndex = selected_marker.getZIndex() ?? 0;
    selected_marker.setIcon(selected_icon);
  }

  if (marker) {
    selected_marker = marker;
    selected_icon = marker.getIcon();
    marker.setIcon(selected_marker_icons[numPhotos > 100 ? 100 : numPhotos]);
    marker.setZIndex(100000 + zIndex);
  }
}

/** Update the markers to reflect a change in year_range */
export function updateYears() {
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
}

export interface MapProps {
  selectedLatLon?: string;
  yearRange: YearRange;
  onBoundsChange?: BoundsChangeFn;
  onClickMarker?: MarkerClickFn;
}

// TODO: disable keyboard shortcuts when slideshow is open

export function Map(props: MapProps) {
  const { onBoundsChange, onClickMarker, selectedLatLon, yearRange } = props;

  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (ref.current) {
      initialize_map(ref.current);
    }
  }, [ref]);

  // TODO: unset these on cleanup?
  React.useEffect(() => {
    boundsChangeFn = onBoundsChange;
  }, [onBoundsChange]);
  React.useEffect(() => {
    markerClickFn = onClickMarker;
  }, [onClickMarker]);

  React.useEffect(() => {
    if (!selectedLatLon) {
      // TODO: support this (there's no way to un-select in the UI)
      return;
    }
    passiveSelectedLatLon = selectedLatLon;
    const marker = lat_lon_to_marker[selectedLatLon];
    if (marker) {
      selectMarker(marker, lat_lons[selectedLatLon]);
    }
  }, [selectedLatLon]);

  React.useEffect(() => {
    year_range = yearRange;
    if (map?.getBounds()) {
      updateYears();
    }
  }, [yearRange]);

  return <div id="map" ref={ref}></div>;
}
