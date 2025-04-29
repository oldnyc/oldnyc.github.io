/** OldNYC Google Map */

import React from 'react';
import { MAP_STYLE } from './map-styles';
import { DEFAULT_YEARS, YearRange, isFullTimeRange } from './TimeSlider';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import { MapMarkers } from './MapMarkers';

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

const DEFAULT_LAT_LNG: LatLngExpression = [40.74421, -73.9737];
const DEFAULT_ZOOM = 15;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

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

  // https://github.com/Leaflet/Leaflet/issues/3178
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
}

export function parseLatLon(lat_lon: string) {
  const ll = lat_lon.split(',');
  return new google.maps.LatLng(parseFloat(ll[0]), parseFloat(ll[1]));
}

export function countPhotos(yearToCounts: YearToCount, yearRange: YearRange) {
  if (isFullTimeRange(yearRange)) {
    // This includes undated photos.
    return Object.values(yearToCounts || {}).reduce((a, b) => a + b, 0);
  } else {
    const [first, last] = yearRange;
    return Object.entries(yearToCounts || {})
      .filter(([y]) => Number(y) > first && Number(y) <= last)
      .map(([, c]) => c)
      .reduce((a, b) => a + b, 0);
  }
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

  const [savedSelectedLatLng, setSavedSelectedLatLng] = React.useState<
    string | undefined
  >(selectedLatLon);

  React.useEffect(() => {
    if (selectedLatLon) {
      setSavedSelectedLatLng(selectedLatLon);
    }
  }, [selectedLatLon]);

  /*
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
*/
  return (
    <MapContainer
      center={DEFAULT_LAT_LNG}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      id="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapMarkers
        onClickMarker={onClickMarker}
        selectedLatLng={savedSelectedLatLng}
        yearRange={yearRange}
      />
    </MapContainer>
  );
}

// Debugging conveniences
/* eslint-disable */
(window as any).getMap = () => {
  const center = map!.getCenter()!;
  const zoom = map!.getZoom();
  return `${center.lat()},${center.lng()},${zoom}`;
};
(window as any).setMap = (str: string) => {
  const [lat, lng, zoom] = str.split(',').map((x) => parseFloat(x));
  map!.setCenter({ lat, lng });
  map!.setZoom(zoom);
};
/* eslint-enable */
