import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MarkerClickFn } from './map';
import { YearRange } from './TimeSlider';

import MAP_STYLE from './colorful.json';
import { MapMarkers } from './MapMarkers';

interface MapLibreMapProps {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: maplibregl.LngLatBoundsLike;
  selectedLatLng?: string;
  yearRange: YearRange;
  onClickMarker?: MarkerClickFn;
}

export function MapLibreMap({
  center,
  zoom,
  minZoom = 10,
  maxZoom = 16,
  maxBounds,
  selectedLatLng,
  yearRange,
  onClickMarker,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapRef, setMapRef] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE as maplibregl.StyleSpecification,
      center,
      zoom,
      minZoom,
      maxZoom,
      dragRotate: false,
      rollEnabled: false,
      pitchWithRotate: false,
      maxBounds,
    });

    setMapRef(map);

    return () => {
      map.remove();
    };
  }, [center, zoom, minZoom, maxZoom]);

  useEffect(() => {
    mapRef?.setGlobalStateProperty('selectedLatLng', selectedLatLng);
  }, [mapRef, selectedLatLng]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {mapRef && (
        <MapMarkers
          map={mapRef}
          yearRange={yearRange}
          onClickMarker={onClickMarker}
        />
      )}
    </div>
  );
}
