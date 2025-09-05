import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onLoad?: (map: maplibregl.Map) => void;
  onMove?: (center: [number, number], zoom: number) => void;
}

export function MapLibreMap({
  center,
  zoom,
  minZoom = 10,
  maxZoom = 16,
  onLoad,
  onMove,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-vector': {
            type: 'vector',
            tiles: ['https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt'],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'water',
            type: 'fill',
            source: 'osm-vector',
            'source-layer': 'water',
            paint: {
              'fill-color': '#a5bfdd',
              'fill-opacity': 0.7,
            },
          },
          {
            id: 'landuse',
            type: 'fill',
            source: 'osm-vector',
            'source-layer': 'landuse',
            paint: {
              'fill-color': '#e6e2d3',
              'fill-opacity': 0.5,
            },
          },
          {
            id: 'landcover',
            type: 'fill',
            source: 'osm-vector',
            'source-layer': 'landcover',
            filter: ['==', 'class', 'grass'],
            paint: {
              'fill-color': '#d4e5bc',
              'fill-opacity': 0.7,
            },
          },
          {
            id: 'park',
            type: 'fill',
            source: 'osm-vector',
            'source-layer': 'landuse',
            filter: ['in', 'class', 'park', 'cemetery'],
            paint: {
              'fill-color': '#bdd3c7',
              'fill-opacity': 0.8,
            },
          },
          {
            id: 'buildings',
            type: 'fill',
            source: 'osm-vector',
            'source-layer': 'buildings',
            paint: {
              'fill-color': '#d9d0c9',
              'fill-opacity': 0.8,
              'fill-outline-color': '#d9d0c9',
            },
          },
          {
            id: 'roads-outline',
            type: 'line',
            source: 'osm-vector',
            'source-layer': 'roads',
            paint: {
              'line-color': '#e8e8e8',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 1,
                16, 4
              ],
            },
          },
          {
            id: 'roads',
            type: 'line',
            source: 'osm-vector',
            'source-layer': 'roads',
            paint: {
              'line-color': '#fcfcfc',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.5,
                16, 2
              ],
            },
          },
          {
            id: 'waterways',
            type: 'line',
            source: 'osm-vector',
            'source-layer': 'waterways',
            paint: {
              'line-color': '#a5bfdd',
              'line-width': 2,
            },
          },
        ],
      },
      center,
      zoom,
      minZoom,
      maxZoom,
    });

    mapRef.current = map;

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
      mapRef.current = null;
    };
  }, [center, zoom, minZoom, maxZoom, onLoad, onMove]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
}