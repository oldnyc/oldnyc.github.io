/** OldNYC Google Map */

import React from 'react';
import { YearRange, isFullTimeRange } from './TimeSlider';
import { MapContainer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import { MapMarkers } from './MapMarkers';
import { VectorTileLayer } from './VectorTileLayer';

export type BoundsChangeFn = (bounds: L.LatLngBounds) => void;

export type MarkerClickFn = (latLon: string) => void;

interface YearToCount {
  [year: string]: number;
}

const DEFAULT_LAT_LNG: LatLngExpression = [40.74421, -73.9737];
const DEFAULT_ZOOM = 15;
const MIN_ZOOM = 10;
const MAX_ZOOM = 16;

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
    <MapContainer
      center={DEFAULT_LAT_LNG}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      id="map"
    >
      <VectorTileLayer
        url="https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
