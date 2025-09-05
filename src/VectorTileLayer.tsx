import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.vectorgrid';

interface VectorGridLayer extends L.Layer {
  addTo(map: L.Map): this;
}

declare module 'leaflet' {
  namespace vectorGrid {
    function protobuf(
      url: string,
      options?: VectorTileOptions,
    ): VectorGridLayer;
  }
}

interface StyleOptions {
  fill?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  stroke?: boolean;
  color?: string;
  strokeWidth?: number;
}

interface VectorTileOptions {
  attribution?: string;
  opacity?: number;
  interactive?: boolean;
  style?: Record<string, StyleOptions>;
  maxNativeZoom?: number;
}

interface VectorTileLayerProps {
  url: string;
  attribution?: string;
  opacity?: number;
  style?: Record<string, StyleOptions>;
}

export function VectorTileLayer({
  url,
  attribution,
  opacity = 1,
  style,
}: VectorTileLayerProps) {
  const map = useMap();

  useEffect(() => {
    const vectorTileOptions: VectorTileOptions = {
      attribution: attribution ?? '',
      opacity,
      interactive: false,
      maxNativeZoom: 14,
      style: style ?? {
        water: {
          fill: true,
          fillColor: '#a5bfdd',
          fillOpacity: 1,
          stroke: false,
        },
        admin: {
          stroke: true,
          color: '#cf52d3',
          strokeWidth: 1,
          fill: false,
        },
        landcover: {
          fill: true,
          fillColor: '#d4e5bc',
          fillOpacity: 1,
          stroke: false,
        },
        landuse: {
          fill: true,
          fillColor: '#e6e2d3',
          fillOpacity: 1,
          stroke: false,
        },
        park: {
          fill: true,
          fillColor: '#bdd3c7',
          fillOpacity: 1,
          stroke: false,
        },
        boundary: {
          stroke: true,
          color: '#b99bc8',
          strokeWidth: 1,
          fill: false,
        },
        aeroway: {
          stroke: true,
          color: '#dadbdf',
          strokeWidth: 1,
          fill: false,
        },
        road: {
          stroke: true,
          color: '#fcfcfc',
          strokeWidth: 1,
          fill: false,
        },
        tunnel: {
          stroke: true,
          color: '#f0f0f0',
          strokeWidth: 1,
          fill: false,
        },
        bridge: {
          stroke: true,
          color: '#fcfcfc',
          strokeWidth: 1,
          fill: false,
        },
        railway: {
          stroke: true,
          color: '#a8a8a8',
          strokeWidth: 1,
          fill: false,
        },
        waterway: {
          stroke: true,
          color: '#a5bfdd',
          strokeWidth: 1,
          fill: false,
        },
        building: {
          fill: true,
          fillColor: '#d9d0c9',
          fillOpacity: 1,
          stroke: true,
          color: '#d9d0c9',
          strokeWidth: 0.2,
        },
      },
    };

    const vectorLayer = L.vectorGrid.protobuf(url, vectorTileOptions);

    vectorLayer.addTo(map);

    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [map, url, attribution, opacity, style]);

  return null;
}
