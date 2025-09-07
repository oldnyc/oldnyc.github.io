/** OldNYC Google Map */

import React from 'react';
import { YearRange, isFullTimeRange } from './TimeSlider';
import { MapLibreMap } from './MapLibreMap';

export type MarkerClickFn = (latLon: string) => void;

interface YearToCount {
  [year: string]: number;
}

const DEFAULT_LAT_LNG: [number, number] = [-73.9737, 40.74421]; // [lng, lat] for MapLibre
const DEFAULT_ZOOM = 14;
const MIN_ZOOM = 10;
const MAX_ZOOM = 16;

// TODO: make this a little looser
const MAX_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-74.25423, 40.500426],
  [-73.707672, 40.912507],
];

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
  onClickMarker?: MarkerClickFn;
}

// TODO: disable keyboard shortcuts when slideshow is open

export function Map(props: MapProps) {
  const { onClickMarker, selectedLatLon, yearRange } = props;

  const [savedSelectedLatLng, setSavedSelectedLatLng] = React.useState<
    string | undefined
  >(selectedLatLon);

  React.useEffect(() => {
    if (selectedLatLon) {
      setSavedSelectedLatLng(selectedLatLon);
    }
  }, [selectedLatLon]);

  return (
    <div id="map" style={{ width: '100%', height: '100%' }}>
      <MapLibreMap
        center={DEFAULT_LAT_LNG}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={MAX_BOUNDS}
        selectedLatLng={savedSelectedLatLng}
        yearRange={yearRange}
        onClickMarker={onClickMarker}
      />
    </div>
  );
}

// Debugging conveniences
// TODO: restore these
/*
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
*/
