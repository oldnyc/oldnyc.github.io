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
  selectedLatLng?: string;
  yearRange: YearRange;
  onClickMarker?: MarkerClickFn;
  onLoad?: (map: maplibregl.Map) => void;
  onMove?: (center: [number, number], zoom: number) => void;
}

export function MapLibreMap({
  center,
  zoom,
  minZoom = 10,
  maxZoom = 16,
  selectedLatLng,
  yearRange,
  onClickMarker,
  onLoad,
  onMove,
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
    });

    console.log('set mapRef');
    setMapRef(map);

    map.on('load', () => {
      if (onLoad) {
        onLoad(map);
      }
    });

    map.on('move', () => {
      if (onMove) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMove([center.lng, center.lat], zoom);
      }
    });

    return () => {
      map.remove();
    };
  }, [center, zoom, minZoom, maxZoom, onLoad, onMove]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {mapRef && (
        <MapMarkers
          map={mapRef}
          selectedLatLng={selectedLatLng}
          yearRange={yearRange}
          onClickMarker={onClickMarker}
        />
      )}
    </div>
  );
}
