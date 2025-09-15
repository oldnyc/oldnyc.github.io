/** OldNYC Map */

import React from 'react';
import { YearRange, isFullTimeRange } from './TimeSlider';
import { MapLibreMap, useMap } from './MapLibreMap';
import { MapMarkers } from './MapMarkers';
import maplibregl from 'maplibre-gl';
import { parseLatLon } from './photo-info';

export type MarkerClickFn = (latLon: string) => void;

interface YearToCount {
  [year: string]: number;
}

const DEFAULT_LAT_LNG: [number, number] = [-73.9737, 40.74421]; // [lng, lat] for MapLibre
const DEFAULT_ZOOM = 14;
const MIN_ZOOM = 10;
const MAX_ZOOM = 16;

const MAX_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-74.39086950000001, 40.39740575],
  [-73.525486, 41.01552725],
];

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
  defaultCenter?: string;
  selectedLatLon?: string;
  yearRange: YearRange;
  onClickMarker?: MarkerClickFn;
}

// TODO: disable keyboard shortcuts when slideshow is open

export function Map(props: MapProps) {
  const { onClickMarker, selectedLatLon, yearRange, defaultCenter } = props;

  const [savedSelectedLatLng, setSavedSelectedLatLng] = React.useState<
    string | undefined
  >(selectedLatLon);

  React.useEffect(() => {
    if (selectedLatLon) {
      setSavedSelectedLatLng(selectedLatLon);
    }
  }, [selectedLatLon]);

  const center = React.useMemo(() => {
    if (defaultCenter) {
      const [lat, lng] = parseLatLon(defaultCenter);
      return [lng, lat] as [number, number];
    }
    return DEFAULT_LAT_LNG;
  }, [defaultCenter]);

  return (
    <MapLibreMap
      containerId="map"
      containerClassName={
        selectedLatLon ? 'slideshow-open maplibregl-map' : 'maplibregl-map'
      }
      center={center}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={MAX_BOUNDS}
    >
      <MapMarkers
        selectedLatLng={savedSelectedLatLng}
        yearRange={yearRange}
        onClickMarker={onClickMarker}
      />
      <ZoomControl />
    </MapLibreMap>
  );
}

function ZoomControl() {
  const map = useMap();
  React.useEffect(() => {
    if (map) {
      map.addControl(
        new maplibregl.NavigationControl({
          showZoom: true,
          showCompass: false,
        }),
        'top-left',
      );
      // eslint-disable-next-line
      (window as any).map = map;
    }
  }, [map]);
  return null;
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
