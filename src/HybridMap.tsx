import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import maplibregl from 'maplibre-gl';
import { MapLibreMap } from './MapLibreMap';
import { MapMarkers } from './MapMarkers';
import { MarkerClickFn } from './map';
import { YearRange } from './TimeSlider';

import MAP_STYLE from './colorful.json';

interface LeafletSyncProps {
  center: LatLngExpression;
  zoom: number;
  onMapReady: (map: L.Map) => void;
}

function LeafletSync({ center, zoom, onMapReady }: LeafletSyncProps) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    map.setView(center, zoom, { animate: false });
  }, [map, center, zoom]);

  return null;
}

interface HybridMapProps {
  center: LatLngExpression;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  selectedLatLon?: string;
  yearRange: YearRange;
  onClickMarker?: MarkerClickFn;
}

export function HybridMap({
  center,
  zoom,
  minZoom,
  maxZoom,
  selectedLatLon,
  yearRange,
  onClickMarker,
}: HybridMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (Array.isArray(center)) {
      return [center[1], center[0]]; // [lng, lat]
    } else {
      return [center.lng, center.lat]; // [lng, lat]
    }
  });
  const [mapZoom, setMapZoom] = useState(zoom);
  const leafletMapRef = useRef<L.Map | null>(null);
  const mapLibreMapRef = useRef<maplibregl.Map | null>(null);
  const syncingRef = useRef(false);

  const handleMapLibreMove = useCallback(
    (center: [number, number], zoom: number) => {
      if (syncingRef.current) return;
      syncingRef.current = true;

      setMapCenter(center);
      setMapZoom(zoom);

      setTimeout(() => {
        syncingRef.current = false;
      }, 100);
    },
    [],
  );

  const handleMapLibreLoad = useCallback((map: maplibregl.Map) => {
    mapLibreMapRef.current = map;
  }, []);

  const handleLeafletMapReady = useCallback((map: L.Map) => {
    leafletMapRef.current = map;
  }, []);

  const leafletCenter: LatLngExpression = [mapCenter[1], mapCenter[0]];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <MapLibreMap
          center={mapCenter}
          zoom={mapZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onLoad={handleMapLibreLoad}
          onMove={handleMapLibreMove}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <MapContainer
          center={leafletCenter}
          zoom={mapZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          zoomControl={false}
          attributionControl={false}
          style={{
            background: 'transparent',
            pointerEvents: 'none',
          }}
        >
          <LeafletSync
            center={leafletCenter}
            zoom={mapZoom}
            onMapReady={handleLeafletMapReady}
          />
          <div style={{ pointerEvents: 'auto' }}>
            <MapMarkers
              onClickMarker={onClickMarker}
              selectedLatLng={selectedLatLon}
              yearRange={yearRange}
            />
          </div>
        </MapContainer>
      </div>
    </div>
  );
}
